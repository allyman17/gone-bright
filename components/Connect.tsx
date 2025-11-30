import React, { useState } from 'react';
import { Card, Button, Input } from './ui';
import { Wifi, AlertCircle, Key } from 'lucide-react';
import { BridgeConfig } from '../types';

interface ConnectProps {
  onConnect: (config: BridgeConfig) => void;
  onDemo: () => void;
  loading: boolean;
  error?: string;
}

export const Connect: React.FC<ConnectProps> = ({ onConnect, onDemo, loading, error }) => {
  const [ip, setIp] = useState('192.168.1.214');
  const [connecting, setConnecting] = useState(false);
  const [waitingForButton, setWaitingForButton] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ip) return;

    setConnecting(true);
    setWaitingForButton(true);

    // Poll for button press (try every 2 seconds for up to 30 seconds)
    const maxAttempts = 15;
    let attempts = 0;

    const pollForKey = async (): Promise<string | null> => {
      try {
        let data;
        
        // Use Electron IPC if available, otherwise fall back to fetch
        if ((window as any).electron?.hue?.fetch) {
          const response = await (window as any).electron.hue.fetch(`https://${ip}/api`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ devicetype: 'gone_bright _app#electron' })
          });
          data = response.data;
        } else {
          const response = await fetch(`https://${ip}/api`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ devicetype: 'gone_bright _app#electron' })
          });
          data = await response.json();
        }

        if (data[0]?.success) {
          return data[0].success.username;
        } else if (data[0]?.error?.type === 101) {
          // Button not pressed yet, continue polling
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return pollForKey();
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
      return null;
    };

    const username = await pollForKey();
    
    setWaitingForButton(false);
    setConnecting(false);

    if (username) {
      onConnect({ ip, username });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 p-4">
      <Card className="w-full max-w-md p-8 border-zinc-800 bg-zinc-925">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
            <Wifi className="w-8 h-8 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Connect to Hue</h2>
          <p className="text-zinc-400 text-center mt-2">
            Enter your Bridge IP and Application Key to start controlling your lights.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-200">{error}</div>
          </div>
        )}

        {waitingForButton && (
          <div className="mb-6 p-4 bg-indigo-900/20 border border-indigo-900/50 rounded-lg flex items-start">
            <Wifi className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="text-sm text-indigo-200">
              Press the button on your Hue Bridge now...
              <br />
              <span className="text-xs text-indigo-400">Waiting for button press (30 seconds)</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Bridge IP Address</label>
            <Input 
              placeholder="192.168.1.x" 
              value={ip} 
              onChange={e => setIp(e.target.value)}
              disabled={connecting}
            />
          </div>

          <Button type="submit" className="w-full" loading={connecting} disabled={!ip}>
            Connect
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between">
            <div className="h-px bg-zinc-800 flex-1"></div>
            <span className="px-4 text-xs text-zinc-600 uppercase">Or</span>
            <div className="h-px bg-zinc-800 flex-1"></div>
        </div>

        <Button variant="secondary" className="w-full mt-6" onClick={onDemo}>
            Try Demo Mode
        </Button>
      </Card>
    </div>
  );
};
