// contexts/GameContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { doc, onSnapshot } from 'firebase/firestore';

// ✅ importe bien ton client SDK côté client
//   (si l’alias '@/utils/firebase' ne marche pas chez toi, mets un import relatif: '../utils/firebase')
import { db, auth } from '@/utils/firebase';

import type { Phase, RoomId } from '@/app/docs/models';

type GameCtx = {
  roomId: string;
  phase: Phase;
  unlockedRooms: Record<RoomId, boolean>;
  modules: Record<string, any>;
  hotspots: Record<string, any>;
  players: Record<string, any>;
  sendIntent: (kind: string, payload?: any) => Promise<any>;
};

const Ctx = createContext<GameCtx | null>(null);

export const GameProvider: React.FC<{ roomId: string; children: React.ReactNode }> = ({
  roomId,
  children,
}) => {
  const [phase, setPhase] = useState<Phase>('intro');
  const [unlockedRooms, setUnlockedRooms] = useState<Record<RoomId, boolean>>({
    cryo: true,
    energy: true,
    system: false,
    navigation: false,
  });
  const [modules, setModules] = useState<Record<string, any>>({});
  const [hotspots, setHotspots] = useState<Record<string, any>>({});
  const [players, setPlayers] = useState<Record<string, any>>({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'rooms', roomId), (snap) => {
      const d: any = snap.data() || {};
      setPhase(d.phase ?? 'intro');
      setUnlockedRooms(
        d.unlockedRooms ?? { cryo: true, energy: true, system: false, navigation: false }
      );
      setModules(d.modules ?? {});
      setHotspots(d.hotspots ?? {});
      setPlayers(d.players ?? {});
    });
    return () => unsub();
  }, [roomId]);

  const sendIntent = useCallback(
    async (kind: string, payload: any = {}) => {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');

      const res = await fetch('/api/event', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ idToken, roomId, kind, payload }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Event failed');
      return json;
    },
    [roomId]
  );

  const value = useMemo(
    () => ({ roomId, phase, unlockedRooms, modules, hotspots, players, sendIntent }),
    [roomId, phase, unlockedRooms, modules, hotspots, players, sendIntent]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useGame = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useGame must be used inside <GameProvider/>');
  return v;
};
