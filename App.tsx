import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Connect } from './components/Connect';
import { Dashboard } from './components/Dashboard';
import { LightControl } from './components/LightControl';
import { HueService } from './services/hueService';
import { AppState, BridgeConfig, ConnectionStatus, HueLight, HueRoom, HueScene } from './types';
import { Card, Button } from './components/ui';
import { Play } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [error, setError] = useState<string | undefined>();
  
  const [hueService, setHueService] = useState<HueService | null>(null);
  
  const [state, setState] = useState<AppState>({
    bridge: null,
    isConnected: false,
    isDemo: false,
    lights: [],
    rooms: [],
    scenes: []
  });

  // Initialization & Polling
  const fetchData = useCallback(async () => {
    if (!hueService) return;
    try {
      const lightsData = await hueService.fetchResource('resource/light');
      const roomsData = await hueService.fetchResource('resource/room');
      const scenesData = await hueService.fetchResource('resource/scene');
      
      setState(prev => ({
        ...prev,
        lights: lightsData.data,
        rooms: roomsData.data,
        scenes: scenesData.data
      }));
      setStatus(ConnectionStatus.CONNECTED);
    } catch (e) {
      console.error(e);
      setStatus(ConnectionStatus.ERROR);
      setError("Failed to fetch data. Check connection.");
    }
  }, [hueService]);

  useEffect(() => {
    if (status === ConnectionStatus.CONNECTED && hueService) {
      fetchData();
      const interval = setInterval(fetchData, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [status, hueService, fetchData]);

  // Actions
  const handleConnect = async (config: BridgeConfig) => {
    setStatus(ConnectionStatus.CONNECTING);
    try {
      const service = new HueService(config, false);
      // Test connection
      await service.fetchResource('resource/light');
      setHueService(service);
      setState(prev => ({ ...prev, bridge: config, isConnected: true, isDemo: false }));
      setStatus(ConnectionStatus.CONNECTED);
    } catch (e) {
      setStatus(ConnectionStatus.ERROR);
      setError("Connection failed. Ensure IP is correct, User is valid, and HTTPS cert is accepted.");
    }
  };

  const handleDemo = async () => {
    const service = new HueService(null, true);
    setHueService(service);
    setState(prev => ({ ...prev, isConnected: true, isDemo: true }));
    setStatus(ConnectionStatus.CONNECTED);
    // Initial fetch handled by effect
  };

  const handleDisconnect = () => {
    setHueService(null);
    setState(prev => ({ ...prev, isConnected: false, lights: [], rooms: [], scenes: [] }));
    setStatus(ConnectionStatus.DISCONNECTED);
    setError(undefined);
  };

  const updateLight = async (id: string, payload: any) => {
    if (!hueService) return;
    // Optimistic update
    setState(prev => ({
        ...prev,
        lights: prev.lights.map(l => {
            if (l.id === id) {
                // Deep merge simplified
                const newOn = payload.on ? { ...l.on, ...payload.on } : l.on;
                const newDim = payload.dimming ? { ...l.dimming, ...payload.dimming } : l.dimming;
                const newCol = payload.color ? { ...l.color, ...payload.color } : l.color;
                return { ...l, on: newOn, dimming: newDim, color: newCol };
            }
            return l;
        })
    }));
    await hueService.updateLight(id, payload);
    fetchData(); // Refresh to be sure
  };

  const toggleRoom = async (roomId: string, on: boolean) => {
    if (!hueService) return;
    // Find lights in room
    const room = state.rooms.find(r => r.id === roomId);
    if (!room) return;
    
    // Update all lights in room
    const promises = room.children
        .filter(child => child.rtype === 'light')
        .map(child => updateLight(child.rid, { on: { on } }));
        
    await Promise.all(promises);
  };

  const activateScene = async (sceneId: string) => {
    if (!hueService) return;
    await hueService.activateScene(sceneId);
    setTimeout(fetchData, 1000); // Scene transitions take time
  };

  // Render Content based on Route/Tab
  const renderContent = () => {
    if (!state.isConnected) {
        return <Connect onConnect={handleConnect} onDemo={handleDemo} loading={status === ConnectionStatus.CONNECTING} error={error} />;
    }

    switch (activeTab) {
        case 'dashboard':
            return <Dashboard rooms={state.rooms} lights={state.lights} onRoomToggle={toggleRoom} />;
        case 'lights':
            return (
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">All Lights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {state.lights.map(light => (
                            <LightControl key={light.id} light={light} onUpdate={updateLight} />
                        ))}
                    </div>
                </div>
            );
        case 'scenes':
            return (
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Scenes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {state.scenes.map(scene => (
                            <Card key={scene.id} className="flex items-center justify-between p-4 group hover:bg-zinc-800 transition-colors cursor-pointer" onClick={() => activateScene(scene.id)}>
                                <span className="font-medium text-zinc-200">{scene.metadata.name}</span>
                                <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100">
                                    <Play className="w-4 h-4" />
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>
            );
        default:
            return <div className="p-6">Not Implemented</div>;
    }
  };

  if (!state.isConnected) {
    return renderContent();
  }

  return (
    <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onDisconnect={handleDisconnect}
    >
      {state.isDemo && (
          <div className="bg-indigo-600/20 text-indigo-200 text-xs py-1 px-4 text-center border-b border-indigo-500/30">
              Demo Mode - Changes are simulated
          </div>
      )}
      {renderContent()}
    </Layout>
  );
};

export default App;
