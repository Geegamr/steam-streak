export const getUserSteamID = (): string => {
  const w = window as any;
  
  if (w.App?.m_CurrentUser?.strSteamID) {
    return String(w.App.m_CurrentUser.strSteamID);
  }
  
  if (w.g_steamID) {
    return String(w.g_steamID);
  }
  
  const g = globalThis as any;
  if (g.g_steamID) {
    return String(g.g_steamID);
  }
  
  const storageKeys = Object.keys(localStorage);
  for (const key of storageKeys) {
    if (key.startsWith('steam_streak_')) {
      const idMatch = key.match(/steam_streak_(\d{17})_/);
      if (idMatch) {
        return idMatch[1];
      }
    }
  }
  
  console.warn('[GameStreak] Steam ID not found');
  return 'default';
};
