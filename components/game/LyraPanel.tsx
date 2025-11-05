// components/game/LyraPanel.tsx

'use client';

import { useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';

const LyraPanel = () => {
  // On utilise le GameContext pour récupérer les messages de LYRA
  const { lyraMessages } = useGame();

  // On affiche le dernier message de la liste
  const lastMessage = lyraMessages[lyraMessages.length - 1];

  // S'il n'y a pas de message, on n'affiche rien
  if (!lastMessage) {
    return null;
  }

  return (
    <div className="lyra-panel">
      <p>{lastMessage}</p>
      <style jsx>{`
        .lyra-panel {
          position: fixed; // On utilise fixed pour qu'il reste en bas
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.85);
          border: 1px solid var(--accent-color);
          border-left: 5px solid var(--accent-color);
          padding: 15px 25px;
          max-width: 600px;
          width: 90%;
          text-align: center;
          color: var(--text-primary);
          font-style: italic;
          font-size: 1rem;
          text-shadow: 0 0 10px var(--accent-color);
          // On utilise une animation d'apparition plus discrète
          animation: slideUp 0.5s ease-out;
          // On s'assure qu'il est au-dessus des autres éléments
          z-index: 100;
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateX(-50%) translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(-50%) translateY(0); 
          }
        }
      `}</style>
    </div>
  );
};

export default LyraPanel;
