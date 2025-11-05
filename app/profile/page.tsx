'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../utils/firebase';
import Button from '../../components/ui/Button';

interface UserStats {
  gamesPlayed: number;
  totalTime: number;
  bestTime: number | null;
  rank: number | null;
}

interface Game {
  id: string;
  mission: string;
  date: string;
  duration: number;
  completed: boolean;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    gamesPlayed: 0,
    totalTime: 0,
    bestTime: null,
    rank: null,
  });
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données utilisateur depuis Firebase
    const fetchUserData = async () => {
      // Dans une vraie application, ces données viendraient de Firestore
      const stats: UserStats = {
        gamesPlayed: 5,
        totalTime: 145, // en minutes
        bestTime: 22, // en minutes
        rank: 42,
      };

      const games: Game[] = [
        {
          id: '1',
          mission: 'CryoStation 9',
          date: '2025-07-15',
          duration: 28,
          completed: true,
        },
        {
          id: '2',
          mission: 'CryoStation 9',
          date: '2025-07-10',
          duration: 35,
          completed: true,
        },
        {
          id: '3',
          mission: 'CryoStation 9',
          date: '2025-07-05',
          duration: 22,
          completed: true,
        },
        {
          id: '4',
          mission: 'CryoStation 9',
          date: '2025-06-28',
          duration: 30,
          completed: true,
        },
        {
          id: '5',
          mission: 'CryoStation 9',
          date: '2025-06-20',
          duration: 30,
          completed: true,
        },
      ];

      setUserStats(stats);
      setRecentGames(games);
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleSignOut = () => {
    auth.signOut();
  };

  if (!user) {
    return (
      <div className="not-logged-in">
        <Header />
        <div className="container">
          <div className="not-logged-in-content">
            <h2>Vous n&apos;êtes pas connecté</h2>
            <p>Veuillez vous connecter pour accéder à votre profil.</p>
            <Button
              variant="primary"
              onClick={() => (window.location.href = '/')}
            >
              Retour à l&apos;accueil
            </Button>
          </div>
        </div>
        <Footer />

        <style jsx>{`
          .not-logged-in {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          
          .not-logged-in-content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 100px 0;
          }
          
          .not-logged-in-content h2 {
            margin-bottom: 20px;
          }
          
          .not-logged-in-content p {
            margin-bottom: 30px;
            font-size: 1.1rem;
          }
        `}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />

      <section className="profile-hero section">
        <div className="container">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {user.displayName
                    ? user.displayName.charAt(0).toUpperCase()
                    : 'A'}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h1>{user.displayName || 'Joueur Anonyme'}</h1>
              <p>{user.email || 'Connexion anonyme'}</p>
              <Button variant="secondary" onClick={handleSignOut}>
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="profile-stats section">
        <div className="container">
          <h2>Statistiques</h2>
          <div className="stats-grid grid grid-4">
            <div className="stat-card">
              <div className="stat-value">{userStats.gamesPlayed}</div>
              <div className="stat-label">Parties jouées</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{userStats.totalTime} min</div>
              <div className="stat-label">Temps total</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{userStats.bestTime} min</div>
              <div className="stat-label">Meilleur temps</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">#{userStats.rank}</div>
              <div className="stat-label">Rang global</div>
            </div>
          </div>
        </div>
      </section>

      <section className="recent-games section">
        <div className="container">
          <h2>Parties récentes</h2>
          <div className="games-list">
            {recentGames.map((game) => (
              <div key={game.id} className="game-item">
                <div className="game-info">
                  <h3>{game.mission}</h3>
                  <p>Date: {game.date}</p>
                </div>
                <div className="game-result">
                  <div className="game-duration">
                    <span>⏱️</span>
                    <span>{game.duration} min</span>
                  </div>
                  <div
                    className={`game-status ${
                      game.completed ? 'completed' : 'failed'
                    }`}
                  >
                    {game.completed ? '✅ Terminé' : '❌ Échec'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="team-section section">
        <div className="container">
          <h2>Équipe</h2>
          <div className="team-placeholder">
            <p>Créez ou rejoignez une équipe pour jouer avec vos amis.</p>
            <Button variant="primary" disabled>
              Bientôt disponible
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .profile-page {
          padding-top: 80px;
        }
        
        .loading-page {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: var(--primary-bg);
        }
        
        .profile-hero {
          padding: 40px 0;
        }
        
        .profile-header {
          display: flex;
          align-items: center;
          gap: 30px;
        }
        
        .profile-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid var(--accent-color);
        }
        
        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: var(--secondary-bg);
          color: var(--accent-color);
          font-weight: 700;
          font-size: 3rem;
        }
        
        .profile-info h1 {
          margin-bottom: 10px;
        }
        
        .profile-info p {
          margin-bottom: 20px;
          color: var(--text-secondary);
        }
        
        .profile-stats {
          padding: 40px 0;
        }
        
        .profile-stats h2 {
          margin-bottom: 30px;
          text-align: center;
        }
        
        .stats-grid {
          gap: 20px;
        }
        
        .stat-card {
          background: var(--card-bg);
          border-radius: 10px;
          padding: 30px;
          text-align: center;
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          border-color: var(--accent-color);
        }
        
        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--accent-color);
          margin-bottom: 10px;
        }
        
        .stat-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .recent-games {
          padding: 40px 0;
        }
        
        .recent-games h2 {
          margin-bottom: 30px;
        }
        
        .games-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .game-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--card-bg);
          border-radius: 10px;
          padding: 20px;
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
        }
        
        .game-item:hover {
          transform: translateX(5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          border-color: var(--accent-color);
        }
        
        .game-info h3 {
          margin-bottom: 5px;
        }
        
        .game-info p {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        
        .game-result {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .game-duration {
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--text-secondary);
        }
        
        .game-status {
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .game-status.completed {
          background: rgba(0, 212, 102, 0.2);
          color: var(--success-color);
        }
        
        .game-status.failed {
          background: rgba(255, 59, 48, 0.2);
          color: var(--danger-color);
        }
        
        .team-section {
          padding: 40px 0;
        }
        
        .team-section h2 {
          margin-bottom: 30px;
          text-align: center;
        }
        
        .team-placeholder {
          background: var(--card-bg);
          border-radius: 10px;
          padding: 40px;
          text-align: center;
          border: 1px solid var(--border-color);
        }
        
        .team-placeholder p {
          margin-bottom: 20px;
          font-size: 1.1rem;
        }
        
        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            text-align: center;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .game-item {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
          
          .game-result {
            width: 100%;
            justify-content: space-between;
          }
        }
        
        @media (max-width: 576px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
