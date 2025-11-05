// components/lobby/LobbyStatus.tsx
'use client';

import { Room } from '../../utils/room';
import { useRoom } from '../../contexts/RoomContext';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';
import { startGameFromLobby } from '../../utils/room'; // Import de la bonne fonction

interface LobbyStatusProps {
  room: Room;
}

const LobbyStatus = ({ room }: LobbyStatusProps) => {
  const { isHost, currentPlayer, toggleReady } = useRoom(); // 'startGame' est retiré ici
  const router = useRouter();
  const players = Object.values(room.players);

  // La condition de départ est basée sur requiredPlayers
  const allReady =
    players.length === room.requiredPlayers &&
    players.every((player) => player.ready);
  const canStart = isHost && allReady && room.status === 'lobby';

  const getStatusMessage = () => {
    if (room.status === 'running') {
      return 'La partie est en cours...';
    }

    if (room.status === 'paused') {
      return 'Partie en pause - En attente de reconnection...';
    }

    if (room.status === 'ended') {
      return 'Cette partie est terminée';
    }

    if (players.length < room.requiredPlayers) {
      const missing = room.requiredPlayers - players.length;
      return `En attente de ${missing} joueur${missing > 1 ? 's' : ''}...`;
    }

    if (!allReady) {
      return 'En attente que tous les joueurs soient prêts...';
    }

    return 'Tous les joueurs sont prêts !';
  };

  // On utilise la nouvelle fonction pour démarrer la partie
  const handleStartGame = () => {
    if (!room) return;
    startGameFromLobby(room.id);
  };

  return (
    <div className="lobby-status">
      <h2>CryoStation 9 — Salon de mission</h2>
      <p className="status-message">{getStatusMessage()}</p>

      <div className="lobby-actions">
        {currentPlayer && room.status === 'lobby' && (
          <Button
            variant={currentPlayer.ready ? 'secondary' : 'primary'}
            onClick={toggleReady}
          >
            {currentPlayer.ready ? 'Pas prêt' : 'Prêt'}
          </Button>
        )}

        {canStart && (
          <Button variant="primary" onClick={handleStartGame}>
            Lancer la mission
          </Button>
        )}

        {room.status === 'ended' && (
          <Button
            variant="primary"
            onClick={() => router.push('/mission/cryostation9')}
          >
            Créer une nouvelle partie
          </Button>
        )}
      </div>

      <style jsx>{`
        .lobby-status {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .lobby-status h2 {
          margin-bottom: 15px;
          color: var(--accent-color);
        }
        
        .status-message {
          font-size: 1.1rem;
          margin-bottom: 25px;
          color: var(--text-secondary);
        }
        
        .lobby-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
};

export default LobbyStatus;
