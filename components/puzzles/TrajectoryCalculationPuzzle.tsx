// components/puzzles/TrajectoryCalculationPuzzle.tsx

import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext'; // 1. On utilise le hook mis à jour

export const TrajectoryCalculationPuzzle: React.FC = () => {
  const { sendIntent, modules, currentRoom } = useGame(); // 1. On récupère les bonnes données
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [z, setZ] = useState(0);

  // 2. Récupération de l'état du puzzle depuis le contexte global
  const puzzleState = modules?.system?.puzzles?.ACT3_SYSTEM_TRAJECTORY;
  const isSolved = puzzleState?.state === 'solved';
  const isLocked = puzzleState?.state === 'locked';

  // Le puzzle n'est jouable que si le joueur est dans la bonne salle et que le puzzle n'est pas résolu
  const isPlayable = currentRoom === 'system' && !isSolved && !isLocked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlayable) return;

    // 3. Le 'kind' est l'ID du puzzle, le payload contient les coordonnées
    const kind = 'ACT3_SYSTEM_TRAJECTORY';
    const payload = { x, y, z };

    const result = await sendIntent(kind, payload);

    if (result.ok) {
      console.log('Trajectoire calculée !');
      // L'UI se mettra à jour automatiquement
    } else {
      console.error('Erreur trajectoire:', result.errors);
      // Ici, on pourrait afficher une erreur à l'utilisateur
      alert(result.errors?.join(', ') || 'Calcul incorrect.');
    }
  };

  return (
    <div className="puzzle-container">
      <h3>Calcul de trajectoire</h3>
      <p>Calculez les 3 valeurs de correction X, Y, Z.</p>

      <div className="log-hint">
        <p>Un vieux log mentionne: "Angle 17°, distance 3.2, impulsion 5."</p>
      </div>

      {isLocked && (
        <p className="puzzle-locked-message">
          Ce puzzle n'est pas encore accessible.
        </p>
      )}

      {!isLocked && (
        <form onSubmit={handleSubmit} className="trajectory-form">
          <div className="coord-input-group">
            <div className="coord-input">
              <label htmlFor="coord-x">X:</label>
              <input
                id="coord-x"
                type="number"
                value={x}
                onChange={(e) => setX(parseFloat(e.target.value) || 0)}
                disabled={isSolved}
                className="coord-field"
              />
            </div>

            <div className="coord-input">
              <label htmlFor="coord-y">Y:</label>
              <input
                id="coord-y"
                type="number"
                value={y}
                onChange={(e) => setY(parseFloat(e.target.value) || 0)}
                disabled={isSolved}
                className="coord-field"
              />
            </div>

            <div className="coord-input">
              <label htmlFor="coord-z">Z:</label>
              <input
                id="coord-z"
                type="number"
                value={z}
                onChange={(e) => setZ(parseFloat(e.target.value) || 0)}
                disabled={isSolved}
                className="coord-field"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSolved}
            className={`puzzle-submit ${isSolved ? 'solved' : ''}`}
          >
            {isSolved ? 'Calculé' : 'Calculer'}
          </button>
        </form>
      )}

      <style jsx>{`
        .puzzle-container {
          padding: 20px;
          background: rgba(0, 20, 40, 0.8);
          border-radius: 8px;
          border: 1px solid var(--accent-color);
        }
        .log-hint {
          background: rgba(255, 255, 0, 0.1);
          border-left: 4px solid var(--warning-color);
          padding: 10px 15px;
          margin: 15px 0;
          font-style: italic;
          color: var(--text-secondary);
        }
        .puzzle-locked-message {
          color: var(--warning-color);
          font-style: italic;
        }
        .trajectory-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 20px;
        }
        .coord-input-group {
          display: flex;
          gap: 15px;
          justify-content: space-around;
        }
        .coord-input {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }
        .coord-input label {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .coord-field {
          width: 80px;
          padding: 8px;
          background: var(--primary-bg);
          border: 1px solid var(--text-secondary);
          color: var(--text-primary);
          border-radius: 4px;
          font-family: 'Orbitron', sans-serif;
          text-align: center;
        }
        .coord-field:focus {
          outline: none;
          border-color: var(--accent-color);
        }
        .puzzle-submit {
          padding: 12px 20px;
          background: var(--accent-color);
          color: var(--text-primary);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Orbitron', sans-serif;
          font-size: 1rem;
          transition: background-color 0.2s;
        }
        .puzzle-submit:hover:not(:disabled) {
          background-color: var(--accent-color-hover);
        }
        .puzzle-submit:disabled {
          background: #555;
          cursor: not-allowed;
        }
        .puzzle-submit.solved {
          background: var(--success-color);
        }
      `}</style>
    </div>
  );
};
