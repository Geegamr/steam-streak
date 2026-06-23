import Steam from "./steam.js";
import { patch as patchLibraryApp } from "./renderers/library-app.js";

const POLL_INTERVAL = 500;

export default async function OnPluginLoad() {
  try {
    const mainPopup =
      Steam.PopupManager.GetExistingPopup(Steam.DesktopWindowName);
    
    if (mainPopup) {
      startLocationMonitor(mainPopup.window!);
    }

    Steam.PopupManager.AddPopupCreatedCallback((popup) => {
      if (popup.window?.name?.startsWith("SP Desktop_")) {
        startLocationMonitor(popup.window!);
      }
    });
  } catch (error) {
    console.error("[SteamStreak] ERROR in OnPluginLoad():", error);
  }
}

function startLocationMonitor(window: Window) {
  let lastPathname = "";

  const check = () => {
    try {
      const loc = Steam.MainWindowBrowserManager?.m_lastLocation;
      if (!loc) return;
      
      if (loc.pathname === lastPathname) return;
      
      lastPathname = loc.pathname;

      if (loc.pathname.startsWith("/library/app/")) {
        const appId = Number(loc.pathname.split("/")[3]);
        const app = Steam.AppStore.allApps.find((a) => a.appid === appId);
        
        if (app) {
          patchLibraryApp(window, app);
        }
      }
    } catch (error) {
      console.error("[SteamStreak] ERROR in check():", error);
    }
  };

  check();
  setInterval(check, POLL_INTERVAL);
}

