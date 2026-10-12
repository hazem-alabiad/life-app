import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Sparkles, AlertCircle, Headphones, CheckCircle2, ShieldCheck, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PomodoroTaskDeck } from '../components/PomodoroTaskDeck';

export const FocusScreen: React.FC = () => {
  const { focusState, toggleFocusTimer, resetFocusTimer, setFocusMode, setAmbientSound, activeFocusTarget } = useApp();
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

      gain.gain.setValueAtTime(0.03, ctx.currentTime);

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
    <div className="space-y-6 pb-16 animate-in fade-in duration-300 max-w-7xl mx-auto w-full">
      {/* Top Header info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-[#22d3ee] uppercase">
            ULTRADIAN FOCUS COCKPIT
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            {focusState.mode === 'focus'
              ? 'Deep Work Sprint'
              : focusState.mode === 'posture_break'
              ? '5m Posture Reset & Spine Decompression'
              : 'Long Restorative Pause'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-[#181f2b] border border-[#22d3ee]/30 text-xs text-[#22d3ee] font-mono font-bold">
            Cycle {focusState.currentCycle} of {focusState.totalCycles}
          </span>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-3 max-w-xl">
        <button
          onClick={() => setFocusMode('focus')}
          className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            focusState.mode === 'focus'
              ? 'bg-[#152a38] border-[#22d3ee] text-[#22d3ee] shadow-md shadow-[#22d3ee]/10'
              : 'bg-[#141822] border-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          25m Sprint
        </button>

        <button
          onClick={() => setFocusMode('posture_break')}
          className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            focusState.mode === 'posture_break'
              ? 'bg-[#152c25] border-[#34d399] text-[#34d399] shadow-md shadow-[#34d399]/10'
              : 'bg-[#141822] border-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          5m Posture Break
        </button>

        <button
          onClick={() => setFocusMode('deep_break')}
          className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            focusState.mode === 'deep_break'
              ? 'bg-[#2d1f22] border-[#ff6b4a] text-[#ff6b4a] shadow-md shadow-[#ff6b4a]/10'
              : 'bg-[#141822] border-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          15m Restorative
        </button>
      </div>

      {/* Main Cockpit Layout: Dial Card + Sound & Posture Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Dial Card (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-[#141822] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center text-center">
          {/* Large SVG Timer Ring */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 220 220">
              {/* Background ring */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke="#1f2635"
                strokeWidth="10"
              />
              {/* Active animated stroke */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke={focusState.mode === 'focus' ? '#22d3ee' : focusState.mode === 'posture_break' ? '#34d399' : '#ff6b4a'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Inner Content Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tighter tabular-nums drop-shadow-md">
                {formatTime(focusState.secondsRemaining)}
              </span>
              <span className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-1">
                {focusState.isRunning ? 'Active Flow' : 'Paused'}
              </span>
              <span className="text-[11px] text-[#22d3ee] font-mono mt-0.5">
                {Math.round(progress)}% Completed
              </span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={resetFocusTimer}
              className="p-3.5 rounded-2xl bg-[#1b2230] hover:bg-[#252f42] text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/5"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={toggleFocusTimer}
              className="px-8 py-3.5 rounded-2xl bg-[#22d3ee] hover:bg-[#06b6d4] text-[#0f172a] font-bold text-sm flex items-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-[#22d3ee]/25 active:scale-95"
            >
              {focusState.isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause Sprint</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Resume Sprint</span>
                </>
              )}
            </button>

            <button
              onClick={() => setFocusMode(focusState.mode === 'focus' ? 'posture_break' : 'focus')}
              className="p-3.5 rounded-2xl bg-[#1b2230] hover:bg-[#252f42] text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/5"
              title="Skip to next phase"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Active Focus Target Pill */}
          {activeFocusTarget && (
            <div className="mt-4 px-3.5 py-1.5 rounded-full bg-[#16222f] border border-[#22d3ee]/30 flex items-center gap-2 text-xs text-[#22d3ee] max-w-md">
              <Target className="w-3.5 h-3.5 shrink-0 animate-pulse" />
              <span className="truncate font-medium">{activeFocusTarget.label}</span>
            </div>
          )}
        </div>

        {/* Right Side: Soundscapes & Posture Protocol (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Ambient Soundscape Deck */}
          <div className="bg-[#141822] border border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[#22d3ee]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Ambient Bio-Acoustics
                </span>
              </div>
              {soundActive && (
                <span className="flex items-center gap-1 text-[10px] text-[#22d3ee] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-ping" />
                  Active
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Synthesized audio hum to mask background chatter and enhance theta-wave coherence.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => toggleAmbientAudio('binaural')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  focusState.ambientSound === 'binaural' && soundActive
                    ? 'bg-[#152a38] border-[#22d3ee] text-[#22d3ee]'
                    : 'bg-[#171d27] border-white/5 text-slate-300 hover:bg-[#202735]'
                }`}
              >
                <span>Binaural (144 Hz)</span>
                <Volume2 className="w-3.5 h-3.5 opacity-70" />
              </button>

              <button
                onClick={() => toggleAmbientAudio('rain')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  focusState.ambientSound === 'rain' && soundActive
                    ? 'bg-[#152a38] border-[#22d3ee] text-[#22d3ee]'
                    : 'bg-[#171d27] border-white/5 text-slate-300 hover:bg-[#202735]'
                }`}
              >
                <span>Pink Flow / Rain</span>
                <Volume2 className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>
          </div>

          {/* Posture Reset Guide */}
          <div className="bg-[#141822] border border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-3">
            <span className="text-[10px] font-bold tracking-wider text-[#34d399] uppercase">
              INTERLEAVED POSTURE PROTOCOL
            </span>
            <h4 className="text-base font-bold text-white tracking-tight">
              Circadian Micro-Break Stretch
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              When this 25m cycle completes, execute the 3-step posture sequence:
            </p>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-[#171d28] border border-white/5 flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#34d399]/20 text-[#34d399] flex items-center justify-center font-bold text-[10px]">1</span>
                <span>Stand tall, interlace fingers behind back, expand ribcage (60s)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#171d28] border border-white/5 flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#34d399]/20 text-[#34d399] flex items-center justify-center font-bold text-[10px]">2</span>
                <span>Gentle neck retractions & chin tucks against headrest (60s)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#171d28] border border-white/5 flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#34d399]/20 text-[#34d399] flex items-center justify-center font-bold text-[10px]">3</span>
                <span>Drink 250ml water and gaze at 20+ feet distant object (60s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Pomodoro Task & Subtask Management Deck */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              SPRINT TARGETS & QUEUES
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Grouped Lists & Subtasks
            </h3>
          </div>
        </div>

        <PomodoroTaskDeck />
      </div>
    </div>
  );
};
