import React from 'react';
import { X, Award, Flame, Zap, ShieldCheck, Github, Cloud, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileModal: React.FC = () => {
  const {
    showProfileModal,
    setShowProfileModal,
    completedWorkoutsCount,
    totalMovementMinutes,
    user,
    isAuthenticated,
    setShowGitHubAuthModal,
    lastSyncedAt,
  } = useApp();

  if (!showProfileModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#131720] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h3 className="text-base font-bold text-white">Member Profile & Rhythm Sync</h3>
          <button
            onClick={() => setShowProfileModal(false)}
            className="w-8 h-8 rounded-full bg-[#1e2430] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#171c26] border border-white/5">
          {user ? (
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-14 h-14 rounded-full border-2 border-[#34d399] object-cover shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#fca5a5] border-2 border-[#ff6b4a] flex items-center justify-center text-[#881337] font-bold text-xl shrink-0">
              HA
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-base font-bold text-white truncate">
              {user ? user.name || user.login : 'Hazem Alabiad'}
            </h4>
            <p className="text-xs text-slate-400 font-mono truncate">
              {user ? `@${user.login}` : 'Rhythm Archetype: High Flow Optimizer'}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#34d399] font-medium mt-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Synchronized Bio-Clock (94% Harmony)
            </span>
          </div>
        </div>

        {/* GitHub Cloud Sync State */}
        <div className="p-3.5 rounded-2xl bg-[#171c26] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#24292e] flex items-center justify-center text-white">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {isAuthenticated ? 'Cloud Storage Active' : 'Cloud Sync Offline'}
              </p>
              <p className="text-[10px] text-slate-400">
                {lastSyncedAt ? `Last saved: ${new Date(lastSyncedAt).toLocaleTimeString()}` : 'Connected to local storage'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setShowProfileModal(false);
              setShowGitHubAuthModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#202737] hover:bg-[#283247] text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
          >
            {isAuthenticated ? 'Manage' : 'Connect'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl bg-[#191e29] border border-white/5 text-center">
            <Flame className="w-4 h-4 text-[#ff6b4a] mx-auto mb-1" />
            <span className="text-lg font-bold text-white font-mono">{completedWorkoutsCount}/5</span>
            <span className="text-[10px] text-slate-400 block">Weekly Move</span>
          </div>

          <div className="p-3 rounded-xl bg-[#191e29] border border-white/5 text-center">
            <Zap className="w-4 h-4 text-[#22d3ee] mx-auto mb-1" />
            <span className="text-lg font-bold text-white font-mono">1h 20m</span>
            <span className="text-[10px] text-slate-400 block">Focus Today</span>
          </div>

          <div className="p-3 rounded-xl bg-[#191e29] border border-white/5 text-center">
            <Award className="w-4 h-4 text-[#34d399] mx-auto mb-1" />
            <span className="text-lg font-bold text-white font-mono">28 Days</span>
            <span className="text-[10px] text-slate-400 block">Active Streak</span>
          </div>
        </div>

        {/* Rhythmic Principles */}
        <div className="p-3.5 rounded-2xl bg-[#171c26] border border-white/[0.04] space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Rhythmic Principles
          </span>
          <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
            <p>• <strong>Move:</strong> 5 sessions per week interleaved with posture resets.</p>
            <p>• <strong>Focus:</strong> Ultradian 25/5 rhythm maintaining cognitive bandwidth.</p>
            <p>• <strong>Nourish:</strong> Mindful, screen-free nutritional refueling.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
