// components/puzzles/SyncPuzzle.tsx

import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext'; // 1. On utilise le hook mis à jour

export const SyncPuzzle: React.FC = () => {
  const { sendIntent, modules, room, currentRoom } = useGame(); // 1. On récupère les bonnes données

  // 2. L'état de la fenêtre de sync est maintenant global
  const syncWindow = room?.syncWindow;
  const isSyncWindowOpen = syncWindow?.isOpen || false;
  const syncStartedAt = syncWindow?.startedAt?.toMillis() || 0;

  // 3. Récupération de l'état du puzzle
  const puzzleState = modules?.navigation?.puzzles?.ACT3_FINAL_SYNC;
  const isSolved = puzzleState?.state === 'solved';
  const isLocked = puzzleState?.state === 'locked';

  // Le puzzle n'est jouable que si le joueur est dans la bonne salle et que le puzzle est débloqué
  const isPlayable = currentRoom === 'navigation' && !isSolved && !isLocked;

  // État local pour savoir si le joueur courant a déjà appuyé
  const [hasPlayerSynced, setHasPlayerSynced] = useState(false);

  // Réinitialiser l'état local du joueur si la fenêtre se ferme
  useEffect(() => {
    if (!isSyncWindowOpen) {
      setHasPlayerSynced(false);
    }
  }, [isSyncWindowOpen]);

  const handleStartSync = async () => {
    if (!isPlayable) return;

    // On envoie l'intention pour ouvrir la fenêtre de sync
    const result = await sendIntent('ACT3_FINAL_SYNC', { action: 'start' });
    if (!result.ok) {
      alert(result.errors?.join(', ') || 'Impossible de lancer la séquence.');
    }
  };

  const handleSync = async () => {
    if (!isSyncWindowOpen || hasPlayerSynced) return;

    // On envoie l'intention pour indiquer que ce joueur a appuyé
    const result = await sendIntent('ACT3_FINAL_SYNC', { action: 'complete' });
    if (result.ok) {
      setHasPlayerSynced(true); // On met à jour l'UI localement pour un feedback immédiat
    } else {
      alert(result.errors?.join(', ') || 'Synchronisation échouée.');
    }
  };

  // Calcul du temps restant pour la fenêtre de sync
  const timeLeft = isSyncWindowOpen
    ? Math.max(0, 3000 - (Date.now() - syncStartedAt))
    : 0;
  const progressPercentage = isSyncWindowOpen ? (timeLeft / 3000) * 100 : 100;

  return (
    <div className="puzzle-container">
      <h3>Synchronisation finale</h3>
      <p>
        Tous les joueurs doivent appuyer sur "Activer" en moins de 3 secondes.
      </p>

      {isLocked && (
        <div className="puzzle-locked-message">
          <p>
            Ce puzzle n'est pas encore disponible. Entrez les coordonnées
            d'abord.
          </p>
        </div>
      )}

      {!isLocked && (
        <div className="sync-container">
          {!isSyncWindowOpen && !isSolved && (
            <button onClick={handleStartSync} className="sync-start-button">
              Lancer la séquence
            </button>
          )}

          {isSyncWindowOpen && !isSolved && (
            <div className="sync-active">
              <div className="sync-timer">
                <div
                  className="sync-timer-bar"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
                <p className="sync-timer-text">
                  {(timeLeft / 1000).toFixed(1)}s
                </p>
              </div>

              <button
                onClick={handleSync}
                disabled={hasPlayerSynced}
                className={`sync-button ${hasPlayerSynced ? 'synced' : ''}`}
              >
                {hasPlayerSynced ? 'Activé' : 'Activer'}
              </button>

              <p className="sync-instruction">
                Tous les joueurs doivent appuyer sur "Activer" maintenant!
              </p>
            </div>
          )}

          {isSolved && (
            <div className="puzzle-success">
              <p>Synchronisation réussie!</p>
            </div>
          )}
        </div>
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
        }
        .sync-container {
          margin-top: 20px;
        }
        .sync-start-button, .sync-button {
          padding: 15px 30px;
          font-size: 1.2rem;
          font-family: 'Orbitron', sans-serif;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .sync-start-button {
          background: var(--accent-color);
          color: var(--text-primary);
        }
        .sync-start-button:hover {
            background: var(--accent-color-hover);
        }
        .sync-active {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }
        .sync-timer {
            width: 100%;
            height: 30px;
            background: #222;
            border: 1px solid #555;
            border-radius: 15px;
            overflow: hidden;
            position: relative;
        }
        .sync-timer-bar {
            height: 100%;
            background: linear-gradient(90deg, #ff4136, #ff851b); // Dégradé rouge/orange pour l'urgence
            transition: width 0.1s linear;
        }
        .sync-timer-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            margin: 0;
            color: white;
            font-weight: bold;
        }
        .sync-button {
          background: var(--danger-color);
          color: white;
          width: 150px;
        }
        .sync-button:hover:not(:disabled) {
          background: #c00;
        }
        .sync-button:disabled {
          background: #555;
          cursor: not-allowed;
        }
        .sync-button.synced {
          background: var(--success-color);
        }
        .sync-instruction {
          color: var(--warning-color);
          text-align: center;
          font-size: 1.1rem;
        }
        .puzzle-success {
          color: var(--success-color);
          font-weight: bold;
          text-align: center;
          font-size: 1.2rem;
        }
      `}</style>
    </div>
  );
};
