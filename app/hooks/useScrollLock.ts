'use client';
import { useEffect } from 'react';

/**
 * Verrouille le scroll de la page tant que `active` est vrai.
 * Supprime automatiquement le lock quand le composant est démonté.
 */
export default function useScrollLock(active: boolean = true) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (active) {
      const scrollY = window.scrollY;
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
      html.style.overflow = 'hidden';
    } else {
      // restaure le scroll normal
      const scrollY = body.style.top ? parseInt(body.style.top || '0', 10) * -1 : 0;
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      html.style.overflow = '';
      window.scrollTo(0, scrollY);
    }

    return () => {
      // restauration à la fermeture du jeu
      html.style.overflow = '';
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
    };
  }, [active]);
}
