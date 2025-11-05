// components/game/RoomPlaceholder.tsx
'use client';

import { useRoom } from '../../contexts/RoomContext';

interface RoomPlaceholderProps {
  room: 'energy' | 'system' | 'navigation';
}

const RoomPlaceholder = ({ room }: RoomPlaceholderProps) => {
  const { room: gameRoom } = useRoom();
  const playersInRoom = Object.values(gameRoom?.players || {}).filter(
    (p) => p.currentRoom === room
  );

  const roomContent = {
    energy: {
      title: 'Salle Énergie',
      description: 'Le cœur battant du vaisseau.',
      bgClass: 'energy-bg',
    },
    system: {
      title: 'Salle Système',
      description: 'Le cerveau central de la station.',
      bgClass: 'system-bg',
    },
    navigation: {
      title: 'Salle Navigation',
      description: 'Les yeux qui guident votre chemin.',
      bgClass: 'navigation-bg',
    },
  };

  const current = roomContent[room];

  return (
    <div className={`room-placeholder ${current.bgClass}`}>
      <h2>{current.title}</h2>
      <p>{current.description}</p>

      <div className="interaction-area">
        <div className="placeholder-panel">
          <p>[Panneau de contrôle principal]</p>
          <div className="placeholder-buttons">
            <div className="placeholder-button"></div>
            <div className="placeholder-button"></div>
            <div className="placeholder-button"></div>
          </div>
        </div>
        <div className="placeholder-screen">
          <p>[Écran de diagnostic]</p>
          <div className="screen-lines"></div>
        </div>
      </div>

      <div className="players-in-room">
        {playersInRoom.map((player) => (
          <div
            key={player.uid}
            className="player-indicator"
            title={player.displayName}
          >
            {player.displayName.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>

      <style jsx>{`
        .room-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 15px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          text-align: center;
          color: var(--text-primary);
          position: relative;
          overflow: hidden;
        }

        .energy-bg { background: linear-gradient(135deg, rgba(0, 255, 247, 0.1), rgba(0, 100, 100, 0.2)); }
        .system-bg { background: linear-gradient(135deg, rgba(0, 212, 102, 0.1), rgba(50, 100, 50, 0.2)); }
        .navigation-bg { background: linear-gradient(135deg, rgba(255, 149, 0, 0.1), rgba(150, 100, 0, 0.2)); }

        .room-placeholder h2 {
          font-size: 2.5rem;
          margin-bottom: 10px;
        }

        .room-placeholder p {
          font-size: 1rem;
          color: var(--text-secondary);
          max-width: 400px;
        }

        .interaction-area {
          display: flex;
          gap: 30px;
          width: 100%;
          max-width: 600px;
        }

        .placeholder-panel, .placeholder-screen {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 20px;
          flex-grow: 1;
        }

        .placeholder-buttons {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .placeholder-button {
          width: 30px;
          height: 30px;
          background: var(--secondary-bg);
          border: 1px solid var(--accent-color);
          border-radius: 5px;
        }

        .screen-lines {
          margin-top: 15px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .screen-lines::before, .screen-lines::after {
          content: '';
          display: block;
          height: 2px;
          background: var(--accent-color);
          animation: scanline 3s infinite linear;
        }
        .screen-lines::after {
          animation-delay: 1.5s;
        }

        @keyframes scanline {
          0% { opacity: 0.3; width: 80%; }
          50% { opacity: 1; width: 100%; }
          100% { opacity: 0.3; width: 80%; }
        }

        .players-in-room {
          position: absolute;
          bottom: 20px;
          right: 20px;
          display: flex;
          gap: 5px;
        }

        .player-indicator {
          width: 40px;
          height: 40px;
          background: var(--accent-color);
          color: var(--primary-bg);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: 700;
          font-size: 1.2rem;
          border: 2px solid var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default RoomPlaceholder;
