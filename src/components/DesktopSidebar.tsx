import React from 'react';
import {
  LayoutDashboard,
  Dumbbell,
  Target,
  UtensilsCrossed,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Database,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';
import { isSupabaseConfigured } from '../db/supabase';

export const DesktopSidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setShowSettingsModal,
    setShowSupabaseModal,
    desktopNavCollapsed,
    setDesktopNavCollapsed,
  } = useApp();

  const navItems: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Today', icon: LayoutDashboard },
    { id: 'move', label: 'Movement', icon: Dumbbell },
    { id: 'focus', label: 'Focus', icon: Target },
    { id: 'nourish', label: 'Fuel', icon: UtensilsCrossed },
  ];

  const supabaseActive = isSupabaseConfigured();

  return (
    <aside
      className={`hidden md:flex flex-col bg-[#07090e] border-r border-white/[0.05] transition-all duration-200 select-none shrink-0 ${
        desktopNavCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.04]">
        <div
          className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
          onClick={() => setActiveTab('home')}
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          {!desktopNavCollapsed && (
            <span className="font-semibold text-white text-sm tracking-tight">Life</span>
          )}
        </div>

        <button
          onClick={() => setDesktopNavCollapsed((prev) => !prev)}
          className="w-6 h-6 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          {desktopNavCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-2.5 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-white/[0.08] text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              {!desktopNavCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer / Database Indicator & Settings */}
      <div className="p-3 border-t border-white/[0.04] space-y-1">
        <button
          onClick={() => setShowSupabaseModal(true)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] transition-colors cursor-pointer"
          title={supabaseActive ? 'Supabase Connected' : 'Connect Database'}
        >
          <Database className={`w-3.5 h-3.5 shrink-0 ${supabaseActive ? 'text-emerald-400' : 'text-slate-500'}`} />
          {!desktopNavCollapsed && (
            <span className="truncate text-[11px] text-slate-400">
              {supabaseActive ? 'Cloud Synced' : 'Connect DB'}
            </span>
          )}
        </button>

        <button
          onClick={() => setShowSettingsModal(true)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          {!desktopNavCollapsed && <span className="text-[11px]">Settings</span>}
        </button>
      </div>
    </aside>
  );
};
