import React from 'react';
import { HueRoom, HueLight } from '../types';
import { Card, Toggle } from './ui';
import { Home, Power } from 'lucide-react';

interface DashboardProps {
  rooms: HueRoom[];
  lights: HueLight[];
  onRoomToggle: (roomId: string, on: boolean) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ rooms, lights, onRoomToggle }) => {
  // Helper to get room status
  const getRoomState = (room: HueRoom) => {
    const roomLights = lights.filter(l => room.children.some(c => c.rid === l.id));
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
            const { anyOn, count } = getRoomState(room);
            return (
                <Card key={room.id} className="relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${anyOn ? 'bg-yellow-500' : 'bg-zinc-700'}`} />
                    
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                            <Home className="w-6 h-6" />
                        </div>
                        <Toggle checked={anyOn} onChange={(val) => onRoomToggle(room.id, val)} />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-zinc-100">{room.metadata.name}</h3>
                        <p className="text-sm text-zinc-500">{count} lights • {anyOn ? 'On' : 'Off'}</p>
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
