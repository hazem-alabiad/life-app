import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  Dumbbell,
  Target,
  UtensilsCrossed,
  Play,
  Camera,
  Plus,
  Volume2,
  Cloud,
  SlidersHorizontal,
  X,
  Sparkles,
  ArrowRight,
  Database,
} from 'lucide-react';
import { useApp, defaultMainWorkout, mobilityFlowWorkout } from '../context/AppContext';

export const CommandPaletteModal: React.FC = () => {
  const {
    showCommandPalette,
    setShowCommandPalette,
    setActiveTab,
    startWorkout,
    openMicroRecovery,
    setFocusMode,
    setAmbientSound,
    focusState,
    setShowSnapMealModal,
    setShowManualMealModal,
    setShowGitHubAuthModal,
    setShowSettingsModal,
    setShowSupabaseModal,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showCommandPalette) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showCommandPalette]);

  if (!showCommandPalette) return null;

  interface CommandItem {
    id: string;
    title: string;
    category: string;
    icon: React.ElementType;
    action: () => void;
    shortcut?: string;
  }

  const allCommands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-home',
      title: 'Go to Overview Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      action: () => {
        setActiveTab('home');
        setShowCommandPalette(false);
      },
    },
    {
      id: 'nav-move',
      title: 'Go to Movement & Mobility Studio',
      category: 'Navigation',
      icon: Dumbbell,
      action: () => {
        setActiveTab('move');
        setShowCommandPalette(false);
      },
    },
    {
      id: 'nav-focus',
      title: 'Go to Deep Focus Cockpit',
      category: 'Navigation',
      icon: Target,
      action: () => {
        setActiveTab('focus');
        setShowCommandPalette(false);
      },
    },
    {
      id: 'nav-nourish',
      title: 'Go to Mindful Nutrition & Macros',
      category: 'Navigation',
      icon: UtensilsCrossed,
      action: () => {
        setActiveTab('nourish');
        setShowCommandPalette(false);
      },
    },

    // Movement
    {
      id: 'move-start-main',
      title: 'Start Upper Body & Core Workout (35 min)',
      category: 'Movement',
      icon: Play,
      action: () => {
        startWorkout(defaultMainWorkout);
        setShowCommandPalette(false);
      },
      shortcut: 'Workout',
    },
    {
      id: 'move-start-mobility',
      title: 'Start Post-Work Mobility Flow (15 min)',
      category: 'Movement',
      icon: Play,
      action: () => {
        startWorkout(mobilityFlowWorkout);
        setShowCommandPalette(false);
      },
    },
    {
      id: 'move-micro-stretch',
      title: 'Launch 5-Min Desk Mobility Stretch',
      category: 'Movement',
      icon: Sparkles,
      action: () => {
        openMicroRecovery();
        setShowCommandPalette(false);
      },
      shortcut: 'Reset',
    },

    // Focus
    {
      id: 'focus-25m',
      title: 'Start 25m Ultradian Focus Sprint',
      category: 'Deep Focus',
      icon: Target,
      action: () => {
        setFocusMode('focus');
        setActiveTab('focus');
        setShowCommandPalette(false);
      },
    },
    {
      id: 'focus-5m-break',
      title: 'Start 5m Posture Reset Pause',
      category: 'Deep Focus',
      icon: Sparkles,
      action: () => {
        setFocusMode('posture_break');
        setActiveTab('focus');
        setShowCommandPalette(false);
      },
    },
    {
      id: 'focus-audio-binaural',
      title: 'Toggle 144Hz Binaural Theta Hum',
      category: 'Deep Focus',
      icon: Volume2,
      action: () => {
        setAmbientSound(focusState.ambientSound === 'none' ? 'binaural' : 'none');
        setShowCommandPalette(false);
      },
    },

    // Nourish
    {
      id: 'nourish-snap',
      title: 'Snap Meal Photo (Mindful Macro Analysis)',
      category: 'Nourish',
      icon: Camera,
      action: () => {
        setShowSnapMealModal(true);
        setShowCommandPalette(false);
      },
    },
    {
      id: 'nourish-manual',
      title: 'Add Food Entry Manually',
      category: 'Nourish',
      icon: Plus,
      action: () => {
        setShowManualMealModal(true);
        setShowCommandPalette(false);
      },
    },

    // System / Cloud
    {
      id: 'sys-supabase',
      title: 'Supabase PostgreSQL Cloud DB Connection',
      category: 'System',
      icon: Database,
      action: () => {
        setShowSupabaseModal(true);
        setShowCommandPalette(false);
      },
    },
    {
      id: 'sys-github-sync',
      title: 'GitHub Cloud Synchronization & Backup',
      category: 'System',
      icon: Cloud,
      action: () => {
        setShowGitHubAuthModal(true);
        setShowCommandPalette(false);
      },
    },
    {
      id: 'sys-settings',
      title: 'Preferences & Audio Cues',
      category: 'System',
      icon: SlidersHorizontal,
      action: () => {
        setShowSettingsModal(true);
        setShowCommandPalette(false);
      },
    },
  ];

  const filtered = allCommands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      setShowCommandPalette(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#0f121a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-[#131722]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, workout, or ritual..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => setShowCommandPalette(false)}
            className="w-6 h-6 rounded-md hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-xs"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Command list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No matching commands found for "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#1e2536] text-white'
                      : 'text-slate-300 hover:bg-[#151924]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#2a344d] text-[#34d399]' : 'bg-[#161a26] text-slate-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <span className="font-medium text-white">{item.title}</span>
                      <span className="text-[10px] text-slate-500 block">{item.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.shortcut && (
                      <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                        {item.shortcut}
                      </span>
                    )}
                    <ArrowRight className={`w-3.5 h-3.5 text-slate-500 ${isSelected ? 'text-[#34d399]' : 'opacity-0'}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 border-t border-white/[0.04] bg-[#0c0e15] flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Navigate with ↑ ↓ · Press Enter to execute</span>
          <span>Esc to exit</span>
        </div>
      </div>
    </div>
  );
};
