import React from 'react';
import { X, SlidersHorizontal, Volume2, Bell, Check, RotateCcw, Clock, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FocusSettingsModal: React.FC = () => {
  const {
    showFocusSettingsModal,
    setShowFocusSettingsModal,
    settings,
    updateSettings,
    resetSettingsToDefault,
    playChime,
  } = useApp();

  if (!showFocusSettingsModal) return null;

  const presets = [
    { label: 'Classic', focus: 25, short: 5, long: 15, interval: 4 },
    { label: 'Extended', focus: 50, short: 10, long: 20, interval: 4 },
    { label: 'Quick Sprint', focus: 15, short: 3, long: 10, interval: 4 },
    { label: 'Ultradian Flow', focus: 90, short: 20, long: 30, interval: 2 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#11141c] border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">Configure Pomodoro</h3>
              <p className="text-xs text-slate-400">Customize focus intervals, break cadence, and alerts</p>
            </div>
          </div>
          <button
            onClick={() => setShowFocusSettingsModal(false)}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Quick Presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Cadence Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((p) => {
              const isSelected =
                settings.focusDurationMin === p.focus &&
                settings.shortBreakDurationMin === p.short &&
                settings.longBreakDurationMin === p.long;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() =>
                    updateSettings({
                      focusDurationMin: p.focus,
                      shortBreakDurationMin: p.short,
                      longBreakDurationMin: p.long,
                      longBreakInterval: p.interval,
                    })
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm'
                      : 'bg-[#161a24] border-white/5 text-slate-300 hover:bg-white/[0.04]'
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

        {/* 2. Custom Intervals */}
        <div className="space-y-4 pt-1">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Durations (Minutes)
          </label>

          {/* Focus Sprint */}
          <div className="p-3.5 rounded-xl bg-[#161a24] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Focus Duration
              </span>
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
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>5m</span>
              <span>25m</span>
              <span>50m</span>
              <span>90m</span>
            </div>
          </div>

          {/* Short Break */}
          <div className="p-3.5 rounded-xl bg-[#161a24] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Short Break
              </span>
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
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>2m</span>
              <span>5m</span>
              <span>10m</span>
              <span>20m</span>
            </div>
          </div>

          {/* Long Break */}
          <div className="p-3.5 rounded-xl bg-[#161a24] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Long Break
              </span>
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
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>5m</span>
              <span>15m</span>
              <span>30m</span>
              <span>45m</span>
            </div>
          </div>

          {/* Long Break Interval */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#161a24] border border-white/5">
            <div>
              <span className="text-xs font-medium text-white block">Long Break Interval</span>
              <span className="text-[11px] text-slate-400">Cycles before triggering extended pause</span>
            </div>
            <div className="flex items-center gap-2">
              {[2, 3, 4, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => updateSettings({ longBreakInterval: num })}
                  className={`w-8 h-8 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer ${
                    settings.longBreakInterval === num
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Automation & Audio */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Automation &amp; Sound
          </label>

          <div className="space-y-2">
            {/* Sound alerts toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#161a24] border border-white/5">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-xs font-medium text-white block">Completion Chime</span>
                  <span className="text-[11px] text-slate-400">Play harmonious melodic cue at end of sprint</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={playChime}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-medium text-slate-300 transition-colors cursor-pointer"
                  title="Test audio cue"
                >
                  Test
                </button>
                <button
                  type="button"
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

            {/* Auto start breaks */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#161a24] border border-white/5">
              <div>
                <span className="text-xs font-medium text-white block">Auto-Start Breaks</span>
                <span className="text-[11px] text-slate-400">Immediately start countdown when sprint finishes</span>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ autoStartBreaks: !settings.autoStartBreaks })}
                className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  settings.autoStartBreaks ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.autoStartBreaks ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Auto start focus */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#161a24] border border-white/5">
              <div>
                <span className="text-xs font-medium text-white block">Auto-Start Next Sprint</span>
                <span className="text-[11px] text-slate-400">Automatically resume focus when break expires</span>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ autoStartFocus: !settings.autoStartFocus })}
                className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  settings.autoStartFocus ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.autoStartFocus ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
          <button
            type="button"
            onClick={resetSettingsToDefault}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to defaults</span>
          </button>
          <button
            type="button"
            onClick={() => setShowFocusSettingsModal(false)}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
