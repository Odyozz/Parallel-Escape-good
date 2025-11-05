// components/game/rooms/SystemRoom.tsx
'use client';

import { useGame } from '../../../contexts/GameContext';
import { LyraLogPuzzle }  from '../../../components/puzzles/LyraLogPuzzle';

export const SystemRoom = () => {
  const { modules } = useGame();
  const systemModule = modules?.system;
  const logPuzzle = systemModule?.puzzles?.ACT1_SYSTEM_LOG_B7;

  return (
    <div className="room">
      <h2>Salle Système</h2>

      {logPuzzle && logPuzzle.state !== 'locked' && <LyraLogPuzzle />}

      {logPuzzle?.state === 'solved' && (
        <p className="room-status">Log système trouvé.</p>
      )}

      <style jsx>{`
        .room {
          width: 100%;
          height: 100%;
          padding: 20px;
          color: var(--text-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .room h2 {
          color: var(--accent-color);
          margin-bottom: 20px;
        }
        .room-status {
          margin-top: 20px;
          padding: 10px;
          background: rgba(0, 255, 0, 0.1);
          border: 1px solid var(--success-color);
          border-radius: 5px;
          color: var(--success-color);
        }
      `}</style>
    </div>
  );
};
