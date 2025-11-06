'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import MissionModal from '@/components/missions/MissionModal';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { createRoom } from '@/utils/room';
import Toast from '@/components/ui/Toast';

interface Mission {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  image: string;
  status: 'available' | 'coming-soon';
  duration: string;
  players: string;
  difficulty: string;
  rooms: Array<{ name: string; icon: string }>;
  quote: string;
  note: string;
}

export default function MissionDetailClient({ id }: { id: string }) {
  const { user } = useAuth();
  const router = useRouter();

  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  useEffect(() => {
    if (!id) return;

    // Données mockées (comme dans ton fichier)
    const missionsData: Record<string, Mission> = {
      cryostation9: {
        id: 'cryostation9',
        title: 'CryoStation 9',
        subtitle: 'Mission gratuite',
        description:
          'Le vaisseau dérive vers une planète inconnue. Réveillez votre équipe, restaurez les systèmes, évitez le crash.',
        longDescription:
          "Vous vous réveillez de votre cryosommeil pour découvrir que le vaisseau est en état d'alerte critique. Les systèmes de navigation sont hors ligne, les communications avec la Terre sont coupées, et vous dérivez rapidement vers une planète inconnue et potentiellement hostile. Avec votre équipe, vous devez explorer le vaisseau, résoudre des énigmes complexes et réparer les systèmes essentiels avant qu'il ne soit trop tard.",
        image: '/images/missions/cryostation.png',
        status: 'available',
        duration: '~30 min',
        players: '3 joueurs',
        difficulty: 'Moyenne',
        rooms: [
          { name: 'Énergie', icon: '🧊' },
          { name: 'Système', icon: '⚙️' },
          { name: 'Navigation', icon: '🚀' },
        ],
        quote: "Ce qui s'ouvre… se souvient.",
        note: '(Bientôt jouable en ligne — version démo en préparation)',
      },
      'temple-echoes': {
        id: 'temple-echoes',
        title: 'Temple des Échos',
        subtitle: 'Mission premium',
        description:
          'Explorez une jungle perdue où les voix du passé guident votre chemin.',
        longDescription:
          "Au cœur d'une jungle luxuriante et mystérieuse se trouve un temple ancien, abandonné depuis des siècles. Des légendes locales parlent d'un artefact puissant caché dans ses profondeurs, capable de manipuler le temps lui-même. En tant qu'archéologues d'élite, votre équipe a été mandatée pour retrouver cet artefact, mais le temple est rempli de pièges mortels et d'énigmes qui défient la logique.",
        image: '/images/missions/temple.png',
        status: 'coming-soon',
        duration: '~45 min',
        players: '3 à 5',
        difficulty: 'Difficile',
        rooms: [
          { name: 'Entrée', icon: '🌿' },
          { name: 'Salle des échos', icon: '🔊' },
          { name: 'Chambre du temps', icon: '⏳' },
        ],
        quote: 'Le passé résonne dans le présent.',
        note: '(En développement)',
      },
      'veiled-citadel': {
        id: 'veiled-citadel',
        title: 'Citadelle Voilée',
        subtitle: 'Mission premium',
        description:
          "Décryptez les secrets d'une forteresse oubliée dans les brumes du temps.",
        longDescription:
          "Perdue dans les brumes épaisses d'une vallée isolée se dresse la Citadelle Voilée, une forteresse médiévale qui a disparu de toutes les cartes il y a des siècles. Des rumeurs parlent de connaissances interdites et de technologies avancées cachées dans ses murs. En tant qu'explorateurs intrépides, vous devez braver les dangers de la citadelle et percer ses mystères avant que les brumes ne vous engloutissent à jamais.",
        image: '/images/missions/citadel.png',
        status: 'coming-soon',
        duration: '~40 min',
        players: '2 à 4',
        difficulty: 'Moyenne',
        rooms: [
          { name: 'Donjon', icon: '🏰' },
          { name: 'Bibliothèque', icon: '📚' },
          { name: 'Observatoire', icon: '🔭' },
        ],
        quote: 'La connaissance est la clé qui ouvre toutes les portes.',
        note: '(En développement)',
      },
    };

    if (missionsData[id]) {
      setMission(missionsData[id]);
    } else {
      router.push('/hub');
    }

    setLoading(false);
  }, [id, router]);

  const handleCreateGame = async () => {
    if (!user) {
      setToast({
        message: 'Veuillez vous connecter pour créer une partie.',
        type: 'error',
      });
      return;
    }
    if (!mission) return;

    setCreatingRoom(true);
    try {
      // NOTE: tu avais mis 1 ici pour test.
      const requiredPlayers = 1;
      const roomId = await createRoom(user, mission.id, requiredPlayers);
      const inviteLink = `${window.location.origin}/play?room=${roomId}`;

      try {
        await navigator.clipboard.writeText(inviteLink);
        setToast({
          message: "Lien d'invitation copié dans le presse-papiers !",
          type: 'success',
        });
      } catch {
        setToast({
          message: 'Impossible de copier le lien automatiquement.',
          type: 'error',
        });
      }

      router.push(`/play?room=${roomId}`);
    } catch (e) {
      console.error('Error creating room:', e);
      setToast({
        message: 'Une erreur est survenue lors de la création de la room.',
        type: 'error',
      });
    } finally {
      setCreatingRoom(false);
    }
  };

  const handlePreview = () => setShowModal(true);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
        <style jsx>{`
          .loading-page {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: var(--primary-bg);
          }
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid var(--border-color);
            border-top: 3px solid var(--accent-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!mission) return null;

  return (
    <div className="mission-detail-page">
      <Header />

      <section
        className="mission-hero"
        style={{ backgroundImage: `url(${mission.image})` }}
      >
        <div className="mission-hero-overlay"></div>
        <div className="container">
          <div className="mission-hero-content">
            <h1>{mission.title}</h1>
            <h2>{mission.subtitle}</h2>
            <p>{mission.description}</p>
          </div>
        </div>
      </section>

      <section className="mission-details section">
        <div className="container">
          <div className="mission-info">
            <div className="mission-meta">
              <div className="meta-item">
                <span className="meta-label">Durée</span>
                <span className="meta-value">{mission.duration}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Joueurs</span>
                <span className="meta-value">{mission.players}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Difficulté</span>
                <span className="meta-value">{mission.difficulty}</span>
              </div>
            </div>

            <div className="mission-description">
              <h3>Description</h3>
              <p>{mission.longDescription}</p>
            </div>

            <div className="mission-rooms">
              <h3>Salles</h3>
              <div className="rooms-grid">
                {mission.rooms.map((room, index) => (
                  <div key={index} className="room-card">
                    <div className="room-icon">{room.icon}</div>
                    <div className="room-name">{room.name}</div>
                  </div>
                ))}
              </div>
              <p className="rooms-note">Trois salles. Une issue.</p>
            </div>

            <div className="mission-quote">
              <blockquote>
                <p>"{mission.quote}"</p>
              </blockquote>
            </div>

            <div className="mission-note">
              <p>{mission.note}</p>
            </div>

            <div className="mission-actions">
              <Button
                variant="primary"
                onClick={handleCreateGame}
                disabled={mission.status !== 'available' || creatingRoom}
                className={mission.status !== 'available' ? 'disabled' : ''}
              >
                {creatingRoom ? 'Création en cours...' : 'Créer une partie'}
              </Button>
              <Button variant="secondary" onClick={handlePreview}>
                Aperçu immersif
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {showModal && mission && (
        <MissionModal mission={mission} onClose={() => setShowModal(false)} />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style jsx>{`
        .mission-detail-page { padding-top: 80px; }
        .mission-hero { position: relative; height: 60vh; min-height: 400px; background-size: cover; background-position: center; display: flex; align-items: center; }
        .mission-hero-overlay { position: absolute; inset: 0; background: rgba(11, 13, 17, 0.7); }
        .mission-hero-content { position: relative; z-index: 1; max-width: 800px; }
        .mission-hero h1 { margin-bottom: 10px; }
        .mission-hero h2 { color: var(--accent-color); margin-bottom: 20px; }
        .mission-hero p { font-size: 1.2rem; }
        .mission-info { max-width: 800px; margin: 0 auto; }
        .mission-meta { display: flex; justify-content: space-between; margin-bottom: 40px; padding: 20px; background: var(--secondary-bg); border-radius: 10px; border: 1px solid var(--border-color); }
        .meta-item { text-align: center; }
        .meta-label { display: block; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 5px; }
        .meta-value { display: block; color: var(--accent-color); font-weight: 700; font-size: 1.1rem; }
        .mission-description { margin-bottom: 40px; }
        .mission-rooms { margin-bottom: 40px; }
        .rooms-grid { display: flex; justify-content: space-between; margin-bottom: 15px; }
        .room-card { display: flex; flex-direction: column; align-items: center; padding: 20px; background: var(--secondary-bg); border-radius: 10px; border: 1px solid var(--border-color); width: 30%; }
        .room-icon { font-size: 2rem; margin-bottom: 10px; }
        .room-name { font-weight: 500; }
        .rooms-note { text-align: center; font-style: italic; color: var(--text-secondary); }
        .mission-quote { margin-bottom: 40px; text-align: center; }
        .mission-quote blockquote { font-style: italic; font-size: 1.2rem; color: var(--accent-color); position: relative; padding: 0 20px; }
        .mission-note { margin-bottom: 40px; text-align: center; color: var(--text-secondary); font-style: italic; }
        .mission-actions { display: flex; gap: 20px; justify-content: center; }
        .btn.disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 768px) {
          .mission-meta { flex-direction: column; gap: 15px; }
          .rooms-grid { flex-direction: column; gap: 15px; }
          .room-card { width: 100%; }
          .mission-actions { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
