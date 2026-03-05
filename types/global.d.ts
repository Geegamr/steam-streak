declare module '@steambrew/client' {
  export function definePlugin(callback: () => PluginConfig): void;
  export function callable<TArgs extends any[], TReturn>(
    name: string
  ): (...args: TArgs) => Promise<TReturn>;

  export const Millennium: {
    exposeObj: (obj: Record<string, any>) => void;
    AddWindowCreateHook?: (callback: (context: any) => void) => void;
  };

  export const IconsModule: {
    Settings: React.ComponentType;
  };

  export const Field: React.ComponentType<any>;
  export const DialogButton: React.ComponentType<any>;

  interface PluginConfig {
    title: string;
    icon: React.ReactNode;
    content: React.ReactNode;
  }
}

declare global {
  interface Window {
    steamStreakClaimStreak?: any;
    steamStreakCanClaimToday?: any;
    steamStreakGetData?: any;
    steamStreakData?: any;
  }
}

export {};
