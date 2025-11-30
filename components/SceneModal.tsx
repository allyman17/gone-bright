import React from 'react';
import { HueScene, HueRoom } from '../types';
import { Card, Button } from './ui';
import { X, Play } from 'lucide-react';

interface SceneModalProps {
  room: HueRoom;
  scenes: HueScene[];
  onClose: () => void;
  onActivateScene: (sceneId: string) => void;
}

export const SceneModal: React.FC<SceneModalProps> = ({ room, scenes, onClose, onActivateScene }) => {
  // Filter scenes for this room
  const roomScenes = scenes.filter(scene => scene.group.rid === room.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white">{room.metadata.name}</h2>
            <p className="text-sm text-zinc-400 mt-1">Select a scene</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scene List */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {roomScenes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roomScenes.map(scene => (
                <Card 
                  key={scene.id} 
                  className="flex items-center justify-between p-4 group hover:bg-zinc-800 hover:border-indigo-500/50 transition-all cursor-pointer"
                  onClick={() => {
                    onActivateScene(scene.id);
                    onClose();
                  }}
                >
                  <span className="font-medium text-zinc-200">{scene.metadata.name}</span>
                  <div className="p-2 rounded-lg bg-zinc-800 group-hover:bg-indigo-600 transition-colors">
                    <Play className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500">
              <p>No scenes available for this room.</p>
              <p className="text-sm mt-2">Create scenes in your Hue app.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
