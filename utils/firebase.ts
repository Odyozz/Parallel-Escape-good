// utils/firebase.ts
// ⚠️ Ce fichier doit être importé uniquement dans des composants "client".
// N'importe pas ce module côté serveur / API (utilise le SDK Admin pour ça).

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration Firebase — lecture via env variables avec fallback sur tes valeurs
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyA9W-Pf6I8E_TTJjGg4GUgmcWQOiS2iDjY',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'parallel-escape.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'parallel-escape',
  // ✅ bucket correct pour Firestore/Storage Web SDK
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'parallel-escape.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '137883986959',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '1:137883986959:web:1c6de182fe4d050bf9477a',
  // measurementId facultatif côté web
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? 'G-VXM7D166W2',
};

// Singleton: évite l'erreur "Firebase App named '[DEFAULT]' already exists"
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ❗ Important : `getAuth` doit rester côté client.
// Si jamais ce module était importé côté serveur par erreur, ces gardes évitent des crashs.
const isBrowser = typeof window !== 'undefined';

const auth = isBrowser ? getAuth(app) : (null as unknown as ReturnType<typeof getAuth>);
const db = getFirestore(app);

const googleProvider = isBrowser ? new GoogleAuthProvider() : (null as unknown as GoogleAuthProvider);

// Fonctions d'authentification (protégées pour ne pas s'exécuter côté serveur)
const signInWithGoogle = async () => {
  if (!isBrowser) throw new Error('signInWithGoogle must be called in the browser');
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return res.user;
  } catch (err: any) {
    console.error(err);
    alert(err.message);
    return null;
  }
};

const signInAnonymouslyHandler = async () => {
  if (!isBrowser) throw new Error('signInAnonymously must be called in the browser');
  try {
    const res = await signInAnonymously(auth);
    return res.user;
  } catch (err: any) {
    console.error(err);
    alert(err.message);
    return null;
  }
};

export { app, auth, db, signInWithGoogle, signInAnonymouslyHandler };
