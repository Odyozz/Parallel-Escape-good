'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { RoomProvider, useRoom } from '@/contexts/RoomContext';
import { useAuth } from '@/contexts/AuthContext';
import { joinRoom } from '@/utils/room';
import LoginModal from '@/components/auth/LoginModal';
import PlayerList from '@/components/lobby/PlayerList';
import LobbyStatus from '@/components/lobby/LobbyStatus';
import Toast from '@/components/ui/Toast';
import Button from '@/components/ui/Button';

function LobbyContent() {
  const { room, loading, error, leaveRoom } = useRoom();
  const { user } = useAuth();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [joining, setJoining] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room');

  useEffect(() => {
    if (!user && !showLoginModal && roomId) {
      setShowLoginModal(true);
    }
  }, [user, showLoginModal, roomId]);

  useEffect(() => {
    if (room && room.status === 'running') {
      router.push(`/game?room=${room.id}`);
    }
  }, [room, router]);

  const handleJoinRoom = async () => {
    if (!user || !roomId) return;

    setJoining(true);

    try {
      const success = await joinRoom(roomId, user);

      if (!success) {
        setToast({
          message:
            'Impossible de rejoindre cette room. Elle est peut-être pleine ou inexistante.',
          type: 'error',
        });
        setTimeout(() => router.push('/hub'), 2000);
      } else {
        setToast({
          message: 'Vous avez rejoint la room avec succès !',
          type: 'success',
        });
      }
    } catch (error) {
      console.error('Error joining room:', error);
      setToast({
        message: 'Une erreur est survenue lors de la jonction à la room.',
        type: 'error',
      });
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    router.push('/hub');
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-page">
        <div className="container">
          <div className="error-content">
            <h2>Erreur</h2>
            <p>{error}</p>
            <Button onClick={() => router.push('/hub')}>Retour aux missions</Button>
          </div>
        </div>

        <style jsx>{`
          .error-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .error-content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 100px 0;
          }
          .error-content h2 {
            margin-bottom: 20px;
            color: var(--danger-color);
          }
          .error-content p {
            margin-bottom: 30px;
            font-size: 1.1rem;
          }
        `}</style>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="error-page">
        <div className="container">
          <div className="error-content">
            <h2>Room introuvable</h2>
            <p>Cette room n'existe pas ou a été supprimée.</p>
            <Button onClick={() => router.push('/hub')}>Retour aux missions</Button>
          </div>
        </div>

        <style jsx>{`
          .error-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .error-content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 100px 0;
          }
          .error-content h2 {
            margin-bottom: 20px;
            color: var(--danger-color);
          }
          .error-content p {
            margin-bottom: 30px;
            font-size: 1.1rem;
          }
        `}</style>
      </div>
    );
  }

  if (room.status === 'paused') {
    return (
      <div className="lobby-page">
        <section className="lobby section">
          <div className="container">
            <div className="paused-overlay">
              <h2>Partie en Pause</h2>
              <p>
                Un joueur s'est déconnecté. Toutes les interactions sont
                verrouillées en attendant sa reconnexion.
              </p>
              <div className="loading-spinner"></div>
              <Button variant="secondary" onClick={handleLeaveRoom}>
                Quitter la room
              </Button>
            </div>
          </div>
        </section>

        <style jsx>{`
          .paused-overlay {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            min-height: 60vh;
            gap: 20px;
          }
          .paused-overlay h2 {
            color: var(--warning-color);
            margin-bottom: 1rem;
          }
          .paused-overlay p {
            font-size: 1.1rem;
            max-width: 500px;
            line-height: 1.6;
          }
        `}</style>
      </div>
    );
  }

  if (room.status === 'ended') {
    return (
      <div className="ended-page">
        <div className="container">
          <div className="ended-content">
            <h2>Partie terminée</h2>
            <p>Cette partie est terminée.</p>
            <Button onClick={() => router.push('/hub')}>Retour aux missions</Button>
          </div>
        </div>

        <style jsx>{`
          .ended-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .ended-content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 100px 0;
          }
          .ended-content h2 {
            margin-bottom: 20px;
            color: var(--warning-color);
          }
          .ended-content p {
            margin-bottom: 30px;
            font-size: 1.1rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="lobby-page">
      <section className="lobby section">
        <div className="container">
          <div className="lobby-header">
            <LobbyStatus room={room} />
            <div className="room-info">
              <p>
                Code de la room: <span className="room-code">{room.id}</span>
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/play?room=${room.id}`
                  );
                  setToast({
                    message: "Lien d'invitation copié !",
                    type: 'success',
                  });
                }}
              >
                Copier le lien
              </Button>
            </div>
          </div>

          <PlayerList room={room} />

          <div className="lobby-footer">
            <Button variant="secondary" onClick={handleLeaveRoom}>
              Quitter la room
            </Button>
          </div>
        </div>
      </section>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style jsx>{`
        .lobby-page {
          padding-top: 80px;
          min-height: 100vh;
        }
        .lobby {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        .lobby-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .room-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .room-code {
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: var(--accent-color);
          background: rgba(0, 255, 247, 0.1);
          padding: 5px 10px;
          border-radius: 5px;
        }
        .lobby-footer {
          margin-top: 30px;
          text-align: center;
        }
        @media (max-width: 768px) {
          .lobby-header {
            flex-direction: column;
            text-align: center;
          }
          .room-info {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default function PlayPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('room');

  if (!roomId) {
    return (
      <div className="error-page">
        <div className="container">
          <div className="error-content">
            <h2>Lien invalide</h2>
            <p>Aucun ID de room spécifié dans le lien.</p>
            <Button onClick={() => router.push('/hub')}>Retour aux missions</Button>
          </div>
        </div>

        <style jsx>{`
          .error-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .error-content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 100px 0;
          }
          .error-content h2 {
            margin-bottom: 20px;
            color: var(--danger-color);
          }
          .error-content p {
            margin-bottom: 30px;
            font-size: 1.1rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <RoomProvider roomId={roomId}>
      <LobbyContent />
    </RoomProvider>
  );
}
