import React, { useState, useRef, useEffect } from 'react';
import { HueService } from '../services/hueService';
import { GeminiAssistant } from '../services/geminiService';
import { HueLight, ChatMessage } from '../types';
import { Card, Input, Button } from './ui';
import { Send, Bot, User } from 'lucide-react';

interface AssistantProps {
  hueService: HueService;
  lights: HueLight[];
}

export const Assistant: React.FC<AssistantProps> = ({ hueService, lights }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am Gone Bright . Ask me to control your lights.', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const assistant = new GeminiAssistant(hueService, lights);
      const responseText = await assistant.processUserRequest(userMsg.text);
      
      const botMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText, 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: 'Sorry, I encountered an error communicating with the AI service.', 
        timestamp: Date.now() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">AI Assistant</h2>
        <p className="text-zinc-400">Powered by Gemini 2.5 Flash</p>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 bg-zinc-900/50 backdrop-blur-sm border-zinc-800">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mx-2 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-3 rounded-lg text-sm ${
                    msg.role === 'user' 
                        ? 'bg-indigo-600/20 text-indigo-100 border border-indigo-600/30' 
                        : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900/80">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Turn off the kitchen lights..."
                disabled={loading}
                className="flex-1"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
                {loading ? 'Thinking...' : <Send size={18} />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
