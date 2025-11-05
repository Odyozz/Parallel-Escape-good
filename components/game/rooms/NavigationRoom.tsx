// components/game/rooms/NavigationRoom.tsx
'use client';

import { useGame } from '../../../contexts/GameContext';
import { OrbitalDialsPuzzle } from '../../../components/puzzles/OrbitalDialsPuzzle';

export const NavigationRoom = () => {
  const { modules } = useGame();
  const navigationModule = modules?.navigation;
  const dialsPuzzle = navigationModule?.puzzles?.ACT2_NAVIGATION_DIALS;

  return (
    <div className="room">
      <h2>Salle Navigation</h2>

      {dialsPuzzle && dialsPuzzle.state !== 'locked' && <OrbitalDialsPuzzle />}

      {dialsPuzzle?.state === 'solved' && (
        <p className="room-status">Trajectoire stabilisée.</p>
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
