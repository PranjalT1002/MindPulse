'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi } from './api';

interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isEphemeral: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  enterEphemeral: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEphemeral, setIsEphemeral] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('mindpulse_token');
    const savedEphemeral = sessionStorage.getItem('mindpulse_ephemeral');

    if (savedEphemeral === 'true') {
      setIsEphemeral(true);
      setIsLoading(false);
      return;
    }

    if (savedToken) {
      authApi.me(savedToken)
        .then((userData) => {
          setUser(userData);
          setToken(savedToken);
        })
        .catch(() => {
          localStorage.removeItem('mindpulse_token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setUser(res.user);
    setToken(res.token);
    setIsEphemeral(false);
    localStorage.setItem('mindpulse_token', res.token);
    sessionStorage.removeItem('mindpulse_ephemeral');
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    const res = await authApi.register(email, password, fullName);
    setUser(res.user);
    setToken(res.token);
    setIsEphemeral(false);
    localStorage.setItem('mindpulse_token', res.token);
    sessionStorage.removeItem('mindpulse_ephemeral');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsEphemeral(false);
    localStorage.removeItem('mindpulse_token');
    sessionStorage.removeItem('mindpulse_ephemeral');
  }, []);

  const enterEphemeral = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsEphemeral(true);
    localStorage.removeItem('mindpulse_token');
    sessionStorage.setItem('mindpulse_ephemeral', 'true');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isEphemeral, login, register, logout, enterEphemeral }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
