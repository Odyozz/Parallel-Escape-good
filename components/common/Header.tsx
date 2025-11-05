'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../auth/LoginModal';
import UserProfile from '../auth/UserProfile';
import { usePathname } from 'next/navigation';

const Header = () => {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const pathname = usePathname();

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <h2>Parallel Escape</h2>
            </div>
            <nav className="nav">
              <ul>
                <li>
                  <a href="/" className={pathname === '/' ? 'active' : ''}>
                    Accueil
                  </a>
                </li>
                <li>
                  <a
                    href="/hub"
                    className={pathname === '/hub' ? 'active' : ''}
                  >
                    Missions
                  </a>
                </li>
                {user && (
                  <li>
                    <a
                      href="/profile"
                      className={pathname === '/profile' ? 'active' : ''}
                    >
                      Profil
                    </a>
                  </li>
                )}
              </ul>
            </nav>
            <div className="auth-buttons">
              {user ? (
                <div
                  className="user-profile-trigger"
                  onClick={handleProfileClick}
                >
                  <div className="user-avatar">
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
                </div>
              ) : (
                <button className="btn" onClick={handleLoginClick}>
                  Connexion
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
    </>
  );
};

export default Header;
