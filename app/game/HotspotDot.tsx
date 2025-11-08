'use client';
import React from 'react';
import { Hotspot } from '@/app/docs/models';

const HotspotDot: React.FC<{
  hotspot: Hotspot;
  onClick: (h: Hotspot) => void;
}> = ({ hotspot, onClick }) => {
  if (!hotspot.visible) return null;
  const color =
    hotspot.type === 'puzzle' ? 'bg-blue-500'
    : hotspot.type === 'clue' ? 'bg-green-400'
    : hotspot.type === 'lure' ? 'bg-red-500'
    : 'bg-gray-400';
  return (
    <div
      className={`absolute ${color} rounded-full animate-pulse cursor-pointer`}
      style={{
        left: `${hotspot.x * 100}%`,
        top: `${hotspot.y * 100}%`,
        width: '1.2rem',
        height: '1.2rem',
        transform: 'translate(-50%, -50%)',
      }}
      onClick={() => onClick(hotspot)}
    />
  );
};

export default HotspotDot;
