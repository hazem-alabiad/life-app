import React from 'react';
import { Home, Dumbbell, Timer } from 'lucide-react';
import { TabType } from '../types';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5 stroke-[2]" />,
    },
    {
      id: 'move',
      label: 'Move',
      icon: <Dumbbell className="w-5 h-5 stroke-[2]" />,
    },
    {
      id: 'focus',
      label: 'Focus',
      icon: <Timer className="w-5 h-5 stroke-[2]" />,
    },
    {
      id: 'nourish',
      label: 'Nourish',
      icon: (
        // Stylized lotus / leaf icon matching the design
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21a9 9 0 0 0 9-9c0-4.97-4.03-9-9-9-4.97 0-9 4.03-9 9a9 9 0 0 0 9 9Z" className="opacity-0" />
          <path d="M12 21V9" />
          <path d="M12 9c-3 0-6 2.5-6 6a6 6 0 0 0 6 6" />
          <path d="M12 9c3 0 6 2.5 6 6a6 6 0 0 1-6 6" />
          <path d="M12 3c-1.5 2-2 3.5-2 5h4c0-1.5-.5-3-2-5Z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0c10]/95 backdrop-blur-lg border-t border-white/[0.06] pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 items-center px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 transition-colors group relative ${
                isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div
                className={`transition-transform duration-150 ${
                  isActive ? 'scale-110 text-white' : 'group-hover:scale-105'
                }`}
              >
                {item.icon}
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-white font-semibold' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -top-[1px] w-8 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
