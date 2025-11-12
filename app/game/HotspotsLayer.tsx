'use client';
import React from 'react';
import { Hotspot } from '@/app/docs/models';
import HotspotDot from './HotspotDot';

const HotspotsLayer: React.FC<{
  hotspots: Hotspot[];
  onInteract: (h: Hotspot) => void;
}> = ({ hotspots, onInteract }) => {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60 }}>
      {hotspots.map((h) => (
        <HotspotDot key={h.id} hotspot={h} onClick={onInteract} />
      ))}
    </div>
  );
};

export default HotspotsLayer;
