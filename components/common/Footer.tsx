'use client';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <h2>Parallel Escape</h2>
            <p>Échappez-vous ensemble, en ligne.</p>
          </div>
          <div className="footer-links">
            <ul>
              <li>
                <a href="/">Accueil</a>
              </li>
              <li>
                <a href="/hub">Missions</a>
              </li>
              <li>
                <a href="/profile">Profil</a>
              </li>
            </ul>
          </div>
          <div className="footer-contact">
            <p>Contact : contact@parallelescape.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Parallel Escape — Tous droits réservés</p>
          <p>Un projet d'escape games coopératifs en ligne.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
