// app/lib/firebase-admin.ts
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Récupération/normalisation de la clé privée
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';

// Enlève d'éventuels guillemets globaux et remet de vrais retours à la ligne
privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');

// Initialise l'app Admin une seule fois
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

// Exports à utiliser côté serveur
export const adminAuth = getAuth();
export const adminFirestore = getFirestore();
