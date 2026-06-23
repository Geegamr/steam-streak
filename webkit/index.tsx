export default async function WebkitMain() {
  console.log('[SteamStreak] Webkit module loaded');

  function getCurrentSteamID(): string {
    const cachedOwnID = localStorage.getItem('steam_streak_own_id');
    if (cachedOwnID) return cachedOwnID;

    if (typeof (window as any).g_steamID !== 'undefined') {
      console.log('[SteamStreak Webkit] g_steamID found:', (window as any).g_steamID);
      return (window as any).g_steamID;
    }

    const urlMatch = window.location.href.match(/profiles\/(\d+)/);
    if (urlMatch) {
      console.log('[SteamStreak Webkit] Steam ID from URL:', urlMatch[1]);
      return urlMatch[1];
    }

    console.warn('[SteamStreak Webkit] Steam ID not found, using generic key');
    return 'unknown_user';
  }

  function tryDetectAndSaveOwnID(): void {
    if (localStorage.getItem('steam_streak_own_id')) return;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('game_streak_')) {
        const match = key.match(/^game_streak_(\d{17})_/);
        if (match) {
          localStorage.setItem('steam_streak_own_id', match[1]);
          console.log('[SteamStreak] Own Steam ID detected from game streak data:', match[1]);
          return;
        }
      }
    }

    const urlMatch = window.location.href.match(/profiles\/(\d+)/);
    if (!urlMatch) return;

    const editBtn = document.querySelector(
      'a[href*="edit/info"], button[class*="edit"], [class*="profile_header_actions"] a, [class*="EditProfile"]'
    );
    if (editBtn) {
      localStorage.setItem('steam_streak_own_id', urlMatch[1]);
      console.log('[SteamStreak] Own Steam ID saved via edit button class:', urlMatch[1]);
      return;
    }

    const allButtons = document.querySelectorAll('button, [role="button"], a');
    for (const btn of Array.from(allButtons)) {
      const text = (btn as HTMLElement).innerText || '';
      if (text.includes('Редактировать') || text.includes('Edit') ||
          text.includes('Редагувати') || text.includes('编辑') ||
          text.includes('編輯') || text.includes('プロフィールを編集') ||
          text.includes('Bearbeiten') || text.includes('Modifier') ||
          text.includes('Editar') || text.includes('Modifica')) {
        localStorage.setItem('steam_streak_own_id', urlMatch[1]);
        console.log('[SteamStreak] Own Steam ID saved via button text:', urlMatch[1]);
        break;
      }
    }
  }

const SECRET_KEY = "steam_streak_v2_secret";
const STORAGE_KEY_PREFIX = 'steam_streak_';

function simpleHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function createProfileHash(steamId: string, streak: number, totalDays: number, bestStreak: number): string {
  const dataString = `${steamId}:${streak}:${totalDays}:${bestStreak}:${SECRET_KEY}`;
  return simpleHash(dataString);
}

function verifyProfileData(steamId: string, streak: number, totalDays: number, bestStreak: number, storedHash: string | null): boolean {
  if (!storedHash) return false;
  const expectedHash = createProfileHash(steamId, streak, totalDays, bestStreak);
  return storedHash === expectedHash;
}

function getStorageKey(key: string): string {
  const steamID = getCurrentSteamID();
  return `${STORAGE_KEY_PREFIX}${steamID}_${key}`;
}

const STORAGE_KEY_STREAK = () => getStorageKey('count');
const STORAGE_KEY_DATE = () => getStorageKey('date');
const STORAGE_KEY_TOTAL = () => getStorageKey('total');
const STORAGE_KEY_BEST = () => getStorageKey('best');
const STORAGE_KEY_HASH = () => getStorageKey('hash');
const STORAGE_KEY_VERSION = () => getStorageKey('version');
const PLUGIN_VERSION = '1.0.0';

function checkAndMigrateData() {
  const storedVersion = localStorage.getItem(STORAGE_KEY_VERSION());
  
  console.log('[SteamStreak] Current user Steam ID:', getCurrentSteamID());
  
  if (!storedVersion) {

    console.log('[SteamStreak] First installation for this user - initializing fresh data');

    localStorage.setItem(STORAGE_KEY_STREAK(), '0');
    localStorage.setItem(STORAGE_KEY_DATE(), '');
    localStorage.setItem(STORAGE_KEY_TOTAL(), '0');
    localStorage.setItem(STORAGE_KEY_BEST(), '0');
    localStorage.setItem(STORAGE_KEY_VERSION(), PLUGIN_VERSION);
  } else if (storedVersion !== PLUGIN_VERSION) {

    console.log('[SteamStreak] Plugin updated from', storedVersion, 'to', PLUGIN_VERSION);
    localStorage.setItem(STORAGE_KEY_VERSION(), PLUGIN_VERSION);
  }
}

checkAndMigrateData();

function getProgressColors(streak: number): { start: string; end: string } {
  if (streak < 10) {
    return { start: '#ffd700', end: '#ff6600' };
  } else if (streak < 30) {
    return { start: '#ff6600', end: '#ff3333' };
  } else if (streak < 100) {
    return { start: '#ff3333', end: '#ff69b4' };
  } else if (streak < 300) {
    return { start: '#ff69b4', end: '#7b4397' };
  } else {

    return { start: '#7b4397', end: '#7b4397' };
  }
}

function getNextLevel(streak: number): { name: string; daysLeft: number; color: string } {
  if (streak < 10) {
    return { name: 'Blaze', daysLeft: 10 - streak, color: '#ff6600' };
  } else if (streak < 30) {
    return { name: 'Ascension', daysLeft: 30 - streak, color: '#ff3333' };
  } else if (streak < 100) {
    return { name: 'Nova', daysLeft: 100 - streak, color: '#ff69b4' };
  } else if (streak < 300) {
    return { name: 'Eternal Flame', daysLeft: 300 - streak, color: '#7b4397' };
  } else {
    return { name: 'Eternal Flame', daysLeft: 0, color: '#7b4397' };
  }
}

function getStreakNumberColor(streak: number): string {
  if (streak < 10) {

    return '#ffa500';
  } else if (streak < 30) {
    return '#ff6600';
  } else if (streak < 100) {
    return '#ff3333';
  } else if (streak < 300) {
    return '#ff69b4';
  } else {
    return '#7b4397';
  }
}


function getProgressSVG(color: string = '#06bfff'): string {
  return `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 13V3M8 3L4 7M8 3l4 4" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="8" cy="8" r="7" stroke="${color}" stroke-width="1.5" fill="none" opacity="0.3"/>
    </svg>
  `;
}


function getTodayString(): string {
  return new Date().toLocaleDateString();
}

function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toLocaleDateString();
}

function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  
  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
}

function formatTime(hours: number, minutes: number, seconds: number): string {
  const h = hours.toString().padStart(2, '0');
  const m = minutes.toString().padStart(2, '0');
  const s = seconds.toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function getStreakData() {
  const streak = parseInt(localStorage.getItem(STORAGE_KEY_STREAK()) || '0');
  const lastDate = localStorage.getItem(STORAGE_KEY_DATE()) || '';
  const totalDays = parseInt(localStorage.getItem(STORAGE_KEY_TOTAL()) || '0');
  const bestStreak = parseInt(localStorage.getItem(STORAGE_KEY_BEST()) || '0');
  const storedHash = localStorage.getItem(STORAGE_KEY_HASH());
  
  console.log('[SteamStreak] === getStreakData called ===');
  console.log('[SteamStreak] Steam ID:', getCurrentSteamID());
  console.log('[SteamStreak] localStorage keys:', {
    streak: STORAGE_KEY_STREAK(),
    date: STORAGE_KEY_DATE(),
    total: STORAGE_KEY_TOTAL(),
    best: STORAGE_KEY_BEST()
  });
  console.log('[SteamStreak] Parsed values:', { streak, lastDate, totalDays, bestStreak });

  const steamId = getCurrentSteamID();
  if (streak > 0 && !verifyProfileData(steamId, streak, totalDays, bestStreak, storedHash)) {
    console.warn('[SteamStreak] Profile data integrity check failed, resetting streak');
    return { streak: 0, lastDate: '', totalDays: 0, bestStreak: 0 };
  }
  
  return { streak, lastDate, totalDays, bestStreak };
}

function canClickToday(): boolean {
  const { lastDate } = getStreakData();
  const today = getTodayString();
  
  const canClick = lastDate !== today;
  console.log('[SteamStreak] canClickToday:', canClick, 'lastDate:', lastDate, 'today:', today);
  
  return canClick;
}

function onFireClick() {
  console.log('[SteamStreak] Fire clicked!');
  
  const { lastDate } = getStreakData();
  const today = getTodayString();
  const yesterday = getYesterdayString();

  if (lastDate === today) {
    console.log('[SteamStreak] Already clicked today!');
    return { success: false, message: 'Already clicked today' };
  }
  
  let currentStreak = parseInt(localStorage.getItem(STORAGE_KEY_STREAK()) || '0');
  let totalDays = parseInt(localStorage.getItem(STORAGE_KEY_TOTAL()) || '0');
  let bestStreak = parseInt(localStorage.getItem(STORAGE_KEY_BEST()) || '0');

  if (lastDate === '') {

    currentStreak = 1;
    totalDays = 1;
  } else if (lastDate === yesterday) {

    currentStreak++;
    totalDays++;
  } else {

    console.log('[SteamStreak] Streak broken! Starting fresh.');
    currentStreak = 1;
    totalDays++;
  }

  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }

  localStorage.setItem(STORAGE_KEY_STREAK(), currentStreak.toString());
  localStorage.setItem(STORAGE_KEY_DATE(), today);
  localStorage.setItem(STORAGE_KEY_TOTAL(), totalDays.toString());
  localStorage.setItem(STORAGE_KEY_BEST(), bestStreak.toString());

  const steamId = getCurrentSteamID();
  const hash = createProfileHash(steamId, currentStreak, totalDays, bestStreak);
  localStorage.setItem(STORAGE_KEY_HASH(), hash);
  
  console.log('[SteamStreak] Streak updated!', { currentStreak, totalDays, bestStreak });
  
  return {
    success: true,
    streak: currentStreak,
    totalDays: totalDays,
    bestStreak: bestStreak
  };
}

function getFireIcon(streak: number, size: '14' | '80' = '14'): string {
  const sizeStr = size === '80' ? '80x80' : '14x14';
  let iconPath = '';
  
  const CDN = 'https://cdn.jsdelivr.net/gh/BambooFury/steam-streak@main/static';
  if (streak >= 300) iconPath = `${CDN}/temnofiolet${sizeStr}.png`;
  else if (streak >= 100) iconPath = `${CDN}/fiolet${sizeStr}.png`;
  else if (streak >= 30) iconPath = `${CDN}/red${sizeStr}.png`;
  else if (streak >= 10) iconPath = `${CDN}/orangered${sizeStr}.png`;
  else iconPath = `${CDN}/orange${sizeStr}.png`;
  
  return iconPath;
}

function preloadIcons() {
  const sizes = ['14x14', '80x80'];
  const colors = ['orange', 'orangered', 'red', 'fiolet', 'temnofiolet'];
  
  colors.forEach(color => {
    sizes.forEach(size => {
      const img = new Image();
      img.src = `https://cdn.jsdelivr.net/gh/BambooFury/steam-streak@main/static/${color}${size}.png`;
    });
  });
}

function createStreakModal(streakData: any) {
  console.log('[SteamStreak] createStreakModal called with data:', streakData);
  
  const canClick = canClickToday();
  const fireIcon = getFireIcon(streakData.streak, '80');
  
  console.log('[SteamStreak] Creating modal with canClick:', canClick, 'fireIcon:', fireIcon);

  const overlay = document.createElement('div');
  overlay.id = 'steam-streak-overlay';
  overlay.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background: rgba(0, 0, 0, 0.85) !important;
    z-index: 10000 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%) !important;
    border-radius: 8px !important;
    padding: 40px !important;
    min-width: 400px !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5) !important;
    position: relative !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
  `;

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `
    position: absolute !important;
    top: 10px !important;
    right: 10px !important;
    background: none !important;
    border: none !important;
    color: #8f98a0 !important;
    font-size: 32px !important;
    cursor: pointer !important;
    width: 40px !important;
    height: 40px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 4px !important;
  `;
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
    closeBtn.style.color = '#ffffff';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'none';
    closeBtn.style.color = '#8f98a0';
  });
  closeBtn.addEventListener('click', () => {
    overlay.remove();
  });

  const { hours, minutes, seconds } = getTimeUntilMidnight();
  const timeString = formatTime(hours, minutes, seconds);
  
  modal.innerHTML = `
    <style>
      .fire-icon-gray {
        filter: grayscale(100%);
        cursor: pointer;
      }
      .fire-icon-gray:hover {
        transform: scale(1.05);
      }
    </style>
    <div style="text-align: center;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px;">
        <div id="fire-circle" style="width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: transparent;">
          <img id="fire-icon-main" class="fire-icon" src="${fireIcon}" style="width: 70px; height: 70px; object-fit: contain; ${canClick ? 'filter: grayscale(100%); cursor: pointer;' : ''}" />
        </div>
        <div id="streak-number" class="streak-counter" style="font-size: 72px; font-weight: bold; color: ${canClick ? '#8f98a0' : getStreakNumberColor(streakData.streak)}; line-height: 1;">
          ${streakData.streak}
        </div>
      </div>
      
      <div id="timer-container" style="margin-bottom: 30px; display: none;">
        <div id="countdown-timer" style="font-size: 28px; font-weight: 600; color: #c7d5e0; font-family: 'Courier New', monospace; letter-spacing: 3px;">
          ${timeString}
        </div>
      </div>
      
      <div style="margin-bottom: 25px; padding: 0 20px;" class="next-level-progress">
        ${(() => {
          const nextLevel = getNextLevel(streakData.streak);
          if (nextLevel.daysLeft > 0) {
            const progressColors = getProgressColors(streakData.streak);
            let progress = 0;
            if (streakData.streak < 10) {
              progress = (streakData.streak / 10) * 100;
            } else if (streakData.streak < 30) {
              progress = ((streakData.streak - 10) / (30 - 10)) * 100;
            } else if (streakData.streak < 100) {
              progress = ((streakData.streak - 30) / (100 - 30)) * 100;
            } else if (streakData.streak < 300) {
              progress = ((streakData.streak - 100) / (300 - 100)) * 100;
            }
            return `
              <div style="background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 12px 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  ${getProgressSVG(progressColors.start)}
                  <span style="font-size: 12px; color: #8f98a0;">Next level:</span>
                  <span style="font-size: 13px; font-weight: 600; color: ${nextLevel.color};">${nextLevel.name}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="flex: 1; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden;">
                    <div style="height: 100%; background: linear-gradient(90deg, ${progressColors.start} 0%, ${progressColors.end} 100%); width: ${progress}%; transition: width 0.3s ease;"></div>
                  </div>
                  <span style="font-size: 13px; font-weight: 600; color: ${progressColors.end};">${nextLevel.daysLeft}d</span>
                </div>
              </div>
            `;
          } else {
            return `
              <div style="background: linear-gradient(135deg, rgba(139, 0, 139, 0.2) 0%, rgba(75, 0, 130, 0.2) 100%); border-radius: 8px; padding: 12px 16px; border: 1px solid rgba(139, 0, 139, 0.3); text-align: center;">
                <span style="font-size: 14px; font-weight: 600; color: #9370db;">🎉 Maximum level reached!</span>
              </div>
            `;
          }
        })()}
      </div>
      
      <div style="margin-top: 20px; padding: 20px 15px;">
        <div style="display: flex; justify-content: space-around; align-items: center; gap: 15px; position: relative;">
          <div style="text-align: center; position: relative; z-index: 1; width: 48px;">
            <div style="margin-bottom: 8px; position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
              <img src="https://cdn.jsdelivr.net/gh/BambooFury/steam-streak@main/static/orange80x80.png" style="width: 48px; height: 48px; object-fit: contain; filter: ${streakData.streak >= 1 ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'grayscale(100%) opacity(0.5)'};" />
              ${streakData.streak < 1 ? `
                <svg style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px; z-index: 10;" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="11" width="6" height="8" rx="1" fill="#2a2a2a" stroke="#5a5a5a" stroke-width="1.5"/>
                  <path d="M8 11V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V11" stroke="#5a5a5a" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              ` : ''}
            </div>
            <div style="font-size: 11px; color: ${streakData.streak >= 1 ? '#ffa500' : '#5a5a5a'}; font-weight: 600; margin-bottom: 2px;">1d</div>
            <div style="font-size: 9px; color: #8f98a0; font-weight: 500;">Spark</div>
          </div>
          
          <div style="position: absolute; top: 24px; left: 0; right: 0; height: 3px; z-index: 0; display: flex; align-items: center; justify-content: space-between; padding: 0 48px;">
            ${(() => {
              const getSegmentProgress = (start: number, end: number, current: number) => {
                if (current <= start) return 0;
                if (current >= end) return 100;
                return ((current - start) / (end - start)) * 100;
              };
              
              const line1Progress = getSegmentProgress(0, 10, streakData.streak);
              const line2Progress = getSegmentProgress(10, 30, streakData.streak);
              const line3Progress = getSegmentProgress(30, 100, streakData.streak);
              const line4Progress = getSegmentProgress(100, 300, streakData.streak);
              
              return `
                <div style="flex: 1; height: 3px; background: #5a5a5a; border-radius: 1.5px; position: relative; overflow: hidden;">
                  <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${line1Progress}%; background: linear-gradient(90deg, ${streakData.streak >= 0 ? '#ffa500' : '#5a5a5a'} 0%, ${streakData.streak >= 10 ? '#ff6600' : '#5a5a5a'} 100%); border-radius: 1.5px;"></div>
                </div>
                <div style="width: 38px; flex-shrink: 0;"></div>
                <div style="flex: 1; height: 3px; background: #5a5a5a; border-radius: 1.5px; position: relative; overflow: hidden;">
                  <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${line2Progress}%; background: linear-gradient(90deg, ${streakData.streak >= 10 ? '#ff6600' : '#5a5a5a'} 0%, ${streakData.streak >= 30 ? '#ff3333' : '#5a5a5a'} 100%); border-radius: 1.5px;"></div>
                </div>
                <div style="width: 38px; flex-shrink: 0;"></div>
                <div style="flex: 1; height: 3px; background: #5a5a5a; border-radius: 1.5px; position: relative; overflow: hidden;">
                  <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${line3Progress}%; background: linear-gradient(90deg, ${streakData.streak >= 30 ? '#ff3333' : '#5a5a5a'} 0%, ${streakData.streak >= 100 ? '#ff69b4' : '#5a5a5a'} 100%); border-radius: 1.5px;"></div>
                </div>
                <div style="width: 38px; flex-shrink: 0;"></div>
                <div style="flex: 1; height: 3px; background: #5a5a5a; border-radius: 1.5px; position: relative; overflow: hidden;">
                  <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${line4Progress}%; background: linear-gradient(90deg, ${streakData.streak >= 100 ? '#ff69b4' : '#5a5a5a'} 0%, ${streakData.streak >= 300 ? '#7b4397' : '#5a5a5a'} 100%); border-radius: 1.5px;"></div>
                </div>
              `;
            })()}
          </div>
          <div style="text-align: center; position: relative; z-index: 1; width: 48px;">
            <div style="margin-bottom: 8px; position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
              <img src="https://cdn.jsdelivr.net/gh/BambooFury/steam-streak@main/static/orangered80x80.png" style="width: 48px; height: 48px; object-fit: contain; filter: ${streakData.streak >= 10 ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'grayscale(100%) opacity(0.5)'};" />
              ${streakData.streak < 10 ? `
                <svg style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px; z-index: 10;" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="11" width="6" height="8" rx="1" fill="#2a2a2a" stroke="#5a5a5a" stroke-width="1.5"/>
                  <path d="M8 11V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V11" stroke="#5a5a5a" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              ` : ''}
            </div>
            <div style="font-size: 11px; color: ${streakData.streak >= 10 ? '#ff6600' : '#5a5a5a'}; font-weight: 600; margin-bottom: 2px;">10d</div>
            <div style="font-size: 9px; color: #8f98a0; font-weight: 500;">Blaze</div>
          </div>
          <div style="text-align: center; position: relative; z-index: 1; width: 48px;">
            <div style="margin-bottom: 8px; position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
              <img src="https://cdn.jsdelivr.net/gh/BambooFury/steam-streak@main/static/red80x80.png" style="width: 48px; height: 48px; object-fit: contain; filter: ${streakData.streak >= 30 ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'grayscale(100%) opacity(0.5)'};" />
              ${streakData.streak < 30 ? `
                <svg style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px; z-index: 10;" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="11" width="6" height="8" rx="1" fill="#2a2a2a" stroke="#5a5a5a" stroke-width="1.5"/>
                  <path d="M8 11V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V11" stroke="#5a5a5a" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              ` : ''}
            </div>
            <div style="font-size: 11px; color: ${streakData.streak >= 30 ? '#ff3333' : '#5a5a5a'}; font-weight: 600; margin-bottom: 2px;">30d</div>
            <div style="font-size: 9px; color: #8f98a0; font-weight: 500;">Ascension</div>
          </div>
          <div style="text-align: center; position: relative; z-index: 1; width: 48px;">
            <div style="margin-bottom: 8px; position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
              <img src="https://cdn.jsdelivr.net/gh/BambooFury/steam-streak@main/static/fiolet80x80.png" style="width: 48px; height: 48px; object-fit: contain; filter: ${streakData.streak >= 100 ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'grayscale(100%) opacity(0.5)'};" />
              ${streakData.streak < 100 ? `
                <svg style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px; z-index: 10;" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="11" width="6" height="8" rx="1" fill="#2a2a2a" stroke="#5a5a5a" stroke-width="1.5"/>
                  <path d="M8 11V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V11" stroke="#5a5a5a" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              ` : ''}
            </div>
            <div style="font-size: 11px; color: ${streakData.streak >= 100 ? '#ff69b4' : '#5a5a5a'}; font-weight: 600; margin-bottom: 2px;">100d</div>
            <div style="font-size: 9px; color: #8f98a0; font-weight: 500;">Nova</div>
          </div>
          <div style="text-align: center; position: relative; z-index: 1; width: 48px;">
            <div style="margin-bottom: 8px; position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
              <img src="https://cdn.jsdelivr.net/gh/BambooFury/steam-streak@main/static/temnofiolet80x80.png" style="width: 48px; height: 48px; object-fit: contain; filter: ${streakData.streak >= 300 ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'grayscale(100%) opacity(0.5)'};" />
              ${streakData.streak < 300 ? `
                <svg style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px; z-index: 10;" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="11" width="6" height="8" rx="1" fill="#2a2a2a" stroke="#5a5a5a" stroke-width="1.5"/>
                  <path d="M8 11V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V11" stroke="#5a5a5a" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              ` : ''}
            </div>
            <div style="font-size: 11px; color: ${streakData.streak >= 300 ? '#8b008b' : '#5a5a5a'}; font-weight: 600; margin-bottom: 2px;">300d</div>
            <div style="font-size: 9px; color: #8f98a0; font-weight: 500;">Eternal</div>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const fireIconEl = modal.querySelector('#fire-icon-main') as HTMLElement;
    const streakNumberEl = modal.querySelector('#streak-number') as HTMLElement;
    const timerContainer = modal.querySelector('#timer-container') as HTMLElement;
    const countdownTimer = modal.querySelector('#countdown-timer') as HTMLElement;
    
    let timerInterval: any = null;

    if (!canClick && timerContainer) {
      timerContainer.style.display = 'block';

      const updateTimer = () => {
        const { hours, minutes, seconds } = getTimeUntilMidnight();
        const timeString = formatTime(hours, minutes, seconds);
        
        if (countdownTimer) countdownTimer.textContent = timeString;
      };

      updateTimer();

      timerInterval = setInterval(updateTimer, 1000);

      const cleanupTimer = () => {
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
      };

      const observer = new MutationObserver(() => {
        if (!document.body.contains(overlay)) {
          cleanupTimer();
          observer.disconnect();
        }
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
    }
    
    if (fireIconEl && canClick) {
      console.log('[SteamStreak] Click handler attached to fire icon');
      
      fireIconEl.addEventListener('click', () => {
        console.log('[SteamStreak] Fire icon clicked!');

        const result = onFireClick();
        
        if (result.success && result.streak !== undefined) {

          fireIconEl.style.filter = 'none';
          fireIconEl.style.cursor = 'default';

          if (streakNumberEl) {
            streakNumberEl.textContent = result.streak.toString();
            streakNumberEl.style.color = getStreakNumberColor(result.streak);
          }

          const newFireIcon = getFireIcon(result.streak, '80');
          (fireIconEl as HTMLImageElement).src = newFireIcon;

          const levelsContainer = modal.querySelector('[style*="margin-top: 20px; padding: 20px 15px"]');
          if (levelsContainer) {
            const lineContainer = levelsContainer.querySelector('[style*="position: absolute; top: 24px"]');
            if (lineContainer) {
              const getSegmentProgress = (start: number, end: number, current: number) => {
                if (current <= start) return 0;
                if (current >= end) return 100;
                return ((current - start) / (end - start)) * 100;
              };
              
              const line1Progress = getSegmentProgress(0, 10, result.streak);
              const line2Progress = getSegmentProgress(10, 30, result.streak);
              const line3Progress = getSegmentProgress(30, 100, result.streak);
              const line4Progress = getSegmentProgress(100, 300, result.streak);
              
              lineContainer.innerHTML = `
                <div style="flex: 1; height: 3px; background: #5a5a5a; border-radius: 1.5px; position: relative; overflow: hidden;">
                  <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${line1Progress}%; background: linear-gradient(90deg, ${result.streak >= 0 ? '#ffa500' : '#5a5a5a'} 0%, ${result.streak >= 10 ? '#ff6600' : '#5a5a5a'} 100%); border-radius: 1.5px;"></div>
                </div>
                <div style="width: 38px; flex-shrink: 0;"></div>
                <div style="flex: 1; height: 3px; background: #5a5a5a; border-radius: 1.5px; position: relative; overflow: hidden;">
                  <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${line2Progress}%; background: linear-gradient(90deg, ${result.streak >= 10 ? '#ff6600' : '#5a5a5a'} 0%, ${result.streak >= 30 ? '#ff3333' : '#5a5a5a'} 100%); border-radius: 1.5px;"></div>
                </div>
                <div style="width: 38px; flex-shrink: 0;"></div>
                <div style="flex: 1; height: 3px; background: #5a5a5a; border-radius: 1.5px; position: relative; overflow: hidden;">
                  <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${line3Progress}%; background: linear-gradient(90deg, ${result.streak >= 30 ? '#ff3333' : '#5a5a5a'} 0%, ${result.streak >= 100 ? '#ff69b4' : '#5a5a5a'} 100%); border-radius: 1.5px;"></div>
                </div>
                <div style="width: 38px; flex-shrink: 0;"></div>
                <div style="flex: 1; height: 3px; background: #5a5a5a; border-radius: 1.5px; position: relative; overflow: hidden;">
                  <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${line4Progress}%; background: linear-gradient(90deg, ${result.streak >= 100 ? '#ff69b4' : '#5a5a5a'} 0%, ${result.streak >= 300 ? '#7b4397' : '#5a5a5a'} 100%); border-radius: 1.5px;"></div>
                </div>
              `;
            }

            const levelDivs = levelsContainer.querySelectorAll('[style*="text-align: center"]');
            levelDivs.forEach((div, index) => {
              const imgContainer = div.querySelector('[style*="margin-bottom: 8px"]');
              const img = imgContainer?.querySelector('img');
              const dayText = div.querySelector('[style*="font-size: 11px"]');
              const thresholds = [1, 10, 30, 100, 300];
              const colors = ['#ffa500', '#ff6600', '#ff3333', '#ff69b4', '#8b008b'];
              
              if (img && dayText && imgContainer) {
                if (result.streak >= thresholds[index]) {
                  img.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
                  (dayText as HTMLElement).style.color = colors[index];
                  const lock = imgContainer.querySelector('svg');
                  if (lock) lock.remove();
                } else {
                  img.style.filter = 'grayscale(100%) opacity(0.5)';
                  (dayText as HTMLElement).style.color = '#5a5a5a';
                  if (!imgContainer.querySelector('svg')) {
                    const lockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    lockSvg.setAttribute('style', 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px; z-index: 10;');
                    lockSvg.setAttribute('viewBox', '0 0 24 24');
                    lockSvg.setAttribute('fill', 'none');
                    lockSvg.innerHTML = `
                      <rect x="9" y="11" width="6" height="8" rx="1" fill="#2a2a2a" stroke="#5a5a5a" stroke-width="1.5"/>
                      <path d="M8 11V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V11" stroke="#5a5a5a" stroke-width="1.5" stroke-linecap="round"/>
                    `;
                    imgContainer.appendChild(lockSvg);
                  }
                }
              }
            });
          }

          const nextLevel = getNextLevel(result.streak);
          const progressContainer = modal.querySelector('.next-level-progress');
          if (progressContainer && nextLevel.daysLeft > 0) {
            const progressColors = getProgressColors(result.streak);
            const progress = ((result.streak % (result.streak < 10 ? 10 : result.streak < 30 ? 30 : result.streak < 100 ? 100 : 300)) / (result.streak < 10 ? 10 : result.streak < 30 ? 30 : result.streak < 100 ? 100 : 300)) * 100;
            
            progressContainer.innerHTML = `
              <div style="background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 12px 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  ${getProgressSVG(progressColors.start)}
                  <span style="font-size: 12px; color: #8f98a0;">Next level:</span>
                  <span style="font-size: 13px; font-weight: 600; color: ${nextLevel.color};">${nextLevel.name}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="flex: 1; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden;">
                    <div style="height: 100%; background: linear-gradient(90deg, ${progressColors.start} 0%, ${progressColors.end} 100%); width: ${progress}%; transition: width 0.3s ease;"></div>
                  </div>
                  <span style="font-size: 13px; font-weight: 600; color: ${progressColors.end};">${nextLevel.daysLeft}d</span>
                </div>
              </div>
            `;
          } else if (progressContainer && nextLevel.daysLeft === 0) {
            progressContainer.innerHTML = `
              <div style="background: linear-gradient(135deg, rgba(139, 0, 139, 0.2) 0%, rgba(75, 0, 130, 0.2) 100%); border-radius: 8px; padding: 12px 16px; border: 1px solid rgba(139, 0, 139, 0.3); text-align: center;">
                <span style="font-size: 14px; font-weight: 600; color: #9370db;">🎉 Maximum level reached!</span>
              </div>
            `;
          }

          if (timerContainer) {
            timerContainer.style.display = 'block';
            
            const updateTimer = () => {
              const { hours, minutes, seconds } = getTimeUntilMidnight();
              const timeString = formatTime(hours, minutes, seconds);
              
              if (countdownTimer) countdownTimer.textContent = timeString;
            };

            updateTimer();

            if (timerInterval) {
              clearInterval(timerInterval);
            }
            timerInterval = setInterval(updateTimer, 1000);
          }

          updateBadge(result.streak);
        }
      });
    }
  }, 100);
  
  modal.appendChild(closeBtn);
  overlay.appendChild(modal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
  
  return overlay;
}

function updateBadge(streak: number) {
  console.log('[SteamStreak] updateBadge called with streak:', streak);
  const badge = document.getElementById('steam-streak-badge-v2');
  console.log('[SteamStreak] Badge element found:', !!badge);
  
  if (badge) {
    const streakSpan = badge.querySelector('span');
    if (streakSpan) {
      streakSpan.textContent = streak.toString();
      (streakSpan as HTMLElement).style.color = getStreakNumberColor(streak);
      console.log('[SteamStreak] Badge text updated to:', streak);
    }
    
    const badgeIcon = badge.querySelector('img');
    if (badgeIcon) {
      const newIcon = getFireIcon(streak, '80');
      badgeIcon.src = newIcon;
      (badgeIcon as HTMLElement).style.objectFit = 'contain';
      (badgeIcon as HTMLElement).style.filter = canClickToday() ? 'grayscale(100%)' : 'none';
      console.log('[SteamStreak] Badge icon updated to:', newIcon, 'filter:', canClickToday() ? 'grayscale' : 'none');
    }
  } else {
    console.warn('[SteamStreak] Badge element not found, attempting to recreate...');
    setTimeout(() => {
      const oldBadge = document.getElementById('steam-streak-badge-v2');
      if (oldBadge) oldBadge.remove();
      
      const newBadge = createStreakBadge(streak);
      const allButtons = document.querySelectorAll('button, [role="button"], a, div[onclick]');
      let editButton = null;
      
      for (const btn of Array.from(allButtons)) {
        const text = (btn as HTMLElement).innerText || '';
        if (text.includes('Редактировать') || text.includes('Edit')) {
          editButton = btn as HTMLElement;
          break;
        }
      }
      
      if (editButton && editButton.parentElement) {
        editButton.parentElement.insertBefore(newBadge, editButton.nextSibling);
        console.log('[SteamStreak] Badge recreated successfully');
      }
    }, 100);
  }
}

function createStreakBadge(streak: number) {
  console.log('[SteamStreak] === createStreakBadge called with streak:', streak, '===');
  
  const fireIcon = getFireIcon(streak, '80');
  const canClick = canClickToday();
  
  console.log('[SteamStreak] fireIcon:', fireIcon);
  console.log('[SteamStreak] canClick:', canClick);
  
  const badge = document.createElement('button');
  badge.id = 'steam-streak-badge-v2';
  badge.className = 'streak-badge-compact';
  badge.setAttribute('data-version', '11');
  badge.style.cssText = `
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-direction: row !important;
    gap: 4px !important;
    padding: 2px 6px !important;
    background: rgba(0, 0, 0, 0.35) !important;
    border: none !important;
    border-radius: 2px !important;
    font-size: 10px !important;
    font-weight: 700 !important;
    color: #ff6b35 !important;
    margin-left: 4px !important;
    cursor: pointer !important;
    transition: background 0.15s ease !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
    height: 31px !important;
    min-height: 31px !important;
    max-height: 31px !important;
    vertical-align: middle !important;
    flex-shrink: 0 !important;
    min-width: fit-content !important;
    white-space: nowrap !important;
  `;

  const iconStyle = canClick ? 'width: 16px; height: 16px; display: block; object-fit: contain; filter: grayscale(100%);' : 'width: 16px; height: 16px; display: block; object-fit: contain;';
  const numberColor = canClick ? '#8f98a0' : getStreakNumberColor(streak);
  
  badge.innerHTML = `
    <img class="fire-icon" src="${fireIcon}" style="${iconStyle}" />
    <span class="streak-counter" style="color: ${numberColor} !important; font-size: 12px !important; line-height: 1 !important; font-weight: 700 !important; display: block !important;">${streak}</span>
  `;
  
  console.log('[SteamStreak] Badge HTML created, streak displayed:', streak);

  badge.addEventListener('mouseenter', () => {
    badge.style.setProperty('background', 'rgba(255, 255, 255, 0.1)', 'important');
  });
  
  badge.addEventListener('mouseleave', () => {
    badge.style.setProperty('background', 'rgba(0, 0, 0, 0.35)', 'important');
  });

  let lastClickTime = 0;
  const CLICK_COOLDOWN = 2000;

  badge.addEventListener('click', () => {
    const now = Date.now();
    
    if (now - lastClickTime < CLICK_COOLDOWN) {
      console.log('[SteamStreak] Click ignored - cooldown active');
      return;
    }
    
    lastClickTime = now;
    console.log('[SteamStreak] Badge clicked (LMB)');

    const canClick = canClickToday();
    const currentStreak = getStreakData().streak;
    
    if (canClick) {
      console.log('[SteamStreak] Updating streak directly');
      const result = onFireClick();
      
      if (result.success && result.streak !== undefined) {
        updateBadge(result.streak);
        showQuickNotification(`Streak updated: ${result.streak} days!`, result.streak);
      }
    } else {
      showQuickNotification('You already clicked today! Come back tomorrow.', currentStreak);
    }
  });

  badge.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    console.log('[SteamStreak] Right click detected, opening modal');
    const streakData = getStreakData();
    const modal = createStreakModal(streakData);
    document.body.appendChild(modal);
  });
  
  return badge;
}

  function addStreakBadge() {
   try {
     console.log('[SteamStreak] === addStreakBadge() called ===');

     const currentUrl = window.location.href;
     if (!currentUrl.includes('steamcommunity.com/profiles/') && 
         !currentUrl.includes('steamcommunity.com/id/')) {
       console.log('[SteamStreak] Not on profile page');
       return;
     }

     tryDetectAndSaveOwnID();

     const savedOwnID = localStorage.getItem('steam_streak_own_id');
     if (!savedOwnID) {
       console.log('[SteamStreak] Own Steam ID not yet known, skipping');
       return;
     }

     const mySteamID = savedOwnID;
     const urlMatch = currentUrl.match(/profiles\/(\d+)/);
     if (urlMatch && urlMatch[1] !== mySteamID) {
       console.log('[SteamStreak] Not your profile (Steam ID mismatch)');
       return;
     }

     if (currentUrl.includes('/id/')) {
       const allButtons = document.querySelectorAll('button, [role="button"], a, div[onclick]');
       let isOwnProfile = false;
       for (const btn of Array.from(allButtons)) {
         const text = (btn as HTMLElement).innerText || '';
         if (text.includes('Редактировать') || text.includes('Edit profile') || text === 'Edit') {
           isOwnProfile = true;
           break;
         }
       }
       if (!isOwnProfile) {
         console.log('[SteamStreak] Not your profile (no edit button on vanity URL)');
         return;
       }
     }
     
     console.log('[SteamStreak] On own profile, loading data...');

     const { streak } = getStreakData();
     
     console.log('[SteamStreak] Creating badge with streak:', streak);

     const oldBadge = document.getElementById('steam-streak-badge');
     const oldBadgeV2 = document.getElementById('steam-streak-badge-v2');
     if (oldBadge) oldBadge.remove();
     if (oldBadgeV2) oldBadgeV2.remove();

     const badge = createStreakBadge(streak);

     let editButton = null;
     const allBtns = document.querySelectorAll('button, [role="button"], a, div[onclick]');
     for (const btn of Array.from(allBtns)) {
       const text = (btn as HTMLElement).innerText || '';
       if (text.includes('Редактировать') || text.includes('Edit')) {
         editButton = btn as HTMLElement;
         break;
       }
     }
     
     if (editButton) {
       let inserted = false;

       if (editButton.parentElement) {
         editButton.parentElement.insertBefore(badge, editButton.nextSibling);
         inserted = true;
         console.log('[SteamStreak] Badge inserted after edit button (parent)');
       }

       if (!inserted && editButton.nextElementSibling) {
         editButton.nextElementSibling.before(badge);
         inserted = true;
         console.log('[SteamStreak] Badge inserted before next sibling');
       }

       if (!inserted) {
         editButton.after(badge);
         inserted = true;
         console.log('[SteamStreak] Badge inserted after edit button (after)');
       }
       
       console.log('[SteamStreak] Badge added successfully with streak:', streak);
     } else {
       console.log('[SteamStreak] Edit button not found');
     }
     
   } catch (error) {
     console.error('[SteamStreak] Error:', error);
   }
 }

setTimeout(() => {
  preloadIcons();
  addStreakBadge();
}, 500);

setTimeout(() => {
  if (!document.getElementById('steam-streak-badge-v2')) {
    addStreakBadge();
  }
}, 1500);

setTimeout(() => {
  addStreakBadge();
}, 3000);

window.addEventListener('streakUpdated', (event: any) => {
  console.log('[SteamStreak] Streak updated event received:', event.detail);
  setTimeout(() => {
    const badge = document.getElementById('steam-streak-badge-v2');
    if (badge) {
      badge.remove();
    }
    addStreakBadge();
  }, 500);
});

  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(() => {
        addStreakBadge();
      }, 500);
    }
  }, 1000);
  
  function showStreakReminder() {
    const steamID = getCurrentSteamID();
    if (steamID === 'unknown_user') {
      return;
    }
    
    const streakKey = `${STORAGE_KEY_PREFIX}${steamID}_count`;
    const dateKey = `${STORAGE_KEY_PREFIX}${steamID}_date`;
    
    const streak = parseInt(localStorage.getItem(streakKey) || '0');
    const lastDate = localStorage.getItem(dateKey) || '';
    const today = getTodayString();
    
    if (lastDate === today) {
      return;
    }
    
    if (streak === 0) {
      return;
    }
    
    const now = new Date();
    const hours = now.getHours();
    
    if (hours !== 23) {
      return;
    }
    
    const notificationKey = `streak_notification_shown_${today}`;
    if (localStorage.getItem(notificationKey)) {
      return;
    }
    
    sendNotification(streak);
    
    localStorage.setItem(notificationKey, 'true');
  }
  
  function sendNotification(streak: number) {
    const { hours, minutes } = getTimeUntilMidnight();
    const timeLeft = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed !important;
      top: 60px !important;
      right: 20px !important;
      width: 340px !important;
      background: linear-gradient(135deg, rgba(30, 33, 36, 0.98) 0%, rgba(45, 48, 51, 0.98) 100%) !important;
      border: 1px solid rgba(0, 0, 0, 0.6) !important;
      border-radius: 3px !important;
      padding: 12px 14px !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.9) !important;
      z-index: 10000 !important;
      animation: slideInFromTop 0.3s ease-out !important;
      cursor: default !important;
      font-family: "Motiva Sans", Arial, sans-serif !important;
    `;
    
    const fireIcon = getFireIcon(streak, '80');
    
    notification.innerHTML = `
      <style>
        @keyframes slideInFromTop {
          from {
            transform: translateY(-100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideOutToTop {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-100px);
            opacity: 0;
          }
        }
      </style>
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <img src="${fireIcon}" style="width: 38px; height: 38px; flex-shrink: 0; object-fit: contain; filter: grayscale(100%);" />
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 15px; font-weight: 500; color: #ffffff; margin-bottom: 2px; letter-spacing: 0.3px; line-height: 1.2;">
            Streak Reminder
          </div>
          <div style="font-size: 13px; color: #8b8b8b; line-height: 1.3;">
            Don't forget to click the fire icon to keep your ${streak} day streak alive! Less than ${timeLeft} left.
          </div>
        </div>
        <button style="background: none; border: none; color: #8b8b8b; font-size: 20px; cursor: pointer; padding: 0; width: 20px; height: 20px; line-height: 1; flex-shrink: 0; transition: color 0.2s;">×</button>
      </div>
    `;
    
    const closeBtn = notification.querySelector('button');
    if (closeBtn) {
      closeBtn.addEventListener('mouseenter', () => {
        (closeBtn as HTMLElement).style.color = '#ffffff';
      });
      closeBtn.addEventListener('mouseleave', () => {
        (closeBtn as HTMLElement).style.color = '#8b8b8b';
      });
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notification.style.animation = 'slideOutToTop 0.3s ease-in';
        setTimeout(() => {
          notification.remove();
        }, 300);
      });
    }
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.animation = 'slideOutToTop 0.3s ease-in';
        setTimeout(() => {
          notification.remove();
        }, 300);
      }
    }, 10000);
    
    document.body.appendChild(notification);
    console.log('[SteamStreak] In-Steam notification shown');
  }
  
  function showQuickNotification(message: string, streak?: number) {
    const existingNotification = document.getElementById('steam-streak-quick-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.id = 'steam-streak-quick-notification';
    notification.style.cssText = `
      position: fixed !important;
      top: 60px !important;
      right: 20px !important;
      background: linear-gradient(135deg, rgba(26, 26, 26, 0.98) 0%, rgba(45, 45, 45, 0.98) 100%) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 8px !important;
      padding: 16px 20px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8) !important;
      z-index: 10000 !important;
      animation: slideInFromTop 0.3s ease-out !important;
      font-family: "Motiva Sans", Arial, sans-serif !important;
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      min-width: 280px !important;
    `;
    
    const fireIcon = streak ? getFireIcon(streak, '80') : '';
    
    notification.innerHTML = `
      <style>
        @keyframes slideInFromTop {
          from {
            transform: translateY(-100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideOutToTop {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-100px);
            opacity: 0;
          }
        }
      </style>
      ${streak ? `<img src="${fireIcon}" style="width: 32px; height: 32px; flex-shrink: 0; object-fit: contain;" />` : ''}
      <div style="flex: 1; font-size: 14px; font-weight: 500; color: #ffffff; line-height: 1.4;">
        ${message}
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.animation = 'slideOutToTop 0.3s ease-in';
        setTimeout(() => {
          notification.remove();
        }, 300);
      }
    }, 3000);
  }
  
  setInterval(() => {
    showStreakReminder();
  }, 60000);
  
  setTimeout(() => {
    showStreakReminder();
  }, 5000);
}
