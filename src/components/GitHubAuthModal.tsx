import React, { useState } from 'react';
import { X, Github, CheckCircle2, Cloud, RefreshCw, Copy, Check, ExternalLink, ShieldCheck, Download, AlertCircle, ArrowRight, KeyRound, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GitHubAuthModal: React.FC = () => {
  const {
    showGitHubAuthModal,
    setShowGitHubAuthModal,
    user,
    isAuthenticated,
    syncStatus,
    lastSyncedAt,
    loginWithGitHub,
    loginWithGitHubToken,
    connectWithGitHubHandle,
    demoLoginWithGitHub,
    logoutGitHub,
    syncDataToCloud,
    exportDataAsJSON,
    clearDataAndReset,
    meals,
    completedWorkoutsCount,
  } = useApp();

  const [authMethod, setAuthMethod] = useState<'username' | 'token'>('username');
  const [handleInput, setHandleInput] = useState('hazem-alabiad');
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!showGitHubAuthModal) return null;

  const handleConnectByUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleInput.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    const result = await connectWithGitHubHandle(handleInput.trim());
    setLoading(false);
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to connect handle');
    }
  };

  const handleConnectByToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    const result = await loginWithGitHubToken(tokenInput.trim());
    setLoading(false);
    if (!result.success) {
      setErrorMessage(result.error || 'Invalid GitHub token');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#11141c] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#24292e] flex items-center justify-center text-white shadow-inner">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">GitHub Authentication & Cloud Sync</h3>
              <p className="text-xs text-slate-400">Save habits, workouts & bio-rhythms to the cloud</p>
            </div>
          </div>
          <button
            onClick={() => setShowGitHubAuthModal(false)}
            className="w-8 h-8 rounded-full bg-[#1b202a] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isAuthenticated && user ? (
          /* Logged In State */
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#161b24] border border-[#34d399]/20">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-14 h-14 rounded-full border-2 border-[#34d399] object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white truncate">{user.name || user.login}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30">
                    Connected
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">@{user.login}</p>
                {user.bio && (
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {user.bio}
                  </p>
                )}
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
              </div>
            </div>

            {/* Sync Status Card */}
            <div className="p-4 rounded-xl bg-[#151922] border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Persistence Status:</span>
                <span className="flex items-center gap-1.5 text-[#34d399] font-medium">
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Cloud Active & Auto-Saving</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Last Synced:</span>
                <span className="text-slate-200 font-mono">
                  {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Just now'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Items Backed Up:</span>
                <span className="text-slate-200">
                  {meals.length} Meals · {completedWorkoutsCount} Workouts · Ultradian Focus Logs
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => syncDataToCloud()}
                className="py-2.5 px-3 rounded-xl bg-[#202735] hover:bg-[#283244] border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>{syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}</span>
              </button>

              <button
                onClick={exportDataAsJSON}
                className="py-2.5 px-3 rounded-xl bg-[#202735] hover:bg-[#283244] border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#34d399]" />
                <span>Backup JSON</span>
              </button>

              <button
                onClick={() => logoutGitHub()}
                className="py-2.5 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Unauthenticated State */
          <div className="space-y-4">
            {/* Method Tabs */}
            <div className="flex p-1 rounded-xl bg-[#141822] border border-white/5">
              <button
                onClick={() => {
                  setAuthMethod('username');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  authMethod === 'username'
                    ? 'bg-[#1e2535] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Connect by Username
              </button>
              <button
                onClick={() => {
                  setAuthMethod('token');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  authMethod === 'token'
                    ? 'bg-[#1e2535] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In with Token
              </button>
            </div>

            {authMethod === 'username' ? (
              /* Connect by GitHub Username */
              <div className="p-4 rounded-xl bg-[#151a24] border border-[#34d399]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5 text-[#34d399]" />
                    <span>Enter your GitHub Username</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-400/10">
                    Client-Direct · Zero Setup
                  </span>
                </div>

                <form onSubmit={handleConnectByUsername} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-mono">@</span>
                    <input
                      type="text"
                      value={handleInput}
                      onChange={(e) => setHandleInput(e.target.value)}
                      placeholder="hazem-alabiad"
                      className="w-full pl-7 pr-3 py-2 bg-[#0d1017] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#34d399] font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#34d399] hover:bg-[#2fd094] text-[#052814] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Connect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                {errorMessage && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errorMessage}</span>
                  </p>
                )}
              </div>
            ) : (
              /* Sign In with GitHub Token */
              <div className="p-4 rounded-xl bg-[#151a24] border border-[#22d3ee]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#22d3ee]" />
                    <span>GitHub Personal Access Token</span>
                  </span>
                  <span className="text-[10px] text-cyan-400 font-semibold px-2 py-0.5 rounded-full bg-cyan-400/10">
                    Real Verified Auth
                  </span>
                </div>

                <form onSubmit={handleConnectByToken} className="space-y-2">
                  <input
                    type="password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Paste ghp_..."
                    className="w-full px-3 py-2 bg-[#0d1017] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#22d3ee] font-mono"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-[#22d3ee] hover:bg-[#06b6d4] text-[#0f172a] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Authenticate with GitHub</span>
                    )}
                  </button>
                </form>

                {errorMessage && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errorMessage}</span>
                  </p>
                )}
              </div>
            )}

            {/* Quick 1-Click Connect Button */}
            <button
              onClick={demoLoginWithGitHub}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1c222e] hover:bg-[#252c3b] border border-white/10 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>⚡ 1-Click Instant Connect (Hazem Alabiad)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
