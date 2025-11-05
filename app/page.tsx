'use client';

import { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDiscoverMissions = () => {
    router.push('/hub');
  };

  return (
    <div className="home-page">
      <Header />

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="fade-in">Parallel Escape</h1>
            <p className="fade-in">Échappez-vous ensemble, en ligne.</p>
            <p className="fade-in">
              Des missions immersives à plusieurs, dans des univers parallèles.
            </p>
            <p className="fade-in">
              Communication, logique, tension — tout se joue à plusieurs.
            </p>

            <div className="hero-cta fade-in">
              <button
                className="btn btn-primary pulse"
                onClick={handleDiscoverMissions}
              >
                Découvrir les missions
              </button>
            </div>
          </div>

          <div className="hero-image fade-in">
            <div className="hero-image-placeholder">
              <div className="floating-elements">
                <div className="element element-1"></div>
                <div className="element element-2"></div>
                <div className="element element-3"></div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="hero-bg"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        ></div>
      </section>

      <section className="featured-mission section">
        <div className="container">
          <div className="section-header">
            <h2 className="fade-in">Première mission disponible</h2>
            <h3 className="fade-in">CryoStation 9</h3>
            <p className="fade-in">Sauvez le vaisseau avant le crash.</p>
          </div>

          <div className="featured-content fade-in">
            <div className="featured-image">
              <div className="featured-image-placeholder">
                {/* Image de la mission CryoStation 9 */}
              </div>
            </div>

            <div className="featured-info">
              <p>
                Le vaisseau dérive vers une planète inconnue. Réveillez votre
                équipe, restaurez les systèmes, évitez le crash.
              </p>

              <div className="mission-details">
                <div className="mission-detail-item">
                  <span>⏱️</span>
                  <span>30 min</span>
                </div>
                <div className="mission-detail-item">
                  <span>👥</span>
                  <span>2-4 joueurs</span>
                </div>
                <div className="mission-detail-item">
                  <span>🎯</span>
                  <span>Difficulté moyenne</span>
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => router.push('/mission/cryostation9')}
              >
                Découvrir la mission
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="coming-soon section">
        <div className="container">
          <div className="section-header">
            <h2 className="fade-in">D&apos;autres mondes vous attendent...</h2>
            <p className="fade-in">
              Temple des Échos et Citadelle Voilée arrivent bientôt.
            </p>
          </div>

          <div className="coming-soon-grid fade-in">
            <div className="card coming-soon-card">
              <div className="coming-soon-image">
                <div className="coming-soon-image-placeholder">
                  {/* Image du Temple des Échos */}
                </div>
              </div>
              <h3>Temple des Échos</h3>
              <p>
                Explorez une jungle perdue où les voix du passé guident votre
                chemin.
              </p>
              <button className="btn btn-secondary" disabled>
                Prochainement
              </button>
            </div>

            <div className="card coming-soon-card">
              <div className="coming-soon-image">
                <div className="coming-soon-image-placeholder">
                  {/* Image de la Citadelle Voilée */}
                </div>
              </div>
              <h3>Citadelle Voilée</h3>
              <p>
                Décryptez les secrets d&apos;une forteresse oubliée dans les
                brumes du temps.
              </p>
              <button className="btn btn-secondary" disabled>
                Prochainement
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .home-page {
          padding-top: 80px;
        }
        
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        
        .hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 50%, rgba(0, 255, 247, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(0, 255, 247, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(0, 255, 247, 0.05) 0%, transparent 50%);
          z-index: -1;
        }
        
        .hero-content {
          max-width: 600px;
        }
        
        .hero-content p {
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
        }
        
        .hero-cta {
          margin-top: 2rem;
        }
        
        .hero-image {
          position: absolute;
          top: 50%;
          right: 10%;
          transform: translateY(-50%);
          width: 400px;
          height: 400px;
        }
        
        .hero-image-placeholder {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .floating-elements {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .element {
          position: absolute;
          border-radius: 50%;
          background: rgba(0, 255, 247, 0.1);
          border: 1px solid var(--accent-color);
        }
        
        .element-1 {
          width: 150px;
          height: 150px;
          top: 20%;
          left: 20%;
          animation: float 6s ease-in-out infinite;
        }
        
        .element-2 {
          width: 100px;
          height: 100px;
          top: 50%;
          right: 20%;
          animation: float 8s ease-in-out infinite;
        }
        
        .element-3 {
          width: 80px;
          height: 80px;
          bottom: 20%;
          left: 30%;
          animation: float 7s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }
        
        .section-header h2 {
          margin-bottom: 10px;
        }
        
        .featured-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        
        .featured-image-placeholder {
          width: 100%;
          height: 400px;
          background: var(--secondary-bg);
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }
        
        .featured-info p {
          font-size: 1.1rem;
          margin-bottom: 30px;
        }
        
        .mission-details {
          display: flex;
          gap: 30px;
          margin-bottom: 30px;
        }
        
        .mission-detail-item {
          display: flex;
          align-items: center;
          font-size: 1rem;
        }
        
        .mission-detail-item span:first-child {
          margin-right: 10px;
          font-size: 1.2rem;
        }
        
        .coming-soon-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
        }
        
        .coming-soon-card {
          text-align: center;
          padding: 40px;
        }
        
        .coming-soon-image {
          margin-bottom: 30px;
        }
        
        .coming-soon-image-placeholder {
          width: 100%;
          height: 200px;
          background: var(--secondary-bg);
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }
        
        .coming-soon-card h3 {
          margin-bottom: 15px;
        }
        
        .coming-soon-card p {
          margin-bottom: 30px;
        }
        
        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeIn 0.8s ease forwards;
        }
        
        .fade-in:nth-child(1) { animation-delay: 0.2s; }
        .fade-in:nth-child(2) { animation-delay: 0.4s; }
        .fade-in:nth-child(3) { animation-delay: 0.6s; }
        .fade-in:nth-child(4) { animation-delay: 0.8s; }
        
        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 992px) {
          .hero-image { display: none; }
          .featured-content { grid-template-columns: 1fr; }
          .coming-soon-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
