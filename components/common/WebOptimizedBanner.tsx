// components/common/WebOptimizedBanner.tsx
'use client';

import { useState, useEffect } from 'react';

const WebOptimizedBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkScreenWidth = () => {
      // On affiche la bannière sur les écrans plus petits qu'une tablette
      if (window.innerWidth < 1024) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    checkScreenWidth();
    window.addEventListener('resize', checkScreenWidth);

    return () => window.removeEventListener('resize', checkScreenWidth);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: 'var(--secondary-bg)',
        color: 'var(--text-primary)',
        padding: '12px 20px',
        textAlign: 'center',
        zIndex: 1000,
        borderTop: '1px solid var(--border-color)',
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '0.9rem',
      }}
    >
      <span style={{ marginRight: '15px' }}>
        🖥️ Ce jeu est optimisé pour une expérience sur ordinateur.
      </span>
      <button
        onClick={() => setIsVisible(false)}
        style={{
          background: 'none',
          border: '1px solid var(--text-secondary)',
          color: 'var(--text-secondary)',
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.8rem',
        }}
      >
        Fermer
      </button>
    </div>
  );
};

export default WebOptimizedBanner;
