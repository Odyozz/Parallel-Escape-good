// app/game/page.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RoomProvider, useRoom } from '../../contexts/RoomContext';
import { GameProvider, useGame } from '../../contexts/GameContext';
import Button from '../../components/ui/Button';
import HUD from '../../components/game/HUD';
import GameView from '../../components/game/GameView';
// ❌ SUPPRIMÉ: import router from 'next/router';

function GameContent() {
  const { room, loading, error, isHost } = useRoom();
  const { isPaused } = useGame();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!room || room.status !== 'running') {
      router.push(`/play?room=${room?.id || ''}`);
    }
  }, [room, loading, router]);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="game-error-overlay">
        <h1>Erreur de chargement</h1>
        <p>{error || 'La room est introuvable.'}</p>
        <Button onClick={() => router.push('/hub')}>Retour au Hub</Button>
      </div>
    );
  }

  // Nombre exact de joueurs requis
  const playersConnected = Object.values(room.players).filter((p: any) => p.connected).length;
  const isPlayerCountCorrect = playersConnected === room.requiredPlayers;

  return (
    <div className="game-page">
      {/* HUD toujours visible */}
      <HUD />

      {/* Vue principale du jeu */}
      <GameView />

      {/* Overlay si le nombre de joueurs est incorrect */}
      {!isPlayerCountCorrect && (
        <div className="player-count-overlay">
          <h2>Nombre de joueurs incorrect</h2>
          <p>
            Session verrouillée en attente du nombre de joueurs requis ({room.requiredPlayers}).
          </p>
          {isPaused && <p className="pause-message">Le jeu est en PAUSE.</p>}
          {isHost && (
            <Button onClick={() => router.push(`/play?room=${room.id}`)}>
              Retour au Lobby
            </Button>
          )}
        </div>
      )}

      {/* Overlay fin de partie */}
      {room.status === 'ended' && (
        <div className="game-ended-overlay">
          <h1>Mission Terminée</h1>
          <p>Félicitations, vous avez survécu !</p>
          <Button onClick={() => router.push('/hub')}>Retour au Hub</Button>
        </div>
      )}

      <style jsx>{`
        .game-page {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background-color: var(--primary-bg);
          font-family: 'Orbitron', sans-serif;
        }
        .loading-page {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: var(--primary-bg);
        }
        .game-error-overlay,
        .player-count-overlay,
        .game-ended-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(11, 13, 17, 0.9);
          color: var(--text-primary);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          z-index: 100;
          padding: 20px;
        }
        .player-count-overlay { color: var(--warning-color); }
        .player-count-overlay h2 { font-size: 2.5rem; margin-bottom: 1rem; }
        .pause-message { font-size: 1.2rem; color: var(--accent-color); margin-top: 0.5rem; }
        .game-ended-overlay h1 { font-size: 3rem; color: var(--success-color); margin-bottom: 1rem; }
      `}</style>
    </div>
  );
}

export default function GamePage() {
  const searchParams = useSearchParams();
  const router = useRouter(); // ✅ nécessaire ici
  const roomId = searchParams.get('room');

  if (!roomId) {
    return (
      <div className="error-page">
        <div className="error-content">
          <h2>Lien invalide</h2>
          <p>Aucun ID de room spécifié.</p>
          <Button onClick={() => router.push('/hub')}>Retour au Hub</Button>
        </div>
        <style jsx>{`
          .error-page {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: var(--primary-bg);
          }
          .error-content { text-align: center; }
          .error-content h2 { color: var(--danger-color); margin-bottom: 1rem; }
        `}</style>
      </div>
    );
  }

  return (
    <RoomProvider roomId={roomId}>
      <GameProvider>
        <GameContent />
      </GameProvider>
    </RoomProvider>
  );
}
