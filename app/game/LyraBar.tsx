'use client';
import React, { useEffect, useState } from 'react';

type LyraBarProps = {
  message?: string;
  speedMs?: number; // durée entre 2 caractères
};

const LyraBar: React.FC<LyraBarProps> = ({ message, speedMs = 20 }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    // reset à chaque nouveau message
    if (!message) {
      setDisplayed('');
      return;
    }

    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setDisplayed(message.slice(0, i));
      if (i >= message.length) {
        clearInterval(interval);
      }
    }, speedMs);

    // cleanup
    return () => clearInterval(interval);
  }, [message, speedMs]);

  if (!message) return null;

  return (
    <div
      className="fixed left-1/2 bottom-6 -translate-x-1/2 z-[1200] px-3"
      aria-live="polite"
    >
      <div
        className="backdrop-blur-md bg-black/60 border border-cyan-400/40
                   rounded-2xl shadow-lg shadow-cyan-400/20
                   max-w-4xl w-[min(92vw,800px)] px-6 py-4 text-center
                   text-cyan-100 font-medium tracking-wide"
        style={{ textShadow: '0 0 8px rgba(0,255,255,0.25)' }}
      >
        <span className="text-cyan-300 mr-2 font-semibold">LYRA :</span>
        <span className="font-[Orbitron,ui-monospace,monospace]">
          {displayed}
        </span>
      </div>
    </div>
  );
};

export default LyraBar;
