import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Sparkles,
  SlidersHorizontal,
  Headphones,
  CheckCircle2,
  Target,
  X,
  Wind,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PomodoroTaskDeck } from '../components/PomodoroTaskDeck';

export const FocusScreen: React.FC = () => {
  const {
    focusState,
    toggleFocusTimer,
    resetFocusTimer,
    setFocusMode,
    setAmbientSound,
    activeFocusTarget,
    setActiveFocusTarget,
    settings,
    setShowFocusSettingsModal,
  } = useApp();

  const [soundActive, setSoundActive] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Synthesized soothing white/pink noise or binaural hum
  const toggleAmbientAudio = (sound: 'none' | 'rain' | 'binaural' | 'forest' | 'lofi') => {
    if (sound === 'none' || soundActive) {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch {
          // ignore
        }
        oscillatorRef.current = null;
      }
      setSoundActive(false);
      setAmbientSound('none');
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = sound === 'binaural' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(sound === 'binaural' ? 144 : 220, ctx.currentTime);

      gain.gain.setValueAtTime((settings.soundVolume / 100) * 0.04, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
      setSoundActive(true);
      setAmbientSound(sound);
    } catch {
      setSoundActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = Math.max(
    0,
    Math.min(
      100,
      ((focusState.totalSeconds - focusState.secondsRemaining) / focusState.totalSeconds) * 100
    )
  );

  const radius = 96;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300 max-w-5xl mx-auto w-full">
      {/* 1. Clean Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Focus Station</h2>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-cyan-400 font-mono font-semibold">
              Cycle {focusState.currentCycle} of {settings.longBreakInterval}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {focusState.mode === 'focus'
              ? 'Deep ultradian sprint · Eliminate distractions'
              : focusState.mode === 'posture_break'
              ? 'Short recovery break · Stretch spine & rest eyes'
              : 'Extended pause · Hydrate & reset'}
          </p>
        </div>

        {/* Quick Toolbar: Ambient Sound + Configure Gear */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Soundscapes dropdown / toggle */}
          <div className="flex items-center p-1 bg-[#12151e] border border-white/5 rounded-xl">
            <button
              onClick={() => toggleAmbientAudio('binaural')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                soundActive && focusState.ambientSound === 'binaural'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="144Hz Theta Waves"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Theta</span>
            </button>
            <button
              onClick={() => toggleAmbientAudio('rain')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                soundActive && focusState.ambientSound === 'rain'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Pink Flow Audio"
            >
              <Wind className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Flow</span>
            </button>
            {soundActive && (
              <button
                onClick={() => toggleAmbientAudio('none')}
                className="p-1.5 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                title="Mute Sound"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Pomodoro Settings Button */}
          <button
            onClick={() => setShowFocusSettingsModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#12151e] hover:bg-white/[0.06] border border-white/5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Configure Pomodoro durations and alerts"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Configure</span>
          </button>
        </div>
      </div>

      {/* 2. Simplified Timer Display Card */}
      <div className="bg-[#10131b] border border-white/[0.06] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-6">
        {/* Mode Selector Segmented Tabs */}
        <div className="inline-flex p-1 bg-[#151924] border border-white/5 rounded-xl">
          <button
            onClick={() => setFocusMode('focus')}
            className={`py-1.5 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              focusState.mode === 'focus'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Focus ({settings.focusDurationMin}m)
          </button>

          <button
            onClick={() => setFocusMode('posture_break')}
            className={`py-1.5 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              focusState.mode === 'posture_break'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Short Break ({settings.shortBreakDurationMin}m)
          </button>

          <button
            onClick={() => setFocusMode('deep_break')}
            className={`py-1.5 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              focusState.mode === 'deep_break'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Long Break ({settings.longBreakDurationMin}m)
          </button>
        </div>

        {/* Minimalist SVG Radial Ring */}
        <div className="relative w-60 h-60 sm:w-68 sm:h-68 flex items-center justify-center my-1">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 220 220">
            {/* Background ring */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke="#181d2a"
              strokeWidth="8"
            />
            {/* Active animated stroke */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke={focusState.mode === 'focus' ? '#22d3ee' : focusState.mode === 'posture_break' ? '#34d399' : '#c084fc'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Central digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-extrabold text-white font-mono tracking-tight tabular-nums drop-shadow-sm">
              {formatTime(focusState.secondsRemaining)}
            </span>
            <span className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-1">
              {focusState.isRunning ? 'Active Flow' : 'Paused'}
            </span>
            <span className="text-[11px] font-mono text-cyan-400 mt-0.5">
              {Math.round(progress)}% complete
            </span>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetFocusTimer}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/5"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFocusTimer}
            className="px-8 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-400/20 active:scale-95"
          >
            {focusState.isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={() => setFocusMode(focusState.mode === 'focus' ? 'posture_break' : 'focus')}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/5"
            title="Skip Phase"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Active Focus Target Pill (quiet and unboxed) */}
        {activeFocusTarget && (
          <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 max-w-md">
            <Target className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate font-medium">{activeFocusTarget.label}</span>
            <button
              onClick={() => setActiveFocusTarget(null)}
              className="ml-auto text-slate-400 hover:text-white p-0.5"
              title="Clear Target"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* 3. Grouped Pomodoro Task & Subtask Management Deck */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Focus Tasks &amp; Subtasks
            </h3>
            <p className="text-xs text-slate-400">
              Select any task to set as active Pomodoro sprint target
            </p>
          </div>
        </div>

        <PomodoroTaskDeck />
      </div>
    </div>
  );
};
