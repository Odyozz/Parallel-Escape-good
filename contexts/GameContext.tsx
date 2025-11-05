// contexts/GameContext.tsx

'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useRoom } from './RoomContext';
import {
  changePlayerRoom,
  setGamePhase,
  setTimerPaused,
  updateModulesInFirestore,
} from '../utils/room';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { Room, Player } from '../utils/room';
import { useAuth } from './AuthContext';
import { initializeModules } from '../app/docs/puzzles'; // Import de la fonction d'initialisation

// --- Mise à jour de l'interface du contexte ---
interface GameContextType {
  currentRoom: 'energy' | 'system' | 'navigation';
  changeRoom: (direction: 'left' | 'right') => void;
  forceNextPhase: () => void;
  resumeGame: () => void;
  isPaused: boolean;
  timeLeft: number;
  sendIntent: (
    kind: string,
    payload: any
  ) => Promise<{ ok: boolean; effects?: any[]; errors?: string[] }>;
  lyraMessages: string[];
  modules: Room['modules'] | null;
  syncWindow: Room['syncWindow'] | null;
}

const GameContext = createContext<GameContextType>({
  currentRoom: 'energy',
  changeRoom: () => {},
  forceNextPhase: () => {},
  resumeGame: () => {},
  isPaused: false,
  timeLeft: 0,
  sendIntent: async () => ({ ok: false, errors: ['Context not initialized'] }),
  lyraMessages: [],
  modules: null,
  syncWindow: null,
});

export const useGame = () => useContext(GameContext);

interface GameProviderProps {
  children: ReactNode;
}

const rooms: Player['currentRoom'][] = ['energy', 'system', 'navigation'];

export const GameProvider = ({ children }: GameProviderProps) => {
  const { room, currentPlayer, isHost } = useRoom();
  const router = useRouter();

  // --- États ---
  const [timeLeft, setTimeLeft] = useState(0);
  const [lyraMessages, setLyraMessages] = useState<string[]>([]);
  const [modules, setModules] = useState<Room['modules'] | null>(null);
  const [syncWindow, setSyncWindow] = useState<Room['syncWindow'] | null>(null);

  // --- Authentification ---
  const { user } = useAuth();

  const currentRoom = currentPlayer?.currentRoom || 'energy';
  const isPaused = room?.timer.paused || false;

  // --- AJOUT : Effet pour initialiser les modules au lancement de la partie ---
  useEffect(() => {
    if (room && room.status === 'running' && !room.modules) {
      console.log('GameContext: Initializing modules for phase', room.phase);
      const initialModules = initializeModules(room.phase);
      updateModulesInFirestore(room.id, initialModules);
    }
  }, [room]); // Se déclenche quand `room` change

  // --- AJOUT : Effet pour envoyer le premier message de LYRA au démarrage ---
  useEffect(() => {
    if (room && room.status === 'running' && lyraMessages.length === 0) {
      const initialMessage = {
        intro:
          'Bienvenue à bord. Réveil complet. Diagnostic en cours... Commencez par la section ÉNERGIE.',
        act1: 'Énergie auxiliaire en ligne. Diagnostiquez les systèmes pour stabiliser le vaisseau.',
        act2: 'Systèmes stabilisés. Attention, surchauffe du réacteur en cours.',
        act3: 'Réacteur stabilisé. Préparez-vous à la correction de trajectoire.',
        epilogue: 'Mission accomplie. Vous avez sauvé CryoStation 9.',
      };
      setLyraMessages([initialMessage[room.phase] || '']);
    }
  }, [room, lyraMessages.length]); // Se déclenche quand `room` change ou que les messages sont vidés

  // --- Stabilisation du useCallback ---
  const sendIntent = useCallback(
    async (kind: string, payload: any) => {
      if (!user || !room)
        return { ok: false, errors: ['User or room not available'] };

      const idToken = await user.getIdToken();
      const response = await fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, roomId: room.id, kind, payload }),
      });
      const result = await response.json();

      if (result.ok && result.effects) {
        result.effects.forEach((effect: any) => {
          if (effect.type === 'emitLyraMessage') {
            setLyraMessages((prev) => [...prev.slice(-4), effect.message]);
          }
        });
      }

      return result;
    },
    [user?.uid, room?.id] // Dépendances stables
  );

  // --- Effet pour synchroniser les états ---
  useEffect(() => {
    if (!room) return;
    setModules(room.modules || null);
    setSyncWindow(room.syncWindow || null);
  }, [room]);

  // --- Logique du timer ---
  useEffect(() => {
    if (!room || room.status !== 'running' || isPaused) {
      setTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const endsAt = room.timer.endsAt.toMillis();
      const difference = endsAt - now;

      if (difference > 0) {
        setTimeLeft(Math.floor(difference / 1000));
      } else {
        setTimeLeft(0);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room, isPaused]);

  // --- Logique de pause automatique ---
  useEffect(() => {
    if (!room || !isHost) return;

    const allPlayersConnected = Object.values(room.players).every(
      (p) => p.connected
    );
    const requiredPlayersConnected =
      Object.values(room.players).filter((p) => p.connected).length ===
      room.requiredPlayers;

    if (
      room.status === 'running' &&
      (!allPlayersConnected || !requiredPlayersConnected)
    ) {
      setTimerPaused(room.id, true);
    } else if (
      room.status === 'running' &&
      isPaused &&
      allPlayersConnected &&
      requiredPlayersConnected
    ) {
      setTimerPaused(room.id, false);
    }
  }, [room, isHost, isPaused]);

  const changeRoom = (direction: 'left' | 'right') => {
    if (!currentPlayer || !room || isPaused) return;

    const currentIndex = rooms.indexOf(currentRoom);
    let nextIndex;
    if (direction === 'left') {
      nextIndex = (currentIndex - 1 + rooms.length) % rooms.length;
    } else {
      nextIndex = (currentIndex + 1) % rooms.length;
    }

    changePlayerRoom(room.id, currentPlayer.uid, rooms[nextIndex]);
  };

  const forceNextPhase = () => {
    if (!isHost || !room) return;
    const phases: Room['phase'][] = [
      'intro',
      'act1',
      'act2',
      'act3',
      'epilogue',
    ];
    const currentIndex = phases.indexOf(room.phase);
    const nextPhase = phases[currentIndex + 1];
    if (nextPhase) {
      setGamePhase(room.id, nextPhase);
    }
  };

  const resumeGame = () => {
    if (!isHost || !room) return;
    setTimerPaused(room.id, false);
  };

  const value = {
    currentRoom,
    changeRoom,
    forceNextPhase,
    resumeGame,
    isPaused,
    timeLeft,
    sendIntent,
    lyraMessages,
    modules,
    syncWindow,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
