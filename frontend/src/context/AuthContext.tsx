import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types/user';
import type { AuthTokens } from '../types/auth';
import { fetchMe } from '../api/users';
import * as authApi from '../api/auth';
import { setLogoutCallback, getAccessToken, setTokens } from '../api/client';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login(tokens: AuthTokens): Promise<void>;
  logout(): Promise<void>;
  updateUser(user: User): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const login = useCallback(async (tokens: AuthTokens) => {
    setTokens(tokens.access, tokens.refresh);
    const me = await fetchMe();
    setUser(me);
  }, []);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
  }, []);

  useEffect(() => {
    setLogoutCallback(logout);
  }, [logout]);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      fetchMe()
        .then(setUser)
        .catch(() => setUser(null))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
