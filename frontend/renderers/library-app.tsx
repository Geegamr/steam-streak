import type Steam from "../steam.js";
import {
  PlayBarClasses,
  GameStreak
} from "../components/play-bar.js";
import { querySelectorAll, renderComponent } from "../helpers.js";
import { updateGameStreak, getGameStreak } from "../game-streak.js";

export async function patch(
  window: Window,
  app: Steam.AppOverview
) {
  let currentStreakData = app.rt_last_time_played > 0
    ? updateGameStreak(app.appid, app.rt_last_time_played)
    : getGameStreak(app.appid);

  if (currentStreakData.streak === 0) return;

  const parents = await querySelectorAll(
    window.document,
    `.${PlayBarClasses.GameStatsSection}`
  );

  for (const parent of parents) {
    const component = GameStreak({
      streak: currentStreakData.streak,
      window: window
    });

    const element = renderComponent(component, window);
    element.setAttribute("data-game-streak", "");
    element.setAttribute("data-app-id", app.appid.toString());

    const existing = parent.querySelector("[data-game-streak]");
    if (existing) {
      existing.replaceWith(element);
    } else {
      parent.appendChild(element);
    }
  }

  const intervalKey = `streak_refresh_${app.appid}`;
  if ((window as any)[intervalKey]) {
    clearInterval((window as any)[intervalKey]);
  }

  (window as any)[intervalKey] = setInterval(async () => {
    const newStreakData = getGameStreak(app.appid);
    
    if (newStreakData.streak !== currentStreakData.streak || 
        newStreakData.lastPlayed !== currentStreakData.lastPlayed ||
        newStreakData.bestStreak !== currentStreakData.bestStreak) {
      
      console.log(`[GameStreak] Streak updated for app ${app.appid}: ${currentStreakData.streak} -> ${newStreakData.streak}`);
      
      currentStreakData = newStreakData;
      
      const parents = await querySelectorAll(
        window.document,
        `.${PlayBarClasses.GameStatsSection}`
      );

      for (const parent of parents) {
        const existing = parent.querySelector(`[data-game-streak][data-app-id="${app.appid}"]`);
        if (existing) {
          const component = GameStreak({
            streak: currentStreakData.streak,
            window: window
          });

          const element = renderComponent(component, window);
          element.setAttribute("data-game-streak", "");
          element.setAttribute("data-app-id", app.appid.toString());
          
          existing.replaceWith(element);
        }
      }
    }
  }, 3000);
}
