import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/auth';
import { setAccessToken, setOnUnauthorized } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(clearSession);
  }, [clearSession]);

  // On first load, try to silently restore a session using the
  // httpOnly refresh cookie (if the user still has a valid one).
  useEffect(() => {
    (async () => {
      try {
        const { access_token } = await authApi.refresh();
        setAccessToken(access_token);
        const me = await authApi.me();
        setUser(me);
      } catch {
        clearSession();
      } finally {
        setInitializing(false);
      }
    })();
  }, [clearSession]);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    setAccessToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    return authApi.register(payload);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider value={{ user, initializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
