// components/puzzles/CrankPuzzle.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext'; // 1. On utilise le hook mis à jour

export const CrankPuzzle: React.FC = () => {
  const { sendIntent, modules, currentRoom } = useGame(); // 1. On récupère les bonnes données
  const [isCranking, setIsCranking] = useState(false);
  const [totalCrankTime, setTotalCrankTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 2. Récupération de l'état du puzzle depuis le contexte global
  const puzzleState = modules?.energy?.puzzles?.ACT3_ENERGY_CRANK;
  const isSolved = puzzleState?.state === 'solved';
  const isLocked = puzzleState?.state === 'locked';

  // Le puzzle n'est jouable que si le joueur est dans la bonne salle et que le puzzle n'est pas résolu
  const isPlayable = currentRoom === 'energy' && !isSolved && !isLocked;

  // Si le puzzle est résolu, on synchronise l'état local
  useEffect(() => {
    if (isSolved) {
      setTotalCrankTime(15000); // On met la barre de progression au max
      setIsCranking(false);
    }
  }, [isSolved]);

  const handleStartCrank = () => {
    if (!isPlayable || isCranking) return;

    setIsCranking(true);
    // On ne réinitialise pas le temps à chaque appui, on cumule
    // setTotalCrankTime(0);

    // Envoyer l'événement de début de manivelle (pour potentiellement déclencher un effet LYRA)
    sendIntent('ACT3_ENERGY_CRANK', { action: 'start' });

    intervalRef.current = setInterval(() => {
      setTotalCrankTime((prev) => {
        const newTime = prev + 100;
        // 3. Si on atteint 15s, on envoie l'intention de succès
        if (newTime >= 15000) {
          handleStopCrank(); // Arrête le timer local
          sendIntent('ACT3_ENERGY_CRANK', { action: 'complete' }); // Envoie l'intention de succès
          return 15000;
        }
        return newTime;
      });
    }, 100);
  };

  const handleStopCrank = () => {
    if (!isCranking) return;

    setIsCranking(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // On n'envoie pas d'événement 'stop'. La logique est simplifiée.
    // Le serveur n'a pas besoin de savoir chaque arrêt, seulement l'achèvement.
  };

  // Nettoyage de l'intervalle au démontage du composant
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="puzzle-container">
      <h3>Manivelle d'urgence</h3>
      <p>
        Actionnez la manivelle pour alimenter le système pendant 15 secondes
      </p>

      {isLocked && (
        <p className="puzzle-locked-message">
          Ce puzzle n'est pas encore accessible.
        </p>
      )}

      <div className="crank-container">
        <div
          className={`crank ${isCranking ? 'active' : ''} ${
            isPlayable ? 'clickable' : ''
          }`}
          onMouseDown={handleStartCrank}
          onMouseUp={handleStopCrank}
          onMouseLeave={handleStopCrank}
          onTouchStart={handleStartCrank} // Pour le mobile
          onTouchEnd={handleStopCrank} // Pour le mobile
        >
          <div className="crank-handle"></div>
        </div>

        <div className="crank-progress">
          <div
            className="crank-progress-bar"
            style={{ width: `${(totalCrankTime / 15000) * 100}%` }}
          ></div>
          <p>{(totalCrankTime / 1000).toFixed(1)}s / 15s</p>
        </div>

        {isSolved && (
          <div className="puzzle-success">
            <p>Alimentation suffisante!</p>
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
        .crank-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          margin-top: 20px;
        }
        .crank {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: #333;
          border: 3px solid #555;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: not-allowed;
          transition: background-color 0.2s;
        }
        .crank.clickable {
          cursor: grab;
        }
        .crank.clickable:active {
          cursor: grabbing;
        }
        .crank.active {
          background: var(--accent-color);
          border-color: var(--accent-color-hover);
          animation: rotate 1s linear infinite;
        }
        .crank-handle {
          width: 60px;
          height: 8px;
          background: #ccc;
          border-radius: 4px;
        }
        .crank-progress {
          width: 100%;
          height: 20px;
          background: #222;
          border: 1px solid #555;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }
        .crank-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #00ffff, #0088ff);
          transition: width 0.1s linear;
        }
        .crank-progress p {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 0.8rem;
          margin: 0;
        }
        .puzzle-success {
          color: var(--success-color);
          font-weight: bold;
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
