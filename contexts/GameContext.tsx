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
import { useAuth } from './AuthContext';
import { Room, Player } from '../utils/room';
import { initializeModules } from '../app/docs/puzzles'; // init déclarative des puzzles

// --- Interface du contexte ---
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

const roomsOrder: Player['currentRoom'][] = ['energy', 'system', 'navigation'];

export const GameProvider = ({ children }: GameProviderProps) => {
  const { room, currentPlayer, isHost } = useRoom();
  const router = useRouter();

  // --- États ---
  const [timeLeft, setTimeLeft] = useState(0);
  const [lyraMessages, setLyraMessages] = useState<string[]>([]);
  const [modules, setModules] = useState<Room['modules'] | null>(null);
  const [syncWindow, setSyncWindow] = useState<Room['syncWindow'] | null>(null);

  // --- Auth ---
  const { user } = useAuth();

  const currentRoom = currentPlayer?.currentRoom || 'energy';
  const isPaused = room?.timer.paused || false;

  // --- Initialisation des modules au lancement ---
  useEffect(() => {
    if (!room || room.status !== 'running') return;

    // ✅ Vérifie si les modules sont vraiment absents ou non initialisés
    const modulesAreEmpty =
      !room.modules ||
      (typeof room.modules === 'object' &&
        Object.keys(room.modules || {}).length === 0);

    if (modulesAreEmpty) {
      console.log('[GameContext] Initializing modules for phase', room.phase);
      const initialModules = initializeModules(room.phase);
      updateModulesInFirestore(room.id, initialModules);
    }
  }, [room?.id, room?.status, room?.phase]); // ✅ dépendances limitées → plus de boucle infinie

  // --- Premier message LYRA ---
  useEffect(() => {
    if (!room || room.status !== 'running' || lyraMessages.length > 0) return;

    const initialMessage: Record<Room['phase'], string> = {
      intro:
        'Bienvenue à bord. Réveil complet. Diagnostic en cours... Commencez par la section ÉNERGIE.',
      act1:
        'Énergie auxiliaire en ligne. Diagnostiquez les systèmes pour stabiliser le vaisseau.',
      act2:
        'Systèmes stabilisés. Attention, surchauffe du réacteur en cours.',
      act3:
        'Réacteur stabilisé. Préparez-vous à la correction de trajectoire.',
      epilogue: 'Mission accomplie. Vous avez sauvé CryoStation 9.',
    };

    setLyraMessages([initialMessage[room.phase] || '']);
  }, [room?.id, room?.status, room?.phase, lyraMessages.length]);

  // --- Envoi d’intentions vers l’API ---
  const sendIntent = useCallback(
    async (kind: string, payload: any) => {
      if (!user || !room)
        return { ok: false, errors: ['User or room not available'] };

      const idToken = await user.getIdToken();
      const res = await fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, roomId: room.id, kind, payload }),
      });
      const result = await res.json();

      if (result.ok && result.effects) {
        result.effects.forEach((effect: any) => {
          if (effect.type === 'emitLyraMessage' && effect.message) {
            setLyraMessages((prev) => [...prev.slice(-4), effect.message]);
          }
        });
      }

      return result;
    },
    [user?.uid, room?.id]
  );

  // --- Sync des états room -> local ---
  useEffect(() => {
    if (!room) return;
    setModules(room.modules || null);
    setSyncWindow(room.syncWindow || null);
  }, [room?.modules, room?.syncWindow]);

  // --- Timer global (support Timestamp OU Date) ---
  useEffect(() => {
    if (!room || room.status !== 'running' || isPaused) {
      setTimeLeft(0);
      return;
    }

    const getEndsAtMs = () => {
      const v = room.timer?.endsAt;
      if (!v) return undefined;
      if (typeof v?.toMillis === 'function') return v.toMillis();
      const ms = new Date(v as any).getTime();
      return Number.isFinite(ms) ? ms : undefined;
    };

    const endsAtMs = getEndsAtMs();
    if (!endsAtMs) {
      setTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = endsAtMs - now;
      if (diff > 0) {
        setTimeLeft(Math.floor(diff / 1000));
      } else {
        setTimeLeft(0);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room?.id, room?.status, room?.timer?.endsAt, isPaused]);

  // --- Pause automatique selon présence / nombre exact ---
  useEffect(() => {
    if (!room || !isHost) return;

    const connected = Object.values(room.players || {}).filter(
      (p) => p?.connected
    ).length;

    const shouldPause =
      room.status === 'running' && connected !== room.requiredPlayers;

    if (shouldPause && !room.timer.paused) {
      setTimerPaused(room.id, true);
    } else if (!shouldPause && room.timer.paused) {
      setTimerPaused(room.id, false);
    }
  }, [
    room?.id,
    room?.status,
    room?.players,
    room?.requiredPlayers,
    room?.timer?.paused,
    isHost,
  ]);

  // --- Navigation entre salles ---
  const changeRoom = (direction: 'left' | 'right') => {
    if (!currentPlayer || !room || isPaused) return;

    const currentIndex = roomsOrder.indexOf(currentRoom);
    const nextIndex =
      direction === 'left'
        ? (currentIndex - 1 + roomsOrder.length) % roomsOrder.length
        : (currentIndex + 1) % roomsOrder.length;

    changePlayerRoom(room.id, currentPlayer.uid, roomsOrder[nextIndex]);
  };

  // --- Phase suivante (outil host) ---
  const forceNextPhase = () => {
    if (!isHost || !room) return;
    const phases: Room['phase'][] = [
      'intro',
      'act1',
      'act2',
      'act3',
      'epilogue',
    ];
    const i = phases.indexOf(room.phase);
    const next = phases[i + 1];
    if (next) setGamePhase(room.id, next);
  };

  // --- Reprendre (host) ---
  const resumeGame = () => {
    if (!isHost || !room) return;
    setTimerPaused(room.id, false);
  };

  const value: GameContextType = {
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
