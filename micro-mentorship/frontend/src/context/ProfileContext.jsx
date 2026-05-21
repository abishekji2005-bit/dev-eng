import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../api';

const Ctx = createContext(null);

export function ProfileProvider({ children }) {
  const { isSignedIn } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!isSignedIn) return;
    setLoading(true);
    try {
      const data = await api.getProfile();
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => { refetch(); }, [refetch]);

  const isOnboarded = !!(profile?.role && profile?.team);

  return (
    <Ctx.Provider value={{ profile, loading, refetch, isOnboarded }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProfile must be inside ProfileProvider');
  return ctx;
}
