import { getUserSteamID } from "./user-id.js";

const GAME_STREAK_PREFIX = "game_streak_";
const SECRET_KEY = "steam_streak_v2_secret";
const MIGRATION_KEY = "game_streak_migration_v2";

function getCurrentSteamID(): string {
  return getUserSteamID();
}

function migrateOldData(): void {
  const steamId = getCurrentSteamID();
  if (steamId === 'default') return;
  
  const migrationData = localStorage.getItem(MIGRATION_KEY);
  const migratedIds = migrationData ? JSON.parse(migrationData) : [];
  
  if (migratedIds.includes(steamId)) {
    return;
  }
  
  const keysToMigrate: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(GAME_STREAK_PREFIX)) {
      const afterPrefix = key.substring(GAME_STREAK_PREFIX.length);
      if (afterPrefix && !afterPrefix.includes('_') && /^\d+$/.test(afterPrefix)) {
        keysToMigrate.push(key);
      }
    }
  }
  
  if (keysToMigrate.length > 0) {
    console.log(`[GameStreak] Migrating ${keysToMigrate.length} old streak records to Steam ID: ${steamId}`);
    keysToMigrate.forEach(oldKey => {
      const appId = oldKey.replace(GAME_STREAK_PREFIX, '');
      const newKey = `${GAME_STREAK_PREFIX}${steamId}_${appId}`;
      const data = localStorage.getItem(oldKey);
      
      if (data && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, data);
        console.log(`[GameStreak] Migrated ${oldKey} -> ${newKey}`);
      }
      
      localStorage.removeItem(oldKey);
    });
  }
  
  migratedIds.push(steamId);
  localStorage.setItem(MIGRATION_KEY, JSON.stringify(migratedIds));
  console.log(`[GameStreak] Migration completed for Steam ID: ${steamId}`);
}

interface GameStreakData {
  streak: number;
  lastPlayed: string;
  bestStreak: number;
  _hash?: string;
}

function simpleHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  return Math.abs(hash).toString(36);
}

function createHash(appId: number, streak: number, lastPlayed: string, bestStreak: number): string {
  const dataString = `${appId}:${streak}:${lastPlayed}:${bestStreak}:${SECRET_KEY}`;
  return simpleHash(dataString);
}

function verifyData(appId: number, data: GameStreakData): boolean {
  if (!data._hash) return false;
  const expectedHash = createHash(appId, data.streak, data.lastPlayed, data.bestStreak);
  return data._hash === expectedHash;
}

function toLocalDateString(timestamp?: number): string {
  const date = timestamp ? new Date(timestamp * 1000) : new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toLocalDateString(d.getTime() / 1000);
}

export function getGameStreak(appId: number): GameStreakData {
  migrateOldData();
  const steamId = getCurrentSteamID();
  const key = `${GAME_STREAK_PREFIX}${steamId}_${appId}`;
  const raw = localStorage.getItem(key);
  if (!raw) return { streak: 0, lastPlayed: "", bestStreak: 0 };
  try {
    const data = JSON.parse(raw);
    
    if (!verifyData(appId, data)) {
      console.warn(`[GameStreak] Data integrity check failed for game ${appId}, resetting streak`);
      return { streak: 0, lastPlayed: "", bestStreak: 0 };
    }
    
    return data;
  } catch {
    return { streak: 0, lastPlayed: "", bestStreak: 0 };
  }
}

export function updateGameStreak(
  appId: number,
  rtLastTimePlayed: number
): GameStreakData {
  const data = getGameStreak(appId);
  const playedDate = toLocalDateString(rtLastTimePlayed);
  const today = toLocalDateString();
  const yesterday = getYesterday();

  if (playedDate !== today && playedDate !== yesterday) {
    if (data.streak === 0 && data.lastPlayed !== "") return data;
    data.streak = 0;
    data.lastPlayed = playedDate;
    const steamId = getCurrentSteamID();
    const key = `${GAME_STREAK_PREFIX}${steamId}_${appId}`;
    localStorage.setItem(key, JSON.stringify(data));
    return data;
  }

  if (data.lastPlayed === playedDate) return data;

  if (data.lastPlayed === "" || data.lastPlayed === yesterday) {
    data.streak++;
  } else if (data.lastPlayed === today) {
    return data;
  } else {
    data.streak = 1;
  }

  data.lastPlayed = playedDate;
  if (data.streak > data.bestStreak) {
    data.bestStreak = data.streak;
  }

  data._hash = createHash(appId, data.streak, data.lastPlayed, data.bestStreak);

  const steamId = getCurrentSteamID();
  const key = `${GAME_STREAK_PREFIX}${steamId}_${appId}`;
  localStorage.setItem(key, JSON.stringify(data));
  return data;
}
