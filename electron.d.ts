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
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
