// contexts/RoomContext.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import {
  Room,
  Player,
  subscribeToRoom,
  updatePlayerReady,
  updatePlayerPresence,
  leaveRoom,
  startGame,
} from '../utils/room';
import { doc, updateDoc } from 'firebase/firestore'; // Import pour la mise à jour du statut
import { db } from '../utils/firebase'; // Import de l'instance db

interface RoomContextType {
  room: Room | null;
  loading: boolean;
  error: string | null;
  isHost: boolean;
  currentPlayer: Player | null;
  toggleReady: () => void;
  startGame: () => void;
  leaveRoom: () => void;
}

const RoomContext = createContext<RoomContextType>({
  room: null,
  loading: true,
  error: null,
  isHost: false,
  currentPlayer: null,
  toggleReady: () => {},
  startGame: () => {},
  leaveRoom: () => {},
});

export const useRoom = () => useContext(RoomContext);

interface RoomProviderProps {
  children: ReactNode;
  roomId: string;
}

export const RoomProvider = ({ children, roomId }: RoomProviderProps) => {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setError('ID de room invalide');
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToRoom(roomId, (roomData) => {
      if (roomData) {
        setRoom(roomData);
        setError(null);

        // --- NOUVELLE LOGIQUE DE PAUSE/REPRISE ---
        const roomRef = doc(db, 'rooms', roomId);
        const allPlayersConnected = Object.values(roomData.players).every(
          (p) => p.connected
        );

        // Si la partie est en cours et qu'un joueur se déconnecte, on met en pause
        if (roomData.status === 'running' && !allPlayersConnected) {
          updateDoc(roomRef, { status: 'paused' });
        }

        // Si la partie est en pause et que tout le monde est reconnecté, on relance
        if (roomData.status === 'paused' && allPlayersConnected) {
          updateDoc(roomRef, { status: 'running' });
        }
        // --- FIN DE LA NOUVELLE LOGIQUE ---
      } else {
        setRoom(null);
        setError("Cette room n'existe pas ou a été supprimée");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    if (!room || !user) return;

    // Mettre à jour la présence du joueur toutes les 30 secondes
    const presenceInterval = setInterval(() => {
      updatePlayerPresence(room.id, user.uid);
    }, 30000);

    // Mettre à jour la présence immédiatement
    updatePlayerPresence(room.id, user.uid);

    return () => clearInterval(presenceInterval);
  }, [room, user]);

  const isHost = user ? room?.hostUid === user.uid : false;
  const currentPlayer = user ? room?.players[user.uid] || null : null;

  const toggleReady = () => {
    if (!currentPlayer || !room) return;
    updatePlayerReady(room.id, currentPlayer.uid, !currentPlayer.ready);
  };

  const handleStartGame = () => {
    if (!room) return;
    startGame(room.id);
  };

  const handleLeaveRoom = () => {
    if (!user || !room) return;
    leaveRoom(room.id, user.uid);
  };

  const value = {
    room,
    loading,
    error,
    isHost,
    currentPlayer,
    toggleReady,
    startGame: handleStartGame,
    leaveRoom: handleLeaveRoom,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};
