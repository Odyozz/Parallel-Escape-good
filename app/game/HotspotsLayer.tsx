'use client';
import React from 'react';
import { Hotspot } from '@/app/docs/models';
import HotspotDot from './HotspotDot';

const HotspotsLayer: React.FC<{
  hotspots: Hotspot[];
  onInteract: (h: Hotspot) => void;
}> = ({ hotspots, onInteract }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {hotspots.map((h) => (
        <div key={h.id} className="pointer-events-auto">
          <HotspotDot hotspot={h} onClick={onInteract} />
        </div>
      ))}
    </div>
  );
};

export default HotspotsLayer;
