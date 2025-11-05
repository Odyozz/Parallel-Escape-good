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

// --- MODIFICATION : Ajout des propriétés `modules` et `syncWindow` ---
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
  // Propriétés ajoutées pour la logique de jeu
  modules: Record<string, any>; // Contiendra l'état des modules et des puzzles
  syncWindow?: {
    // La fenêtre de sync est optionnelle, elle n'existe pas toujours
    isOpen: boolean;
    startedBy?: string;
    startedAt?: any; // Firestore Timestamp
    syncedPlayers?: string[];
  };
}

// --- SUGGESTION : Pour une meilleure organisation, vous pouvez ré-exporter le type User ---
// export type { User } from 'firebase/auth';
// Ainsi, dans GameContext, vous pourriez faire : import { User, Room, Player } from '../utils/room';

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
    players: {
      [user.uid]: playerData,
    },
    // Initialisation des nouvelles propriétés
    modules: {},
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

  if (!roomSnap.exists()) {
    return false;
  }

  const room = roomSnap.data() as Room;

  if (
    room.status === 'running' &&
    Object.keys(room.players).length >= room.requiredPlayers
  ) {
    return false;
  }

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

  if (!roomSnap.exists()) {
    return;
  }

  const room = roomSnap.data() as Room;

  if (room.hostUid === userId && Object.keys(room.players).length > 1) {
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
      endsAt: endsAt,
      paused: false,
    },
    gauges: {
      energy: 50,
      structure: 50,
      stability: 50,
    },
  });
};

export const subscribeToRoom = (
  roomId: string,
  callback: (room: Room | null) => void
) => {
  const roomRef = doc(db, 'rooms', roomId);
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Room);
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

// --- NOUVELLES FONCTIONS POUR LE JEU ---

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

// --- FIN DES NOUVELLES FONCTIONS ---

const generateRoomId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const updateModulesInFirestore = async (
  roomId: string,
  modules: Record<string, any>
): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, { modules });
};
