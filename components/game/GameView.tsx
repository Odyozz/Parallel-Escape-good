// components/game/GameView.tsx

'use client';

import { useGame } from '../../contexts/GameContext';
import { useRoom } from '../../contexts/RoomContext';
import LyraPanel from './LyraPanel';

// --- Importer les composants de salle réels ---
import { EnergyRoom } from './rooms/EnergyRoom';
import { SystemRoom } from './rooms/SystemRoom';
import { NavigationRoom } from './rooms/NavigationRoom';

const GameView = () => {
  const { currentRoom, changeRoom } = useGame();
  const { room } = useRoom();

  const rooms = ['energy', 'system', 'navigation'] as const;
  const currentIndex = rooms.indexOf(currentRoom);
  const leftRoom = rooms[(currentIndex - 1 + rooms.length) % rooms.length];
  const rightRoom = rooms[(currentIndex + 1) % rooms.length];

  // --- Fonction pour rendre la bonne salle ---
  const renderRoom = () => {
    switch (currentRoom) {
      case 'energy':
        return <EnergyRoom />;
      case 'system':
        return <SystemRoom />;
      case 'navigation':
        return <NavigationRoom />;
      default:
        return <div>Room not found</div>;
    }
  };

  return (
    <div className="game-view">
      {/* Flèche de navigation gauche */}
      <button className="nav-arrow left" onClick={() => changeRoom('left')}>
        &#8249;
      </button>

      {/* Conteneur principal de la salle */}
      <div className="room-container">
        {/* --- MODIFICATION : Remplacer RoomPlaceholder par renderRoom() --- */}
        {renderRoom()}
        <LyraPanel />
      </div>

      {/* Flèche de navigation droite */}
      <button className="nav-arrow right" onClick={() => changeRoom('right')}>
        &#8250;
      </button>

      <style jsx>{`
        .game-view {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .room-container {
          width: 80%;
          height: 80%;
          max-width: 1200px;
          max-height: 800px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 255, 247, 0.1);
          border: 2px solid var(--accent-color);
          color: var(--accent-color);
          font-size: 3rem;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 20;
        }

        .nav-arrow:hover {
          background: rgba(0, 255, 247, 0.2);
          transform: translateY(-50%) scale(1.1);
        }

        .nav-arrow.left {
          left: 20px;
        }

        .nav-arrow.right {
          right: 20px;
        }
      `}</style>
    </div>
  );
};

export default GameView;
