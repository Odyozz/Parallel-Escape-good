// utils/room.ts

import { deleteField } from 'firebase/firestore';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';

export interface Player {
  uid: string;
  displayName: string;
  avatar: string;
  ready: boolean;
  connected: boolean;
  lastSeenAt: any;
  joinedAt: any;
  currentRoom: 'energy' | 'system' | 'navigation';
}

export interface Room {
  id: string;
  scenarioId: string;
  hostUid: string;
  status: 'lobby' | 'running' | 'paused' | 'ended';
  createdAt: any;
  maxPlayers: number;
  requiredPlayers: number;
  phase: 'intro' | 'act1' | 'act2' | 'act3' | 'epilogue';
  timer: { endsAt: any; paused: boolean };
  gauges: { energy: number; structure: number; stability: number };
  players: Record<string, Player>;
  // ⚠️ modules peut être absent ou null au moment de la création.
  modules?: Record<string, any> | null;
  syncWindow?: {
    isOpen: boolean;
    startedBy?: string;
    startedAt?: any; // Firestore Timestamp
    syncedPlayers?: string[];
  };
}

// ───────────────────────────────
// Helpers
// ───────────────────────────────
const generateRoomId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const countPlayers = (players: Record<string, Player> | undefined) =>
  players ? Object.keys(players).length : 0;

// ───────────────────────────────
// Room lifecycle
// ───────────────────────────────
export const createRoom = async (
  user: User,
  scenarioId: string,
  requiredPlayers: number
): Promise<string> => {
  const roomId = generateRoomId();

  const playerData: Player = {
    uid: user.uid,
    displayName: user.displayName || 'Joueur Anonyme',
    avatar: user.photoURL || '/images/default-avatar.png',
    ready: false,
    connected: true,
    lastSeenAt: serverTimestamp(),
    joinedAt: serverTimestamp(),
    currentRoom: 'energy',
  };

  const roomData: Omit<Room, 'id'> = {
    scenarioId,
    hostUid: user.uid,
    status: 'lobby',
    createdAt: serverTimestamp(),
    maxPlayers: 4,
    requiredPlayers,
    phase: 'intro',
    timer: { endsAt: null, paused: false },
    gauges: { energy: 100, structure: 100, stability: 100 },
    players: { [user.uid]: playerData },
    // 🔑 IMPORTANT : laisser modules null (ou omis) pour que GameContext déclenche l'initialisation.
    modules: null,
    syncWindow: { isOpen: false },
  };

  await setDoc(doc(db, 'rooms', roomId), roomData);
  return roomId;
};

export const joinRoom = async (
  roomId: string,
  user: User
): Promise<boolean> => {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return false;

  const room = roomSnap.data() as Room;

  // Interdit de rejoindre une partie déjà en cours
  if (room.status === 'running') return false;

  // Capacité stricte : ne pas dépasser requiredPlayers
  const currentCount = countPlayers(room.players);
  if (currentCount >= room.requiredPlayers) return false;

  // Si déjà présent, simplement réactiver la présence
  if (room.players[user.uid]) {
    await updateDoc(roomRef, {
      [`players.${user.uid}.connected`]: true,
      [`players.${user.uid}.lastSeenAt`]: serverTimestamp(),
    });
    return true;
  }

  const playerData: Player = {
    uid: user.uid,
    displayName: user.displayName || 'Joueur Anonyme',
    avatar: user.photoURL || '/images/default-avatar.png',
    ready: false,
    connected: true,
    lastSeenAt: serverTimestamp(),
    joinedAt: serverTimestamp(),
    currentRoom: 'energy',
  };

  await updateDoc(roomRef, {
    [`players.${user.uid}`]: playerData,
  });

  return true;
};

export const leaveRoom = async (
  roomId: string,
  userId: string
): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return;

  const room = roomSnap.data() as Room;

  if (room.hostUid === userId && countPlayers(room.players) > 1) {
    const remainingPlayers = Object.keys(room.players).filter(
      (uid) => uid !== userId
    );
    const newHost = remainingPlayers.sort((a, b) => {
      const playerA = room.players[a];
      const playerB = room.players[b];
      return playerA.joinedAt.toMillis() - playerB.joinedAt.toMillis();
    })[0];

    await updateDoc(roomRef, {
      hostUid: newHost,
      [`players.${userId}`]: deleteField(),
    });
  } else {
    await updateDoc(roomRef, {
      [`players.${userId}`]: deleteField(),
    });
  }
};

export const updatePlayerReady = async (
  roomId: string,
  userId: string,
  ready: boolean
): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    [`players.${userId}.ready`]: ready,
  });
};

export const startGame = async (roomId: string): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    status: 'running',
    'timer.paused': false,
  });
};

export const startGameFromLobby = async (roomId: string): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  const gameDuration = 30 * 60; // 30 minutes en secondes
  const endsAt = new Date(Date.now() + gameDuration * 1000);

  await updateDoc(roomRef, {
    status: 'running',
    phase: 'intro',
    timer: {
      endsAt,
      paused: false,
    },
    gauges: {
      energy: 50,
      structure: 50,
      stability: 50,
    },
    // on laisse modules tel quel (null) : il sera initialisé par GameContext au premier rendu
  });
};

export const subscribeToRoom = (
  roomId: string,
  callback: (room: Room | null) => void
) => {
  const roomRef = doc(db, 'rooms', roomId);
  return onSnapshot(roomRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() } as Room);
    } else {
      callback(null);
    }
  });
};

export const updatePlayerPresence = async (
  roomId: string,
  userId: string
): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    [`players.${userId}.connected`]: true,
    [`players.${userId}.lastSeenAt`]: serverTimestamp(),
  });
};

// ───────────────────────────────
// Game helpers
// ───────────────────────────────
export const changePlayerRoom = async (
  roomId: string,
  playerId: string,
  newRoom: Player['currentRoom']
): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    [`players.${playerId}.currentRoom`]: newRoom,
    [`players.${playerId}.lastSeenAt`]: serverTimestamp(),
  });
};

export const setGamePhase = async (
  roomId: string,
  phase: Room['phase']
): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, { phase });
};

export const setTimerPaused = async (
  roomId: string,
  paused: boolean
): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, { 'timer.paused': paused });
};

export const updateGauges = async (
  roomId: string,
  gauges: Partial<Room['gauges']>
): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, { gauges });
};

export const updateModulesInFirestore = async (
  roomId: string,
  modules: Record<string, any>
): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, { modules });
};
