import React from 'react';
import { LayoutDashboard, Lightbulb, Play, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onDisconnect: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onDisconnect }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'lights', label: 'Lights', icon: Lightbulb },
    { id: 'scenes', label: 'Scenes', icon: Play },
  ];

  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-925 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Gone Bright </h1>
          <p className="text-xs text-zinc-500 mt-1">OpenHue Client</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-zinc-900 text-indigo-400 border border-zinc-800' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
             onClick={onDisconnect}
             className="flex items-center w-full px-4 py-2 text-sm text-zinc-500 hover:text-red-400 transition-colors"
          >
            <Settings className="w-4 h-4 mr-2" />
            Disconnect
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
