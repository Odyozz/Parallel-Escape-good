'use client';
import React, { useState } from 'react';
import { Hotspot, ModuleInstance } from '@/app/docs/models';
import HotspotsLayer from './HotspotsLayer';
import ModulePopup from './ModulePopup';
import Image from 'next/image';

const RoomScene: React.FC<{
  background: string;
  hotspots: Hotspot[];
  modules: Record<string, ModuleInstance>;
}> = ({ background, hotspots, modules }) => {
  const [activeModule, setActiveModule] = useState<ModuleInstance | null>(null);

  const handleInteract = (h: Hotspot) => {
    if (h.moduleId && modules[h.moduleId]) {
      setActiveModule(modules[h.moduleId]);
    } else {
      console.log('Interaction sans module:', h.id);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Image src={background} alt="Room background" fill className="object-cover" />
      <HotspotsLayer hotspots={hotspots} onInteract={handleInteract} />
      <ModulePopup module={activeModule ?? undefined} onClose={() => setActiveModule(null)} />
    </div>
  );
};

export default RoomScene;
