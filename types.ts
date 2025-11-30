// OpenHue / Hue API V2 Types (Simplified)

export interface HueResource {
  id: string;
  id_v1?: string;
  type: string;
}

export interface HueLight extends HueResource {
  type: 'light';
  metadata: {
    name: string;
    archetype: string;
  };
  on: {
    on: boolean;
  };
  dimming?: {
    brightness: number; // 0-100
    min_dim_level?: number;
  };
  color?: {
    xy: {
      x: number;
      y: number;
    };
    gamut?: {
      red: { x: number; y: number };
      green: { x: number; y: number };
      blue: { x: number; y: number };
    };
  };
  color_temperature?: {
    mirek: number; // 153-500
    mirek_valid: boolean;
  };
}

export interface HueRoom extends HueResource {
  type: 'room';
  metadata: {
    name: string;
    archetype: string;
  };
  children: { rid: string; rtype: string }[];
}

export interface HueScene extends HueResource {
  type: 'scene';
  metadata: {
    name: string;
  };
  group: { rid: string; rtype: string };
  actions: any[];
}

export interface BridgeConfig {
  ip: string;
  username: string; // The Hue Application Key
}

export interface AppState {
  bridge: BridgeConfig | null;
  isConnected: boolean;
  isDemo: boolean;
  lights: HueLight[];
  rooms: HueRoom[];
  scenes: HueScene[];
}

export enum ConnectionStatus {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  ERROR,
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
