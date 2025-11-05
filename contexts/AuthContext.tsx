// contexts/AuthContext.tsx

'use client';

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../utils/firebase';

// --- MODIFICATION : Renommer `currentUser` en `user` ---
interface AuthContextType {
  user: User | null; // Changé de `currentUser` à `user`
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null, // Changé de `currentUser` à `user`
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // Changé de `currentUser` à `user`
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Changé de `setCurrentUser` à `setUser`
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user, // Changé de `currentUser` à `user`
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
