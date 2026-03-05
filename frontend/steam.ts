import type {} from "@steambrew/client";

namespace Steam {
  export interface AppOverview {
    appid: number;
    display_name: string;
    sort_as: string;
    size_on_disk: `${number}` | undefined;
    rt_last_time_played: number;
    minutes_playtime_forever: number;
  }

  export interface CallbackList<Arguments extends unknown[]> {
    m_vecCallbacks: Array<(...args: Arguments) => void>;
    Register(callback: (...args: Arguments) => void): {
      Unregister: () => void;
    };
  }

  export interface PopupManager {
    GetExistingPopup(name: string): Popup | undefined;
    AddPopupCreatedCallback(
      callback: (popup: Popup) => void,
    ): { Unregister: () => void };
    AddPopupDestroyedCallback(
      callback: (popup: Popup) => void,
    ): { Unregister: () => void };
  }

  export const PopupManager: PopupManager =
    Reflect.get(globalThis, "g_PopupManager");

  export const DesktopWindowName = "SP Desktop_uid0";
  export const GamepadWindowName = "SP BPM_uid0";

  export interface Popup {
    get window(): Window | undefined;
  }

  export interface MainWindowBrowserManager {
    m_lastLocation: { pathname: string; search: string; hash: string };
    m_history: {
      listen(callback: (location: { pathname: string }) => void): void;
    };
  }

  export const MainWindowBrowserManager: MainWindowBrowserManager =
    undefined!;

  Object.defineProperty(Steam, "MainWindowBrowserManager", {
    get: () => Reflect.get(globalThis, "MainWindowBrowserManager"),
  });

  export enum UIMode {
    Gamepad = 4,
    Desktop = 7,
  }

  export interface UIStore {
    get MainInstanceUIMode(): UIMode;
  }

  export const UIStore: UIStore =
    Reflect.get(globalThis, "SteamUIStore");

  export interface AppStore {
    allApps: AppOverview[];
    GetAppOverviewByAppID(appId: number): AppOverview | undefined;
  }

  export const AppStore: AppStore =
    Reflect.get(globalThis, "appStore");

  export interface LocalizationManager {
    LocalizeString(token: `#${string}`): string;
  }

  export const LocalizationManager: LocalizationManager =
    Reflect.get(globalThis, "LocalizationManager");
}

export default Steam;
