// components/puzzles/LyraLogPuzzle.tsx
'use client';

import { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';

export const LyraLogPuzzle: React.FC = () => {
  const { sendIntent, modules } = useGame();
  const [isSolved, setIsSolved] = useState(false);

  const puzzleState = modules?.system?.puzzles?.ACT1_SYSTEM_LOG_B7;

  useEffect(() => {
    if (puzzleState?.state === 'solved') {
      setIsSolved(true);
    } else {
      setIsSolved(false);
    }
  }, [puzzleState]);

  const handleReadLog = async () => {
    if (isSolved) return;
    const result = await sendIntent('ACT1_SYSTEM_LOG_B7', {});
    if (result.ok) {
      setIsSolved(true);
    }
  };

  return (
    <div className="lyra-log-puzzle">
      <h3>Terminal de Diagnostic</h3>
      <div className="log-screen">
        <div className="log-line"> Scanning system logs...</div>
        <div className="log-line"> Accessing core memory...</div>
        <div className="log-line"> Found anomaly in stasis protocol.</div>
        <div className="log-line blinking">
          {' '}
          Protocol B7 required: 593-Alpha
        </div>
        {!isSolved && <div className="log-line"> _</div>}
      </div>
      <button onClick={handleReadLog} disabled={isSolved}>
        {isSolved ? 'Log Mémorisé' : 'Lire le Log'}
      </button>

      <style jsx>{`
        .lyra-log-puzzle {
          background: #000;
          border: 1px solid #00ff00;
          border-radius: 8px;
          padding: 20px;
          font-family: 'Courier New', Courier, monospace;
          color: #00ff00;
          text-align: left;
        }
        .log-screen {
          background: #111;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          min-height: 150px;
        }
        .log-line {
          margin-bottom: 5px;
          white-space: pre-wrap;
        }
        .blinking {
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        button {
          width: 100%;
          padding: 10px;
          background: #00ff00;
          color: #000;
          border: none;
          border-radius: 4px;
          font-family: 'Orbitron', sans-serif;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
        }
        button:disabled {
          background: #555;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};
