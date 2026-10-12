import React, { useState } from 'react';
import { Search, Plus, SlidersHorizontal, User } from 'lucide-react';
import { useApp, defaultMainWorkout } from '../context/AppContext';

export const TopHeader: React.FC = () => {
  const {
    activeTab,
    setShowProfileModal,
    setShowSettingsModal,
    setShowCommandPalette,
    user,
    setShowSnapMealModal,
    startWorkout,
    openMicroRecovery,
  } = useApp();

  const [showAddMenu, setShowAddMenu] = useState(false);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Today';
      case 'move':
        return 'Movement';
      case 'focus':
        return 'Focus';
      case 'nourish':
        return 'Fuel';
      default:
        return 'Life';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 px-4 sm:px-8 bg-[#090b10]/90 backdrop-blur-md border-b border-white/[0.05] flex items-center justify-between select-none">
      {/* Left: Clean, human page title */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-white tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Center: Minimal Search trigger (Linear style) */}
      <div className="flex-1 max-w-sm mx-4 hidden md:block">
        <button
          onClick={() => setShowCommandPalette(true)}
          className="w-full h-8 px-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] flex items-center justify-between text-xs text-slate-400 hover:text-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Search or jump to...</span>
          </div>
          <kbd className="text-[10px] font-mono text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/5">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Quick actions and Profile */}
      <div className="flex items-center gap-2">
        {/* Quick Add Menu */}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="h-8 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-xs font-medium text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>

          {showAddMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
              <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-[#12151e] border border-white/10 p-1 shadow-2xl z-50 text-xs text-slate-200">
                <button
                  onClick={() => {
                    setShowAddMenu(false);
                    setShowSnapMealModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-left"
                >
                  <span>Log Meal</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddMenu(false);
                    startWorkout(defaultMainWorkout);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-left"
                >
                  <span>Start Workout</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddMenu(false);
                    openMicroRecovery();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-left"
                >
                  <span>5m Stretch</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Settings button */}
        <button
          onClick={() => setShowSettingsModal(true)}
          className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
          title="Preferences"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>

        {/* Profile Avatar */}
        <button
          onClick={() => setShowProfileModal(true)}
          className="w-8 h-8 rounded-full overflow-hidden border border-white/10 hover:border-white/30 transition-colors cursor-pointer shrink-0 flex items-center justify-center bg-white/5"
          title="Profile"
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.login} className="w-full h-full object-cover" />
          ) : (
            <User className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>
      </div>
    </header>
  );
};
