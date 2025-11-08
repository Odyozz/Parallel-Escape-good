'use client';

import React from 'react';
import RoomScene from '@/app/game/RoomScene';
import LyraBar   from '@/app/game/LyraBar';
import type { ModuleInstance } from '@/app/docs/models';

const EnergyAct1Hotspots = [
  { id: 'reactor_panel', roomId: 'energy', x: 0.42, y: 0.58, type: 'puzzle', title: 'Panneau du réacteur', moduleId: 'numeric_pad', visible: true },
  { id: 'log_terminal',  roomId: 'energy', x: 0.22, y: 0.64, type: 'clue',   title: 'Terminal de logs',    moduleId: 'log_viewer',  visible: true },
];

export const GameView: React.FC = () => {
  const modules: Record<string, ModuleInstance> = {
    numeric_pad: { id: 'numeric_pad', type: 'numeric_pad', state: 'available' },
    log_viewer:  { id: 'log_viewer',  type: 'log_viewer',  state: 'available' },
  };
  return (
    <div className="relative w-full h-screen bg-black">
      <RoomScene background="/images/rooms/energy_bg.jpg" hotspots={EnergyAct1Hotspots as any} modules={modules} />
      <LyraBar message="Réacteur principal inactif. Protocole B7 requis." />
    </div>
  );
};

export default GameView;
