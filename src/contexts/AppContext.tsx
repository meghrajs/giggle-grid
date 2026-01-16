import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getProgress,
  getSettings,
  getSession,
  saveSettings,
  updateGameProgress as updateGameProgressStorage,
  resetProgress as resetProgressStorage,
  startSession as startSessionStorage,
  lockSession,
  unlockSession as unlockSessionStorage,
  getRemainingTime,
  type ProgressData,
  type SettingsData,
  type SessionData,
} from '@/lib/storage';

interface AppContextType {
  // Progress
  progress: ProgressData;
  updateGameProgress: (gameId: string, starsEarned: number, completed?: boolean) => void;
  resetProgress: () => void;

  // Settings
  settings: SettingsData;
  updateSettings: (updates: Partial<SettingsData>) => void;
  toggleSound: () => void;
  toggleTVMode: () => void;
  setSessionLength: (length: 10 | 20 | 30 | null) => void;

  // Session
  session: SessionData;
  remainingTime: number | null;
  startSession: (duration: number) => void;
  unlockSession: () => void;
  isSessionExpired: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<ProgressData>(getProgress);
  const [settings, setSettings] = useState<SettingsData>(getSettings);
  const [session, setSession] = useState<SessionData>(getSession);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Update remaining time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getRemainingTime();
      setRemainingTime(remaining);

      if (remaining !== null && remaining <= 0 && !session.isLocked) {
        lockSession();
        setSession((prev) => ({ ...prev, isLocked: true }));
        setIsSessionExpired(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session.isLocked]);

  // Apply TV mode class to body
  useEffect(() => {
    if (settings.tvMode) {
      document.body.classList.add('tv-mode');
    } else {
      document.body.classList.remove('tv-mode');
    }
  }, [settings.tvMode]);

  const updateGameProgress = useCallback((gameId: string, starsEarned: number, completed = true) => {
    const newProgress = updateGameProgressStorage(gameId, starsEarned, completed);
    setProgress(newProgress);
  }, []);

  const resetProgress = useCallback(() => {
    resetProgressStorage();
    setProgress(getProgress());
  }, []);

  const updateSettings = useCallback((updates: Partial<SettingsData>) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...updates };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  const toggleSound = useCallback(() => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  }, [settings.soundEnabled, updateSettings]);

  const toggleTVMode = useCallback(() => {
    updateSettings({ tvMode: !settings.tvMode });
  }, [settings.tvMode, updateSettings]);

  const setSessionLength = useCallback((length: 10 | 20 | 30 | null) => {
    updateSettings({ sessionLength: length });
  }, [updateSettings]);

  const handleStartSession = useCallback((duration: number) => {
    const newSession = startSessionStorage(duration);
    setSession(newSession);
    setIsSessionExpired(false);
  }, []);

  const handleUnlockSession = useCallback(() => {
    unlockSessionStorage();
    setSession(getSession());
    setIsSessionExpired(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        progress,
        updateGameProgress,
        resetProgress,
        settings,
        updateSettings,
        toggleSound,
        toggleTVMode,
        setSessionLength,
        session,
        remainingTime,
        startSession: handleStartSession,
        unlockSession: handleUnlockSession,
        isSessionExpired,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
