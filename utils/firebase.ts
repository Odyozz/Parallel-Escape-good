import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration Firebase - remplacez par vos propres clés
const firebaseConfig = {
  apiKey: 'AIzaSyA9W-Pf6I8E_TTJjGg4GUgmcWQOiS2iDjY',
  authDomain: 'parallel-escape.firebaseapp.com',
  projectId: 'parallel-escape',
  storageBucket: 'parallel-escape.firebasestorage.app',
  messagingSenderId: '137883986959',
  appId: '1:137883986959:web:1c6de182fe4d050bf9477a',
  measurementId: 'G-VXM7D166W2',
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Fonctions d'authentification
const signInWithGoogle = async () => {
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
  try {
    const res = await signInAnonymously(auth);
    return res.user;
  } catch (err: any) {
    console.error(err);
    alert(err.message);
    return null;
  }
};

export { auth, db, signInWithGoogle, signInAnonymouslyHandler };
