'use client';
import React, { useState } from 'react';
import { Hotspot, ModuleInstance } from '@/app/docs/models';
import HotspotsLayer from './HotspotsLayer';
import ModulePopup from './ModulePopup';

const RoomScene: React.FC<{
  background: string;
  hotspots: Hotspot[];
  modules: Record<string, ModuleInstance>;
}> = ({ background, hotspots, modules }) => {
  const [activeModule, setActiveModule] = useState<ModuleInstance | null>(null);
  const src = background.startsWith('/') ? background : `/${background}`;

  const handleInteract = (h: Hotspot) => {
    if (h.moduleId && modules[h.moduleId]) setActiveModule(modules[h.moduleId]);
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* BACKGROUND (z=0) */}
      <img
        src={src}
        alt="Room background"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        draggable={false}
      />

      {/* HOTSPOTS (z=60) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 60 }}>
        <HotspotsLayer hotspots={hotspots} onInteract={handleInteract} />
      </div>

      {/* POPUP (z=80) */}
      {activeModule && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 80 }}>
          <ModulePopup module={activeModule} onClose={() => setActiveModule(null)} />
        </div>
      )}
    </div>
  );
};

export default RoomScene;
