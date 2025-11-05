'use client';

import { Player } from '../../utils/room';
import Button from '../ui/Button';

interface PlayerCardProps {
  player: Player;
  isHost: boolean;
  isCurrentUser: boolean;
}

const PlayerCard = ({ player, isHost, isCurrentUser }: PlayerCardProps) => {
  return (
    <div className={`player-card ${!player.connected ? 'disconnected' : ''}`}>
      <div className="player-avatar">
        <img src={player.avatar} alt={player.displayName} />
        <div
          className={`connection-indicator ${
            player.connected ? 'connected' : 'disconnected'
          }`}
        ></div>
      </div>
      <div className="player-info">
        <h4>
          {player.displayName}{' '}
          {isHost && <span className="host-badge">Hôte</span>}
        </h4>
        <p className="player-status">
          {player.connected ? 'En ligne' : 'Hors ligne'}
        </p>
      </div>
      <div className="player-ready">
        {isCurrentUser ? (
          <div className="ready-toggle">
            <span
              className={`ready-status ${player.ready ? 'ready' : 'not-ready'}`}
            >
              {player.ready ? 'Prêt' : 'Pas prêt'}
            </span>
          </div>
        ) : (
          <div
            className={`ready-indicator ${
              player.ready ? 'ready' : 'not-ready'
            }`}
          >
            {player.ready ? '✅ Prêt' : '⏳ Pas prêt'}
          </div>
        )}
      </div>

      <style jsx>{`
        .player-card {
          display: flex;
          align-items: center;
          padding: 15px;
          background: var(--card-bg);
          border-radius: 10px;
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
        }
        
        .player-card.disconnected {
          opacity: 0.6;
        }
        
        .player-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        .player-avatar {
          position: relative;
          width: 50px;
          height: 50px;
          margin-right: 15px;
        }
        
        .player-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .connection-indicator {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid var(--card-bg);
        }
        
        .connection-indicator.connected {
          background-color: var(--success-color);
        }
        
        .connection-indicator.disconnected {
          background-color: var(--danger-color);
        }
        
        .player-info {
          flex-grow: 1;
        }
        
        .player-info h4 {
          margin: 0 0 5px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .host-badge {
          font-size: 0.7rem;
          padding: 2px 6px;
          background-color: var(--accent-color);
          color: var(--primary-bg);
          border-radius: 10px;
          font-weight: 500;
        }
        
        .player-status {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        
        .player-ready {
          text-align: right;
        }
        
        .ready-toggle {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        
        .ready-status {
          font-size: 0.9rem;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .ready-status.ready {
          background-color: rgba(0, 212, 102, 0.2);
          color: var(--success-color);
        }
        
        .ready-status.not-ready {
          background-color: rgba(255, 149, 0, 0.2);
          color: var(--warning-color);
        }
        
        .ready-indicator {
          font-size: 0.9rem;
        }
        
        .ready-indicator.ready {
          color: var(--success-color);
        }
        
        .ready-indicator.not-ready {
          color: var(--warning-color);
        }
      `}</style>
    </div>
  );
};

export default PlayerCard;
