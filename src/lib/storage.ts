// localStorage keys
const STORAGE_KEYS = {
  PROGRESS: 'brightboard_progress',
  SETTINGS: 'brightboard_settings',
  SESSION: 'brightboard_session',
} as const;

// Types
export interface GameProgress {
  bestScore: number;
  completedCount: number;
  lastPlayedAt: string | null;
  totalStars: number;
}

export interface ProgressData {
  totalStars: number;
  games: Record<string, GameProgress>;
}

export interface SettingsData {
  soundEnabled: boolean;
  tvMode: boolean;
  sessionLength: 10 | 20 | 30 | null;
  parentPIN: string;
}

export interface SessionData {
  startedAt: string | null;
  duration: number; // in minutes
  isLocked: boolean;
}

// Default values
const DEFAULT_PROGRESS: ProgressData = {
  totalStars: 0,
  games: {},
};

const DEFAULT_SETTINGS: SettingsData = {
  soundEnabled: true,
  tvMode: false,
  sessionLength: null,
  parentPIN: '1234',
};

const DEFAULT_SESSION: SessionData = {
  startedAt: null,
  duration: 0,
  isLocked: false,
};

// Helper functions
function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function safeSetItem(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Progress functions
export function getProgress(): ProgressData {
  return safeGetItem(STORAGE_KEYS.PROGRESS, DEFAULT_PROGRESS);
}

export function saveProgress(progress: ProgressData): void {
  safeSetItem(STORAGE_KEYS.PROGRESS, progress);
}

export function updateGameProgress(
  gameId: string,
  starsEarned: number,
  completed: boolean
): ProgressData {
  const progress = getProgress();
  
  const gameProgress = progress.games[gameId] || {
    bestScore: 0,
    completedCount: 0,
    lastPlayedAt: null,
    totalStars: 0,
  };
  
  gameProgress.totalStars += starsEarned;
  gameProgress.lastPlayedAt = new Date().toISOString();
  
  if (completed) {
    gameProgress.completedCount += 1;
  }
  
  if (starsEarned > gameProgress.bestScore) {
    gameProgress.bestScore = starsEarned;
  }
  
  progress.games[gameId] = gameProgress;
  progress.totalStars += starsEarned;
  
  saveProgress(progress);
  return progress;
}

export function resetProgress(): void {
  safeSetItem(STORAGE_KEYS.PROGRESS, DEFAULT_PROGRESS);
}

export function getGameProgress(gameId: string): GameProgress | null {
  const progress = getProgress();
  return progress.games[gameId] || null;
}

// Settings functions
export function getSettings(): SettingsData {
  return safeGetItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings: SettingsData): void {
  safeSetItem(STORAGE_KEYS.SETTINGS, settings);
}

export function updateSetting<K extends keyof SettingsData>(
  key: K,
  value: SettingsData[K]
): SettingsData {
  const settings = getSettings();
  settings[key] = value;
  saveSettings(settings);
  return settings;
}

// Session functions
export function getSession(): SessionData {
  return safeGetItem(STORAGE_KEYS.SESSION, DEFAULT_SESSION);
}

export function saveSession(session: SessionData): void {
  safeSetItem(STORAGE_KEYS.SESSION, session);
}

export function startSession(duration: number): SessionData {
  const session: SessionData = {
    startedAt: new Date().toISOString(),
    duration,
    isLocked: false,
  };
  saveSession(session);
  return session;
}

export function endSession(): void {
  saveSession(DEFAULT_SESSION);
}

export function lockSession(): void {
  const session = getSession();
  session.isLocked = true;
  saveSession(session);
}

export function unlockSession(): void {
  const session = getSession();
  session.isLocked = false;
  session.startedAt = null;
  saveSession(session);
}

export function getRemainingTime(): number | null {
  const session = getSession();
  if (!session.startedAt || !session.duration) return null;
  
  const startTime = new Date(session.startedAt).getTime();
  const endTime = startTime + session.duration * 60 * 1000;
  const remaining = endTime - Date.now();
  
  return Math.max(0, remaining);
}
