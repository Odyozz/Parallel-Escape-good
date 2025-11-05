// components/puzzles/OrbitalDialsPuzzle.tsx

import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext'; // 1. On utilise le hook mis à jour

export const OrbitalDialsPuzzle: React.FC = () => {
  const { sendIntent, modules, currentRoom } = useGame(); // 1. On récupère les bonnes données
  const [speed, setSpeed] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [angle, setAngle] = useState(0);
  const [vector, setVector] = useState(0);

  // 2. Récupération de l'état du puzzle depuis le contexte global
  const puzzleState = modules?.navigation?.puzzles?.ACT2_NAVIGATION_DIALS;
  const isSolved = puzzleState?.state === 'solved';
  const isLocked = puzzleState?.state === 'locked';

  // Le puzzle n'est jouable que si le joueur est dans la bonne salle et que le puzzle est débloqué
  const isPlayable = currentRoom === 'navigation' && !isSolved && !isLocked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlayable) return;

    // 3. Le 'kind' est l'ID du puzzle, le payload contient la valeur du vecteur
    const kind = 'ACT2_NAVIGATION_DIALS';
    const payload = { vector };

    const result = await sendIntent(kind, payload);

    if (result.ok) {
      console.log('Cadrans stabilisés !');
      // L'UI se mettra à jour automatiquement
    } else {
      console.error('Erreur cadrans:', result.errors);
      // Ici, on pourrait afficher une erreur à l'utilisateur
      alert(result.errors?.join(', ') || 'Valeur incorrecte.');
    }
  };

  return (
    <div className="puzzle-container">
      <h3>Cadrans orbitaux</h3>
      <p>
        Ajustez les cadrans pour stabiliser la trajectoire. Seul le vecteur est
        crucial.
      </p>

      {isLocked && (
        <div className="puzzle-locked-message">
          <p>
            Ce puzzle n'est pas encore disponible. Stabilisez les systèmes
            d'abord.
          </p>
        </div>
      )}

      {!isLocked && (
        <form onSubmit={handleSubmit} className="dials-form">
          <div className="dial-container">
            <div className="dial">
              <label>Vitesse: {speed.toFixed(1)}</label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                disabled={isSolved}
                className="dial-input"
              />
            </div>

            <div className="dial">
              <label>Altitude: {altitude}</label>
              <input
                type="range"
                min="0"
                max="20000"
                step="100"
                value={altitude}
                onChange={(e) => setAltitude(parseInt(e.target.value))}
                disabled={isSolved}
                className="dial-input"
              />
            </div>

            <div className="dial">
              <label>Angle: {angle}°</label>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value))}
                disabled={isSolved}
                className="dial-input"
              />
            </div>

            <div className="dial">
              <label>Vecteur: {vector}°</label>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={vector}
                onChange={(e) => setVector(parseInt(e.target.value))}
                disabled={isSolved}
                className="dial-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSolved}
            className={`puzzle-submit ${isSolved ? 'solved' : ''}`}
          >
            {isSolved ? 'Stabilisé' : 'Stabiliser'}
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
        .puzzle-locked-message {
          color: var(--warning-color);
          font-style: italic;
          padding: 10px;
          background: rgba(255, 165, 0, 0.1);
          border-radius: 4px;
        }
        .dials-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 20px;
        }
        .dial-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .dial {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .dial label {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .dial-input {
          width: 100%;
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
