// components/puzzles/LeverHoldPuzzle.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext'; // 1. On utilise le hook mis à jour

export const LeverHoldPuzzle: React.FC = () => {
  const { sendIntent, modules, currentRoom } = useGame(); // 1. On récupère les bonnes données
  const [isHolding, setIsHolding] = useState(false);
  const [holdStartTime, setHoldStartTime] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 2. Récupération de l'état du puzzle depuis le contexte global
  const puzzleState = modules?.energy?.puzzles?.ACT2_ENERGY_LEVER;
  const isSolved = puzzleState?.state === 'solved';
  const isLocked = puzzleState?.state === 'locked';

  // Le puzzle n'est jouable que si le joueur est dans la bonne salle et que le puzzle n'est pas résolu
  const isPlayable = currentRoom === 'energy' && !isSolved && !isLocked;

  const handleMouseDown = () => {
    if (!isPlayable || isHolding) return;

    setIsHolding(true);
    setHoldStartTime(Date.now());

    // 3. On utilise un timeout pour vérifier le maintien
    timeoutRef.current = setTimeout(() => {
      // Le temps est écoulé, on envoie l'intention de succès
      setIsHolding(false);
      sendIntent('ACT2_ENERGY_LEVER', { action: 'complete' });
    }, 2000); // 2 secondes de maintien
  };

  const handleMouseUp = () => {
    if (!isHolding) return;

    setIsHolding(false);

    // 4. Si le joueur lâche avant la fin, on annule le timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Nettoyage du timeout au démontage du composant
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="puzzle-container">
      <h3>Maintien de flux</h3>
      <p>
        Maintenez le levier pendant 2 secondes pour stabiliser le flux
        énergétique.
      </p>

      {isLocked && (
        <p className="puzzle-locked-message">
          Ce puzzle n'est pas encore accessible.
        </p>
      )}

      <div className="lever-container">
        <div
          className={`lever ${isHolding ? 'active' : ''} ${
            isSolved ? 'solved' : ''
          } ${isPlayable ? 'clickable' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown} // Pour le mobile
          onTouchEnd={handleMouseUp} // Pour le mobile
        >
          <div className="lever-handle"></div>
        </div>

        {isHolding && (
          <div className="hold-progress">
            <div
              className="hold-progress-bar"
              style={{
                width: `${Math.min(
                  100,
                  ((Date.now() - holdStartTime) / 2000) * 100
                )}%`,
              }}
            ></div>
          </div>
        )}

        {isSolved && (
          <div className="puzzle-success">
            <p>Flux maintenu avec succès!</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .puzzle-container {
          padding: 20px;
          background: rgba(0, 20, 40, 0.8);
          border-radius: 8px;
          border: 1px solid var(--accent-color);
        }
        .puzzle-locked-message {
          color: var(--warning-color);
          font-style: italic;
        }
        .lever-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          margin-top: 20px;
        }
        .lever {
          width: 80px;
          height: 150px;
          background: #444;
          border: 2px solid #666;
          border-radius: 10px;
          position: relative;
          cursor: not-allowed;
          transition: background-color 0.2s, transform 0.2s;
        }
        .lever.clickable {
          cursor: pointer;
        }
        .lever.clickable:hover {
            background: #555;
        }
        .lever.active {
          background: var(--warning-color);
          border-color: var(--warning-color);
          transform: translateY(10px); // Le levier descend
        }
        .lever.solved {
          background: var(--success-color);
          border-color: var(--success-color);
        }
        .lever-handle {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 10px;
          background: #ccc;
          border-radius: 5px;
        }
        .hold-progress {
          width: 100%;
          height: 10px;
          background: #222;
          border: 1px solid #555;
          border-radius: 5px;
          overflow: hidden;
        }
        .hold-progress-bar {
          height: 100%;
          background: var(--warning-color);
          transition: width 0.1s linear;
        }
        .puzzle-success {
          color: var(--success-color);
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};
