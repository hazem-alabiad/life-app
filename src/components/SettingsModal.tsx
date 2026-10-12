import React, { useState } from 'react';
import {
  X,
  Target,
  Flame,
  Dumbbell,
  Clock,
  Volume2,
  Bell,
  SlidersHorizontal,
  Github,
  Database,
  Download,
  RotateCcw,
  CheckCircle2,
  Smartphone,
  Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import { isSupabaseConfigured } from '../db/supabase';

export const SettingsModal: React.FC = () => {
  const {
    showSettingsModal,
    setShowSettingsModal,
    setShowGitHubAuthModal,
    setShowSupabaseModal,
    exportDataAsJSON,
    clearDataAndReset,
    user,
    isAuthenticated,
    settings,
    updateSettings,
    resetSettingsToDefault,
    playChime,
  } = useApp();

  const [activeSection, setActiveSection] = useState<'focus' | 'goals' | 'display' | 'cloud'>('focus');
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!showSettingsModal) return null;

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all tracked meals, workouts, focus history, and custom settings to initial defaults?')) {
      clearDataAndReset();
      resetSettingsToDefault();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0f121a] border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">App Configuration &amp; Goals</h3>
              <p className="text-xs text-slate-400">Customize timers, daily wellness targets, and cloud sync</p>
            </div>
          </div>
          <button
            onClick={() => setShowSettingsModal(false)}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Navigation */}
        <div className="flex p-1 bg-[#141824] border border-white/5 rounded-xl gap-1">
          {[
            { id: 'focus', label: 'Pomodoro', icon: Target },
            { id: 'goals', label: 'Goals', icon: Flame },
            { id: 'display', label: 'Display & Audio', icon: Clock },
            { id: 'cloud', label: 'Cloud & Data', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. Pomodoro Timers & Intervals */}
        {activeSection === 'focus' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Quick preset buttons */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Quick Cadence Presets
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Classic', focus: 25, short: 5, long: 15, interval: 4 },
                  { label: 'Extended', focus: 50, short: 10, long: 20, interval: 4 },
                  { label: 'Sprint', focus: 15, short: 3, long: 10, interval: 4 },
                  { label: 'Ultradian', focus: 90, short: 20, long: 30, interval: 2 },
                ].map((p) => {
                  const isMatch =
                    settings.focusDurationMin === p.focus &&
                    settings.shortBreakDurationMin === p.short;
                  return (
                    <button
                      key={p.label}
                      onClick={() =>
                        updateSettings({
                          focusDurationMin: p.focus,
                          shortBreakDurationMin: p.short,
                          longBreakDurationMin: p.long,
                          longBreakInterval: p.interval,
                        })
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isMatch
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                          : 'bg-[#151924] border-white/5 text-slate-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white">{p.label}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {p.focus}m / {p.short}m
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom duration sliders */}
            <div className="space-y-3 pt-1">
              {/* Focus Duration */}
              <div className="p-3.5 rounded-xl bg-[#151924] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">Focus Duration</span>
                  <span className="font-mono font-bold text-cyan-400 text-sm">
                    {settings.focusDurationMin} min
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={settings.focusDurationMin}
                  onChange={(e) => updateSettings({ focusDurationMin: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Short Break */}
              <div className="p-3.5 rounded-xl bg-[#151924] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">Short Break Duration</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {settings.shortBreakDurationMin} min
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={settings.shortBreakDurationMin}
                  onChange={(e) => updateSettings({ shortBreakDurationMin: Number(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              {/* Long Break */}
              <div className="p-3.5 rounded-xl bg-[#151924] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">Long Break Duration</span>
                  <span className="font-mono font-bold text-purple-400 text-sm">
                    {settings.longBreakDurationMin} min
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="5"
                  value={settings.longBreakDurationMin}
                  onChange={(e) => updateSettings({ longBreakDurationMin: Number(e.target.value) })}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>

              {/* Long break cycle interval */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#151924] border border-white/5 text-xs">
                <div>
                  <span className="font-medium text-white block">Long Break Cadence</span>
                  <span className="text-[11px] text-slate-400">Interval before long rest</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[2, 3, 4, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => updateSettings({ longBreakInterval: num })}
                      className={`w-7 h-7 rounded-lg font-mono text-xs font-semibold cursor-pointer ${
                        settings.longBreakInterval === num
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Wellness & Daily Goals */}
        {activeSection === 'goals' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Daily Calories Goal */}
            <div className="p-3.5 rounded-xl bg-[#151924] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-emerald-400" />
                  Daily Caloric Target
                </span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {settings.dailyCaloriesGoal.toLocaleString()} kcal
                </span>
              </div>
              <input
                type="range"
                min="1200"
                max="4500"
                step="100"
                value={settings.dailyCaloriesGoal}
                onChange={(e) => updateSettings({ dailyCaloriesGoal: Number(e.target.value) })}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1,200 kcal</span>
                <span>2,400 kcal</span>
                <span>4,500 kcal</span>
              </div>
            </div>

            {/* Daily Protein Goal */}
            <div className="p-3.5 rounded-xl bg-[#151924] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-rose-400" />
                  Daily Protein Target
                </span>
                <span className="font-mono font-bold text-rose-400 text-sm">
                  {settings.dailyProteinGoal} g
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                step="5"
                value={settings.dailyProteinGoal}
                onChange={(e) => updateSettings({ dailyProteinGoal: Number(e.target.value) })}
                className="w-full accent-rose-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>50g</span>
                <span>150g</span>
                <span>300g</span>
              </div>
            </div>

            {/* Weekly Workouts Target */}
            <div className="p-3.5 rounded-xl bg-[#151924] border border-white/5 flex items-center justify-between text-xs">
              <div>
                <span className="font-medium text-white block">Weekly Workouts Target</span>
                <span className="text-[11px] text-slate-400">Target sessions per week</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[3, 4, 5, 6, 7].map((days) => (
                  <button
                    key={days}
                    onClick={() => updateSettings({ weeklyWorkoutGoal: days })}
                    className={`w-8 h-8 rounded-lg font-mono text-xs font-semibold cursor-pointer ${
                      settings.weeklyWorkoutGoal === days
                        ? 'bg-rose-500 text-white font-bold'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Movement Minutes */}
            <div className="p-3.5 rounded-xl bg-[#151924] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white">Daily Active Movement Goal</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">
                  {settings.dailyMovementGoalMin} min / day
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                step="5"
                value={settings.dailyMovementGoalMin}
                onChange={(e) => updateSettings({ dailyMovementGoalMin: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 3. Display & Audio */}
        {activeSection === 'display' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Audio Completion Chime */}
            <div className="p-3.5 rounded-xl bg-[#151924] border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="font-medium text-white block">Completion Audio Chime</span>
                    <span className="text-[11px] text-slate-400">Harmonious triad when sprint completes</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={playChime}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-medium text-slate-300 transition-colors cursor-pointer"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => updateSettings({ soundAlerts: !settings.soundAlerts })}
                    className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                      settings.soundAlerts ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.soundAlerts ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Volume slider */}
              <div className="pt-2 border-t border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    Chime Volume
                  </span>
                  <span className="font-mono">{settings.soundVolume}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={settings.soundVolume}
                  onChange={(e) => updateSettings({ soundVolume: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Time Format */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#151924] border border-white/5 text-xs">
              <div>
                <span className="font-medium text-white block">Time Display Format</span>
                <span className="text-[11px] text-slate-400">12-hour AM/PM vs 24-hour military clock</span>
              </div>
              <div className="flex items-center gap-1.5">
                {(['12h', '24h'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => updateSettings({ timeFormat: fmt })}
                    className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold cursor-pointer ${
                      settings.timeFormat === fmt
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* PWA Mobile App */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#151924] border border-white/5 text-xs">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-medium text-white block">Progressive Web App (PWA)</span>
                  <span className="text-[11px] text-slate-400">Install as standalone mobile home-screen app</span>
                </div>
              </div>
              <PWAInstallButton variant="sidebar" />
            </div>
          </div>
        )}

        {/* 4. Cloud & Data Persistence */}
        {activeSection === 'cloud' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* Supabase Connection */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#151924] border border-white/5">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Supabase PostgreSQL Cloud DB
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isSupabaseConfigured() ? 'Connected and synchronized' : 'Connect real PostgreSQL cloud database'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowSupabaseModal(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs border border-emerald-500/30 transition-colors cursor-pointer"
              >
                {isSupabaseConfigured() ? 'Manage DB' : 'Connect'}
              </button>
            </div>

            {/* GitHub Sync */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#151924] border border-white/5">
              <div className="flex items-center gap-2.5">
                <Github className="w-4 h-4 text-white" />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    GitHub Cloud Account
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isAuthenticated ? `Synced with @${user?.login}` : 'Connect with GitHub'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowGitHubAuthModal(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors cursor-pointer"
              >
                {isAuthenticated ? 'Manage' : 'Sign In'}
              </button>
            </div>

            {/* Export JSON backup */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#151924] border border-white/5">
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-xs font-semibold text-white block">Export Data Backup</span>
                  <span className="text-[11px] text-slate-400">Download complete rhythm history as JSON</span>
                </div>
              </div>
              <button
                onClick={exportDataAsJSON}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Export
              </button>
            </div>

            {/* Factory State Reset */}
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-300 block">Factory State Reset</span>
                  <span className="text-[11px] text-rose-200/70">Wipe all local meals, workouts, and restored defaults</span>
                </div>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Reset State
                </button>
              </div>
              {resetSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>State successfully reset to baseline!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
          <button
            onClick={resetSettingsToDefault}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Settings</span>
          </button>
          <button
            onClick={() => setShowSettingsModal(false)}
            className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
