'use client';
import React from 'react';
import { Hotspot } from '@/app/docs/models';

const HotspotDot: React.FC<{
  hotspot: Hotspot;
  onClick: (h: Hotspot) => void;
}> = ({ hotspot, onClick }) => {
  if (!hotspot.visible) return null;

  const color =
    hotspot.type === 'puzzle'   ? '#3B82F6' :
    hotspot.type === 'clue'     ? '#34D399' :
    hotspot.type === 'lure'     ? '#EF4444' :
    hotspot.type === 'ambience' ? '#F59E0B' :
    '#9CA3AF';

  return (
    <button
      type="button"
      onClick={() => onClick(hotspot)}
      title={hotspot.title}
      aria-label={hotspot.title}
      style={{
        position: 'absolute',
        left: `${hotspot.x * 100}%`,
        top: `${hotspot.y * 100}%`,
        transform: 'translate(-50%, -50%)',
        width: 22,
        height: 22,
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: '0 0 0 2px rgba(255,255,255,0.7)',
        cursor: 'pointer',
        zIndex: 70,
      }}
    />
  );
};

export default HotspotDot;
