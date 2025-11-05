// components/puzzles/CodeInputPuzzle.tsx

import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext'; // 1. On utilise le hook mis à jour

export const CodeInputPuzzle: React.FC<{
  puzzleId: string;
  title: string;
  description: string;
}> = ({ puzzleId, title, description }) => {
  const { sendIntent, modules, currentRoom } = useGame(); // 1. On récupère les bonnes données du contexte
  const [code, setCode] = useState('');

  // 2. On détermine le module et le kind depuis le puzzleId
  const moduleId = puzzleId.split('_')[0] as 'energy' | 'system' | 'navigation';
  // Le kind est directement l'ID du puzzle dans notre catalogue
  const kind = puzzleId;

  // 3. Vérification de l'état du puzzle depuis l'état global
  const puzzleState = modules?.[moduleId]?.puzzles?.[kind];
  const isSolved = puzzleState?.state === 'solved';
  const isLocked = puzzleState?.state === 'locked';

  // Le puzzle n'est jouable que si le joueur est dans la bonne salle et que le puzzle est débloqué
  const isPlayable = currentRoom === moduleId && !isSolved && !isLocked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlayable || !code.trim()) return;

    // 4. Le payload dépend du type de puzzle
    let payload: any;
    if (kind === 'ACT1_ENERGY_CODE_B7') {
      payload = { code };
    } else if (kind === 'ACT3_NAVIGATION_COORDS') {
      // Pour les coordonnées, on s'attend à un format X,Y,Z
      const parts = code.split(',').map((p) => p.trim());
      if (parts.length === 3) {
        payload = {
          x: parseFloat(parts[0]),
          y: parseFloat(parts[1]),
          z: parseFloat(parts[2]),
        };
      } else {
        // Gérer le cas d'un format invalide
        alert(
          'Format invalide. Veuillez entrer les coordonnées sous la forme X, Y, Z.'
        );
        return;
      }
    } else {
      // Cas par défaut, si on crée d'autres puzzles de type code
      payload = { code };
    }

    const result = await sendIntent(kind, payload);

    if (result.ok) {
      console.log('Code validé !');
      setCode(''); // On vide l'input après succès
      // L'UI se mettra à jour automatiquement
    } else {
      console.error('Erreur code:', result.errors);
      // Ici, on pourrait afficher une erreur à l'utilisateur (ex: "Code incorrect")
      alert(result.errors?.join(', ') || 'Code incorrect.');
    }
  };

  return (
    <div className="puzzle-container">
      <h3>{title}</h3>
      <p>{description}</p>

      {isLocked && (
        <div className="puzzle-locked-message">
          <p>Ce puzzle n'est pas encore disponible.</p>
        </div>
      )}

      {!isLocked && (
        <form onSubmit={handleSubmit} className="code-form">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={
              kind === 'ACT3_NAVIGATION_COORDS' ? 'X, Y, Z' : 'Entrez le code'
            }
            disabled={isSolved}
            className="code-input"
          />

          <button
            type="submit"
            disabled={isSolved || !code.trim()}
            className={`puzzle-submit ${isSolved ? 'solved' : ''}`}
          >
            {isSolved ? 'Validé' : 'Valider'}
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
        .code-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 20px;
        }
        .code-input {
          padding: 12px;
          background: var(--primary-bg);
          border: 1px solid var(--text-secondary);
          color: var(--text-primary);
          border-radius: 4px;
          font-family: 'Orbitron', sans-serif;
          font-size: 1rem;
        }
        .code-input:focus {
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
