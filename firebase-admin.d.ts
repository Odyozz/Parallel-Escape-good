// firebase-admin.d.ts (à la racine du projet)

declare module 'firebase-admin' {
  // On importe les vrais types pour avoir l'autocomplétion
  import * as Admin from 'firebase-admin';
  // On exporte les instances que vous utilisez
  export const adminAuth: Admin.auth.Auth;
  export const adminFirestore: Admin.firestore.Firestore;
}
