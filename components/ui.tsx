import React from 'react';
import { Loader2 } from 'lucide-react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm ${onClick ? 'cursor-pointer hover:border-zinc-700 transition-colors' : ''} ${className}`}>
    {children}
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger', loading?: boolean }> = ({ 
  children, variant = 'primary', className = '', loading, ...props 
}) => {
  const base = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow",
    secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700",
    ghost: "hover:bg-zinc-800 text-zinc-300 hover:text-white",
    danger: "bg-red-900/50 text-red-200 hover:bg-red-900 border border-red-900",
  };
  
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input 
    className={`flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 ring-offset-zinc-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} 
    {...props} 
  />
);

export const Slider: React.FC<{ value: number; onChange: (val: number) => void; max?: number; className?: string }> = ({ value, onChange, max = 100, className = '' }) => (
  <div className={`relative w-full h-2 bg-zinc-800 rounded-full ${className}`}>
    <div 
      className="absolute h-full bg-indigo-500 rounded-full" 
      style={{ width: `${(value / max) * 100}%` }}
    />
    <input 
      type="range" 
      min="0" 
      max={max} 
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      className="absolute w-full h-full opacity-0 cursor-pointer"
    />
  </div>
);

export const Toggle: React.FC<{ checked: boolean; onChange: (val: boolean) => void }> = ({ checked, onChange }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-zinc-700'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);
