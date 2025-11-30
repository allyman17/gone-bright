import React from 'react';
import { HueLight } from '../types';
import { Card, Slider, Toggle } from './ui';
import { Sun, Palette } from 'lucide-react';

interface LightControlProps {
  light: HueLight;
  onUpdate: (id: string, payload: any) => void;
}

export const LightControl: React.FC<LightControlProps> = ({ light, onUpdate }) => {
  // Helpers
  const isOn = light.on.on;
  const brightness = light.dimming?.brightness || 0;

  const handleToggle = (val: boolean) => {
    onUpdate(light.id, { on: { on: val } });
  };

  const handleBrightness = (val: number) => {
    onUpdate(light.id, { on: { on: true }, dimming: { brightness: val } });
  };

  // Simple preset colors for UI simplicity (xy approx)
  const colors = [
    { name: 'Warm', value: { x: 0.46, y: 0.41 }, hex: '#ffcc77' },
    { name: 'Cool', value: { x: 0.31, y: 0.33 }, hex: '#dcebff' },
    { name: 'Red', value: { x: 0.67, y: 0.32 }, hex: '#ff4444' },
    { name: 'Green', value: { x: 0.41, y: 0.52 }, hex: '#44ff44' },
    { name: 'Blue', value: { x: 0.17, y: 0.04 }, hex: '#4444ff' },
    { name: 'Purple', value: { x: 0.27, y: 0.13 }, hex: '#aa44ff' },
  ];

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOn ? 'bg-yellow-500/20 text-yellow-500' : 'bg-zinc-800 text-zinc-500'}`}>
                <Sun className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-medium text-zinc-200">{light.metadata.name}</h3>
                <p className="text-xs text-zinc-500 capitalize">{light.metadata.archetype.replace('_', ' ')}</p>
            </div>
        </div>
        <Toggle checked={isOn} onChange={handleToggle} />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-zinc-500 mb-2">
            <span>Brightness</span>
            <span>{Math.round(brightness)}%</span>
        </div>
        <Slider value={brightness} onChange={handleBrightness} />
      </div>

      {light.color && (
        <div className="pt-2">
            <div className="flex items-center mb-2">
                <Palette className="w-3 h-3 text-zinc-500 mr-2" />
                <span className="text-xs text-zinc-500">Color</span>
            </div>
            <div className="flex space-x-2">
                {colors.map((c) => (
                    <button
                        key={c.name}
                        onClick={() => onUpdate(light.id, { on: { on: true }, color: { xy: c.value } })}
                        className="w-6 h-6 rounded-full border border-zinc-700 hover:scale-110 transition-transform focus:ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-900"
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                    />
                ))}
            </div>
        </div>
      )}
    </Card>
  );
};
