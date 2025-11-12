'use client';

import React from 'react';
import { GameProvider } from '@/contexts/GameContext';
import GameView from '@/components/game/GameView';
import useScrollLock from '@/app/hooks/useScrollLock';

export default function GamePageClient({ roomId }: { roomId: string }) {
  // bloque le scroll UNIQUEMENT pendant la mission
  useScrollLock(true);

  return (
    <div
      id="game-overlay"
      className="fixed inset-0 z-[1000]" // au-dessus de tout le site
      style={{ isolation: 'isolate' }}   // nouveau contexte de stacking sûr
    >
      <GameProvider roomId={roomId}>
        <GameView />
      </GameProvider>
    </div>
  );
}
