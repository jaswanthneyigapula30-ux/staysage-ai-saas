'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Profile } from '@/lib/db';

interface AuthContextType {
  user: Profile | null;
  avatarUrl: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if session exists in localStorage
    const savedSession = localStorage.getItem('staysage_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setUser(parsed.user);
        setAvatarUrl(parsed.avatarUrl);
      } catch (e) {
        console.error('Failed to parse saved session:', e);
        localStorage.removeItem('staysage_session');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        return { success: false, error: data.error || 'Authentication failed' };
      }

      if (data.session) {
        setUser(data.session.user);
        setAvatarUrl(data.session.avatarUrl);
        localStorage.setItem('staysage_session', JSON.stringify(data.session));
        setLoading(false);
        router.push('/');
        return { success: true };
      }

      setLoading(false);
      return { success: false, error: 'Malformed response from authentication server' };
    } catch (e: any) {
      setLoading(false);
      return { success: false, error: e.message || 'Network error' };
    }
  };

  const logout = async () => {
    setUser(null);
    setAvatarUrl(null);
    localStorage.removeItem('staysage_session');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, avatarUrl, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
