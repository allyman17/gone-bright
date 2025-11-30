import React from 'react';
import { HueRoom, HueLight } from '../types';
import { Card, Toggle, Slider } from './ui';
import { Home } from 'lucide-react';

interface DashboardProps {
  rooms: HueRoom[];
  lights: HueLight[];
  deviceToLightMap: Map<string, string[]>;
  onRoomToggle: (roomId: string, on: boolean) => void;
  onRoomClick: (roomId: string) => void;
  onRoomBrightness: (roomId: string, brightness: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ rooms, lights, deviceToLightMap, onRoomToggle, onRoomClick, onRoomBrightness }) => {
  // Helper to get room status
  const getRoomState = (room: HueRoom) => {
    // Get device IDs from room children
    const deviceIds = room.children.filter(c => c.rtype === 'device').map(c => c.rid);
    
    // Map devices to light IDs
    const lightIds: string[] = [];
    deviceIds.forEach(deviceId => {
      const deviceLights = deviceToLightMap.get(deviceId) || [];
      lightIds.push(...deviceLights);
    });
    
    // Get the actual light objects
    const roomLights = lights.filter(l => lightIds.includes(l.id));
    const anyOn = roomLights.some(l => l.on.on);
    const avgBrightness = roomLights.reduce((acc, l) => acc + (l.dimming?.brightness || 0), 0) / (roomLights.length || 1);
    
    return { anyOn, avgBrightness, count: roomLights.length };
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Dashboard</h2>
        <p className="text-zinc-400">Overview of your home</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => {
            const { anyOn, avgBrightness, count } = getRoomState(room);
            return (
                <Card 
                    key={room.id} 
                    className="relative overflow-hidden group cursor-pointer hover:border-indigo-500/50 transition-all"
                    onClick={() => onRoomClick(room.id)}
                >
                    <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${anyOn ? 'bg-yellow-500' : 'bg-zinc-700'}`} />
                    
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                            <Home className="w-6 h-6" />
                        </div>
                        <Toggle 
                            checked={anyOn} 
                            onChange={(val) => {
                                console.log('Toggle clicked for room:', room.metadata.name, 'New value:', val);
                                onRoomToggle(room.id, val);
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-zinc-100">{room.metadata.name}</h3>
                        <p className="text-sm text-zinc-500">{count} lights • {anyOn ? 'On' : 'Off'}</p>
                    </div>

                    {/* Brightness Slider */}
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                            <span>Brightness</span>
                            <span>{Math.round(avgBrightness)}%</span>
                        </div>
                        <Slider 
                            value={avgBrightness} 
                            onChange={(val) => onRoomBrightness(room.id, val)}
                            max={100}
                        />
                    </div>

                    {/* Quick indicator glow */}
                    {anyOn && (
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full pointer-events-none" />
                    )}
                </Card>
            );
        })}
      </div>
      
      {rooms.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
            No rooms found. Add rooms in your Hue app first.
        </div>
      )}
    </div>
  );
};
