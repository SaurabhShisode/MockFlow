import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('mockflow_token');
    if (storedToken) {
      setToken(storedToken);
    }

    const unsub = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser || null);
      if (currentUser) {
        const t = await currentUser.getIdToken();
        setToken(t);
        localStorage.setItem('mockflow_token', t);
      } else {
        setToken(null);
        localStorage.removeItem('mockflow_token');
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const currentUser = result.user;
    const t = await currentUser.getIdToken();
    setUser(currentUser);
    setToken(t);
    localStorage.setItem('mockflow_token', t);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setToken(null);
    localStorage.removeItem('mockflow_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
