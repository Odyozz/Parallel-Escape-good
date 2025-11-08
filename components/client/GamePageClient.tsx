'use client';

import React from 'react';
import { GameProvider } from '@/contexts/GameContext';
import GameView from '@/components/game/GameView';

export default function GamePageClient({ roomId }: { roomId: string }) {
  return (
    <GameProvider roomId={roomId}>
      <GameView />
    </GameProvider>
  );
}
