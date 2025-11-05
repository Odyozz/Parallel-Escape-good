// components/game/HUD.tsx
'use client';

import { useGame } from '../../contexts/GameContext';
import { useRoom } from '../../contexts/RoomContext';
import { useState, useEffect } from 'react';

const HUD = () => {
  const { timeLeft, isPaused } = useGame();
  const { room, currentPlayer } = useRoom();
  const [systemLog, setSystemLog] = useState<string[]>([
    'Système initialisé...',
    'Bienvenue à bord.',
  ]);

  // Fonction pour formater le temps en MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Simulation de logs système (à remplacer par une vraie logique plus tard)
  useEffect(() => {
    if (!room) return;
    const interval = setInterval(() => {
      const newLog = `[${new Date().toLocaleTimeString()}] Système opérationnel.`;
      setSystemLog((prev) => [newLog, ...prev.slice(0, 4)]);
    }, 15000); // Un log toutes les 15 secondes
    return () => clearInterval(interval);
  }, [room]);

  return (
    <div className="hud">
      {/* Timer et Phase */}
      <div className="hud-top-left">
        <div className="timer-display">
          <span className="timer-label">TIMER</span>
          <span className={`timer-value ${isPaused ? 'paused' : ''}`}>
            {formatTime(timeLeft)}
          </span>
          {isPaused && <span className="paused-indicator">PAUSE</span>}
        </div>
        <div className="phase-display">
          Phase:{' '}
          <span className="phase-value">{room?.phase?.toUpperCase()}</span>
        </div>
      </div>

      {/* Jauges */}
      <div className="hud-top-right">
        <div className="gauges">
          <div className="gauge">
            <span>ÉNERGIE</span>
            <div className="gauge-bar">
              <div
                className="gauge-fill energy"
                style={{ width: `${room?.gauges.energy}%` }}
              ></div>
            </div>
            <span>{room?.gauges.energy}%</span>
          </div>
          <div className="gauge">
            <span>STRUCTURE</span>
            <div className="gauge-bar">
              <div
                className="gauge-fill structure"
                style={{ width: `${room?.gauges.structure}%` }}
              ></div>
            </div>
            <span>{room?.gauges.structure}%</span>
          </div>
          <div className="gauge">
            <span>STABILITÉ</span>
            <div className="gauge-bar">
              <div
                className="gauge-fill stability"
                style={{ width: `${room?.gauges.stability}%` }}
              ></div>
            </div>
            <span>{room?.gauges.stability}%</span>
          </div>
        </div>
      </div>

      {/* Log Système */}
      <div className="hud-bottom-left">
        <div className="system-log">
          <h4>LOG SYSTÈME</h4>
          <ul>
            {systemLog.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bouton Indices */}
      <div className="hud-bottom-right">
        <button
          className="hint-button"
          disabled
          title="Indisponible pour le moment"
        >
          INDICES
        </button>
      </div>

      <style jsx>{`
        .hud {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none; /* Pour ne pas bloquer les clics sur le jeu */
          z-index: 10;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .hud > div {
          pointer-events: auto; /* On réactive les clics pour les éléments du HUD */
        }

        .hud-top-left, .hud-top-right, .hud-bottom-left, .hud-bottom-right {
          color: var(--accent-color);
          font-family: 'Orbitron', sans-serif;
          text-shadow: 0 0 5px rgba(0, 255, 247, 0.5);
        }

        .timer-display {
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 1.2rem;
        }
        
        .timer-value {
          font-size: 2.5rem;
          font-weight: 700;
          letter-spacing: 2px;
        }
        
        .timer-value.paused {
          color: var(--warning-color);
        }

        .paused-indicator {
          background: var(--warning-color);
          color: var(--primary-bg);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .phase-display {
            font-size: 0.9rem;
            opacity: 0.8;
        }

        .gauges {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .gauge {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
        }

        .gauge-bar {
          width: 100px;
          height: 10px;
          background: var(--secondary-bg);
          border: 1px solid var(--border-color);
          border-radius: 5px;
          overflow: hidden;
        }

        .gauge-fill {
          height: 100%;
          transition: width 0.5s ease;
        }
        .gauge-fill.energy { background: var(--accent-color); }
        .gauge-fill.structure { background: var(--success-color); }
        .gauge-fill.stability { background: var(--warning-color); }

        .system-log {
          max-width: 300px;
          max-height: 150px;
          background: rgba(11, 13, 17, 0.7);
          border: 1px solid var(--border-color);
          border-radius: 5px;
          padding: 10px;
          overflow-y: auto;
        }
        
        .system-log h4 {
          margin: 0 0 10px 0;
          font-size: 0.9rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 5px;
        }

        .system-log ul {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .system-log li {
          margin-bottom: 5px;
        }

        .hint-button {
          background: var(--secondary-bg);
          border: 2px solid var(--border-color);
          color: var(--text-secondary);
          padding: 10px 20px;
          border-radius: 5px;
          font-family: 'Orbitron', sans-serif;
          font-weight: 500;
          cursor: not-allowed;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
};

export default HUD;
