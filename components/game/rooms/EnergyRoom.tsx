// components/game/rooms/EnergyRoom.tsx
'use client';

import { useGame } from '../../../contexts/GameContext';
import { CircuitPuzzle } from '../../../components/puzzles/CircuitPuzzle';
import { CodeInputPuzzle } from '../../../components/puzzles/CodeInputPuzzle';

export const EnergyRoom = () => {
  const { modules } = useGame();

  const energyModule = modules?.energy;
  const circuitPuzzle = energyModule?.puzzles?.ACT1_ENERGY_CIRCUITS;
  const codePuzzle = energyModule?.puzzles?.ACT1_ENERGY_CODE_B7;

  return (
    <div className="room">
      <h2>Salle Énergie</h2>

      {circuitPuzzle && circuitPuzzle.state !== 'locked' && <CircuitPuzzle />}

      {codePuzzle && codePuzzle.state !== 'locked' && (
        <CodeInputPuzzle
          puzzleId="ACT1_ENERGY_CODE_B7"
          title="Protocole B7"
          description="Entrez le code pour calibrer la ligne secondaire."
        />
      )}

      {circuitPuzzle?.state === 'solved' && codePuzzle?.state === 'solved' && (
        <p className="room-status">Module Énergie stabilisé.</p>
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
