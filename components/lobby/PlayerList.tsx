// components/lobby/PlayerList.tsx
'use client';

import { Room, Player } from '../../utils/room';
import PlayerCard from './PlayerCard';
import { useAuth } from '../../contexts/AuthContext';

interface PlayerListProps {
  room: Room;
}

const PlayerList = ({ room }: PlayerListProps) => {
  const { user } = useAuth();
  const players = Object.values(room.players);
  const sortedPlayers = [...players].sort((a, b) => {
    // L'hôte en premier
    if (a.uid === room.hostUid) return -1;
    if (b.uid === room.hostUid) return 1;

    // Puis par ordre de connexion
    return a.joinedAt.toMillis() - b.joinedAt.toMillis();
  });

  return (
    <div className="player-list">
      {/* MODIFICATION : Afficher le nombre de joueurs requis */}
      <h3>
        Liste des joueurs ({players.length}/{room.requiredPlayers})
      </h3>
      <div className="players-container">
        {sortedPlayers.map((player) => (
          <PlayerCard
            key={player.uid}
            player={player}
            isHost={player.uid === room.hostUid}
            isCurrentUser={player.uid === user?.uid}
          />
        ))}
      </div>

      {/* MODIFICATION : Le nombre de slots vides dépend maintenant du nombre requis */}
      {players.length < room.requiredPlayers && (
        <div className="empty-slots">
          {Array.from({ length: room.requiredPlayers - players.length }).map(
            (_, index) => (
              <div key={`empty-${index}`} className="empty-player-slot">
                <div className="empty-avatar">?</div>
                <div className="empty-info">
                  <p>Slot vide</p>
                  <p>En attente d'un joueur...</p>
                </div>
              </div>
            )
          )}
        </div>
      )}

      <style jsx>{`
        .player-list {
          margin-bottom: 30px;
        }
        
        .player-list h3 {
          margin-bottom: 20px;
          color: var(--accent-color);
        }
        
        .players-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .empty-slots {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .empty-player-slot {
          display: flex;
          align-items: center;
          padding: 15px;
          background: var(--secondary-bg);
          border-radius: 10px;
          border: 1px dashed var(--border-color);
          opacity: 0.6;
        }
        
        .empty-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--border-color);
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 1.5rem;
          color: var(--text-secondary);
          margin-right: 15px;
        }
        
        .empty-info p {
          margin: 0;
        }
        
        .empty-info p:first-child {
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .empty-info p:last-child {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        
        @media (max-width: 768px) {
          .players-container,
          .empty-slots {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PlayerList;
