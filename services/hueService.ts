import { BridgeConfig, HueLight, HueRoom, HueScene } from '../types';

// Mock Data for Demo Mode
const MOCK_LIGHTS: HueLight[] = [
  {
    id: 'l1',
    type: 'light',
    metadata: { name: 'Living Room Strip', archetype: 'hue_lightstrip' },
    on: { on: true },
    dimming: { brightness: 75 },
    color: { xy: { x: 0.45, y: 0.41 } } // Warm
  },
  {
    id: 'l2',
    type: 'light',
    metadata: { name: 'Living Room Bloom', archetype: 'hue_bloom' },
    on: { on: true },
    dimming: { brightness: 50 },
    color: { xy: { x: 0.17, y: 0.04 } } // Blue
  },
  {
    id: 'l3',
    type: 'light',
    metadata: { name: 'Kitchen Ceiling 1', archetype: 'ceiling_round' },
    on: { on: false },
    dimming: { brightness: 100 },
    color_temperature: { mirek: 300, mirek_valid: true }
  },
  {
    id: 'l4',
    type: 'light',
    metadata: { name: 'Kitchen Ceiling 2', archetype: 'ceiling_round' },
    on: { on: false },
    dimming: { brightness: 100 },
    color_temperature: { mirek: 300, mirek_valid: true }
  },
  {
    id: 'l5',
    type: 'light',
    metadata: { name: 'Bedroom Lamp', archetype: 'hue_go' },
    on: { on: true },
    dimming: { brightness: 30 },
    color: { xy: { x: 0.5, y: 0.2 } } // Purple-ish
  }
];

const MOCK_ROOMS: HueRoom[] = [
  {
    id: 'r1',
    type: 'room',
    metadata: { name: 'Living Room', archetype: 'living_room' },
    children: [{ rid: 'l1', rtype: 'light' }, { rid: 'l2', rtype: 'light' }]
  },
  {
    id: 'r2',
    type: 'room',
    metadata: { name: 'Kitchen', archetype: 'kitchen' },
    children: [{ rid: 'l3', rtype: 'light' }, { rid: 'l4', rtype: 'light' }]
  },
  {
    id: 'r3',
    type: 'room',
    metadata: { name: 'Bedroom', archetype: 'bedroom' },
    children: [{ rid: 'l5', rtype: 'light' }]
  }
];

const MOCK_SCENES: HueScene[] = [
  {
    id: 's1',
    type: 'scene',
    metadata: { name: 'Relax' },
    group: { rid: 'r1', rtype: 'room' },
    actions: []
  },
  {
    id: 's2',
    type: 'scene',
    metadata: { name: 'Concentrate' },
    group: { rid: 'r2', rtype: 'room' },
    actions: []
  },
  {
    id: 's3',
    type: 'scene',
    metadata: { name: 'Arctic Aurora' },
    group: { rid: 'r1', rtype: 'room' },
    actions: []
  }
];

export class HueService {
  private config: BridgeConfig | null = null;
  private isDemo = false;

  constructor(config: BridgeConfig | null, isDemo: boolean = false) {
    this.config = config;
    this.isDemo = isDemo;
  }

  private get baseUrl() {
    return this.config ? `https://${this.config.ip}/clip/v2` : '';
  }

  private get headers() {
    return {
      'hue-application-key': this.config?.username || '',
      'Content-Type': 'application/json'
    };
  }

  async fetchResource(resource: string): Promise<any> {
    if (this.isDemo) {
      await new Promise(r => setTimeout(r, 600)); // Simulate latency
      if (resource === 'resource/light') return { data: MOCK_LIGHTS };
      if (resource === 'resource/room') return { data: MOCK_ROOMS };
      if (resource === 'resource/scene') return { data: MOCK_SCENES };
      return { data: [] };
    }

    if (!this.config) throw new Error("No configuration");

    try {
      // Use Electron IPC if available, otherwise fall back to fetch (browser mode)
      if ((window as any).electron?.hue?.fetch) {
        const response = await (window as any).electron.hue.fetch(`${this.baseUrl}/${resource}`, {
          method: 'GET',
          headers: this.headers
        });
        if (!response.ok) throw new Error(`Hue API Error: ${response.status}`);
        return response.data;
      } else {
        // Fallback to regular fetch for browser testing
        const response = await fetch(`${this.baseUrl}/${resource}`, {
          method: 'GET',
          headers: this.headers
        });
        if (!response.ok) throw new Error(`Hue API Error: ${response.statusText}`);
        return await response.json();
      }
    } catch (e) {
      console.error("Fetch failed.", e);
      throw e;
    }
  }

  async updateLight(lightId: string, payload: any): Promise<any> {
    if (this.isDemo) {
      // Update the mock store in memory roughly
      const light = MOCK_LIGHTS.find(l => l.id === lightId);
      if (light) {
        if (payload.on !== undefined) light.on = payload.on;
        if (payload.dimming) light.dimming = { ...light.dimming, ...payload.dimming };
        if (payload.color) light.color = { ...light.color, ...payload.color };
      }
      return { data: [{ rid: lightId, rtype: 'light' }] };
    }

    if ((window as any).electron?.hue?.fetch) {
      const response = await (window as any).electron.hue.fetch(`${this.baseUrl}/resource/light/${lightId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(payload)
      });
      return response.data;
    } else {
      const response = await fetch(`${this.baseUrl}/resource/light/${lightId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(payload)
      });
      return await response.json();
    }
  }

  async activateScene(sceneId: string): Promise<any> {
    if (this.isDemo) {
      return { data: [] };
    }
    
    if ((window as any).electron?.hue?.fetch) {
      const response = await (window as any).electron.hue.fetch(`${this.baseUrl}/resource/scene/${sceneId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({ recall: { action: 'active' } })
      });
      return response.data;
    } else {
      const response = await fetch(`${this.baseUrl}/resource/scene/${sceneId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({ recall: { action: 'active' } })
      });
      return await response.json();
    }
  }
}
