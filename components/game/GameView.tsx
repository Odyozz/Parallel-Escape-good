// components/game/GameView.tsx
'use client';

import React from 'react';
import RoomScene from '@/app/game/RoomScene';
import LyraBar from '@/app/game/LyraBar';
import type { ModuleInstance, Hotspot } from '@/app/docs/models';

const EnergyAct1Hotspots: Hotspot[] = [
  { id: 'mod_reactor_panel', roomId: 'energy', x: 0.62, y: 0.58, type: 'puzzle',   title: 'Panneau du réacteur',   moduleId: 'numeric_pad',       visible: true },
  { id: 'mod_power_bypass',  roomId: 'energy', x: 0.40, y: 0.62, type: 'puzzle',   title: 'Shunt d’alimentation',  moduleId: 'power_bypass',     visible: true },
  { id: 'mod_spectral',      roomId: 'energy', x: 0.22, y: 0.44, type: 'clue',     title: 'Console spectrale',     moduleId: 'spectral_console', visible: true },
  { id: 'log_terminal',      roomId: 'energy', x: 0.18, y: 0.70, type: 'clue',     title: 'Terminal de logs',      moduleId: 'log_viewer',       visible: true },
  { id: 'debug_center',      roomId: 'energy', x: 0.5,  y: 0.5,  type: 'ambience', title: 'DEBUG center',          visible: true },
];

export const GameView: React.FC = () => {
  const modules: Record<string, ModuleInstance> = {
    numeric_pad:      { id: 'numeric_pad',      type: 'numeric_pad',      state: 'available' },
    log_viewer:       { id: 'log_viewer',       type: 'log_viewer',       state: 'available' },
    spectral_console: { id: 'spectral_console', type: 'spectral_console', state: 'available' },
    power_bypass:     { id: 'power_bypass',     type: 'power_bypass',     state: 'available' },
  };

  return (
    <div className="absolute inset-0">
      <RoomScene
        background="/images/rooms/energy_bg.jpg"
        hotspots={EnergyAct1Hotspots}
        modules={modules}
      />

      {/* Lyra – message de test avec effet typewriter */}
      <LyraBar
      message="Réacteur principal inactif. Protocole B7 requis."
      speedMs={20}
      />

    </div>
  );
};

export default GameView;
