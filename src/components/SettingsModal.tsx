import React, { useState } from 'react';
import { X, Moon, Bell, Volume2, Shield, Github, Download, Trash2, RotateCcw, CheckCircle2, Database } from 'lucide-react';
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
  } = useApp();

  const [resetSuccess, setResetSuccess] = useState(false);

  if (!showSettingsModal) return null;

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all tracked meals, workouts, and focus sessions to initial baseline defaults?')) {
      clearDataAndReset();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#131720] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h3 className="text-base font-bold text-white">Life OS Preferences</h3>
          <button
            onClick={() => setShowSettingsModal(false)}
            className="w-8 h-8 rounded-full bg-[#1e2430] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Cloud Synchronization */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#171c26] border border-white/5">
            <div className="flex items-center gap-2.5">
              <Github className="w-4 h-4 text-white" />
              <div>
                <span className="text-xs font-semibold text-white block">
                  GitHub Cloud Persistence
                </span>
                <span className="text-[11px] text-slate-400">
                  {isAuthenticated ? `Synced with @${user?.login}` : 'Offline local mode'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowSettingsModal(false);
                setShowGitHubAuthModal(true);
              }}
              className="px-3 py-1 rounded-lg bg-[#202737] hover:bg-[#283247] text-xs font-semibold text-[#34d399] border border-white/10 transition-colors cursor-pointer"
            >
              {isAuthenticated ? 'Manage' : 'Setup'}
            </button>
          </div>

          {/* Supabase PostgreSQL Database */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#171c26] border border-white/5">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Supabase PostgreSQL Cloud DB
                </span>
                <span className="text-[11px] text-slate-400">
                  {isSupabaseConfigured() ? 'Live Connected & Syncing' : 'Serverless PostgreSQL storage'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowSettingsModal(false);
                setShowSupabaseModal(true);
              }}
              className="px-3 py-1 rounded-lg bg-[#202737] hover:bg-[#283247] text-xs font-semibold text-emerald-400 border border-white/10 transition-colors cursor-pointer"
            >
              {isSupabaseConfigured() ? 'Connected' : 'Connect'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#171c26] border border-white/5">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-[#ff6b4a]" />
              <div>
                <span className="text-xs font-semibold text-white block">
                  5m Posture Reset Chimes
                </span>
                <span className="text-[11px] text-slate-400">
                  Audio cue when deep work interval ends
                </span>
              </div>
            </div>
            <div className="w-9 h-5 rounded-full bg-[#34d399] p-0.5 cursor-pointer">
              <div className="w-4 h-4 rounded-full bg-white ml-auto" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#171c26] border border-white/5">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-[#22d3ee]" />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Ambient Bio-Soundscapes
                </span>
                <span className="text-[11px] text-slate-400">
                  Auto-fade background audio during rest
                </span>
              </div>
            </div>
            <div className="w-9 h-5 rounded-full bg-[#34d399] p-0.5 cursor-pointer">
              <div className="w-4 h-4 rounded-full bg-white ml-auto" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#171c26] border border-white/5">
            <div className="flex items-center gap-2.5">
              <Moon className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Circadian Dark Canvas</span>
                <span className="text-[11px] text-slate-400">
                  Melatonin preservation palette
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400">Active</span>
          </div>

          {/* Progressive Web App Install Option */}
          <div className="p-3.5 rounded-xl bg-[#171c26] border border-white/5 space-y-2">
            <div>
              <span className="text-xs font-semibold text-white block">Install on Mobile / Home Screen</span>
              <span className="text-[11px] text-slate-400">Run standalone without browser URL bars</span>
            </div>
            <PWAInstallButton variant="settings" />
          </div>

          {/* Dedicated State Reset Card */}
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                <span>Reset Application State</span>
              </span>
              {resetSuccess && (
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> State Reset!
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Restore all habits, workouts, timers, and nutritional logs back to factory defaults.
            </p>
            <button
              onClick={handleReset}
              className="w-full py-2 px-3 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset State to Defaults</span>
            </button>
          </div>

          {/* Backup Action */}
          <div className="pt-2 border-t border-white/[0.06]">
            <button
              onClick={exportDataAsJSON}
              className="w-full py-2.5 px-3 rounded-xl bg-[#1b212d] hover:bg-[#232b3a] text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#34d399]" />
              <span>Export Full JSON Data Backup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
