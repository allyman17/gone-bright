export interface ElectronAPI {
  platform: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
  hue: {
    fetch: (url: string, options: {
      method?: string;
      headers?: Record<string, string>;
      body?: string;
    }) => Promise<{
      ok: boolean;
      status: number;
      data: any;
      error?: string;
    }>;
  };
  config: {
    save: (config: any) => Promise<{ success: boolean; error?: string }>;
    load: () => Promise<{ success: boolean; config?: any; error?: string }>;
    clear: () => Promise<{ success: boolean; error?: string }>;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
