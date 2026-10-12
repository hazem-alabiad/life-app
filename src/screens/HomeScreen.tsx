import React from 'react';
import {
  Play,
  Pause,
  ArrowRight,
  Plus,
  Target,
  Dumbbell,
  UtensilsCrossed,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useApp, defaultMainWorkout } from '../context/AppContext';
import { CircadianRhythmBanner } from '../components/CircadianRhythmBanner';

export const HomeScreen: React.FC = () => {
  const {
    focusState,
    toggleFocusTimer,
    setActiveTab,
    startWorkout,
    openMicroRecovery,
    completedWorkoutsCount,
    totalMovementMinutes,
    meals,
    setShowSnapMealModal,
  } = useApp();

  // Format timer MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalCalories = meals.reduce((acc, m) => acc + (m.calories || 0), 0);
  const targetCalories = 2400;
  const calPercent = Math.min(100, Math.round((totalCalories / targetCalories) * 100));

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200 max-w-6xl mx-auto w-full">
      {/* 1. Breathable, quiet greeting */}
      <CircadianRhythmBanner />

      {/* 2. Core Habit Cards (3-column grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Focus */}
        <div className="bg-[#10131b] border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between hover:border-white/10 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                Focus
              </span>
              <span className="font-mono text-[11px]">Cycle {focusState.currentCycle} of {focusState.totalCycles}</span>
            </div>

            <div>
              <div className="text-3xl font-bold font-mono tracking-tight text-white">
                {formatTime(focusState.secondsRemaining)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {focusState.mode === 'focus' ? 'Deep Work Sprint' : 'Restorative Break'}
              </p>
            </div>
          </div>

          <div className="pt-6 flex items-center gap-2">
            <button
              onClick={toggleFocusTimer}
              className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {focusState.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{focusState.isRunning ? 'Pause' : 'Resume'}</span>
            </button>
            <button
              onClick={() => setActiveTab('focus')}
              className="p-2 rounded-xl border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Open Focus Station"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Movement */}
        <div className="bg-[#10131b] border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between hover:border-white/10 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Dumbbell className="w-3.5 h-3.5 text-rose-400" />
                Movement
              </span>
              <span className="font-mono text-[11px]">{completedWorkoutsCount}/5 weekly</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {defaultMainWorkout.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {defaultMainWorkout.durationMin} min • {defaultMainWorkout.exercises.length} exercises
              </p>
            </div>

            {/* Subtle progress bar */}
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((completedWorkoutsCount / 5) * 100)}%` }}
              />
            </div>
          </div>

          <div className="pt-6 flex items-center gap-2">
            <button
              onClick={() => startWorkout(defaultMainWorkout)}
              className="flex-1 py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Workout</span>
            </button>
            <button
              onClick={() => setActiveTab('move')}
              className="p-2 rounded-xl border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Open Movement Studio"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: Fuel */}
        <div className="bg-[#10131b] border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between hover:border-white/10 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400" />
                Fuel &amp; Energy
              </span>
              <span className="font-mono text-[11px]">{calPercent}% goal</span>
            </div>

            <div>
              <div className="text-3xl font-bold font-mono tracking-tight text-white">
                {totalCalories.toLocaleString()}{' '}
                <span className="text-sm font-normal text-slate-400 font-sans">/ {targetCalories} kcal</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {meals.length} meals logged today
              </p>
            </div>

            {/* Subtle progress bar */}
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${calPercent}%` }}
              />
            </div>
          </div>

          <div className="pt-6 flex items-center gap-2">
            <button
              onClick={() => setShowSnapMealModal(true)}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Meal</span>
            </button>
            <button
              onClick={() => setActiveTab('nourish')}
              className="p-2 rounded-xl border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Open Fuel Studio"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Today's Clean Rhythm Schedule */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white tracking-tight">Today's Timeline</h3>
          <button
            onClick={openMicroRecovery}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Launch 5m Posture Reset</span>
          </button>
        </div>

        <div className="bg-[#10131b] border border-white/[0.06] rounded-2xl divide-y divide-white/[0.04] text-xs">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-400 text-[11px] w-16">08:30 AM</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-medium text-white">Wild Salmon Quinoa Bowl</span>
            </div>
            <span className="text-slate-400">Logged · 580 kcal</span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-400 text-[11px] w-16">10:00 AM</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-medium text-white">Deep Focus Sprint · Cycle 2</span>
            </div>
            <span className="text-cyan-400 font-medium">In Progress</span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-400 text-[11px] w-16">02:00 PM</span>
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span className="font-medium text-slate-300">Upper Body Hypertrophy Routine</span>
            </div>
            <span className="text-slate-500">Upcoming · 35 min</span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-400 text-[11px] w-16">05:00 PM</span>
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span className="font-medium text-slate-300">5-Min Desk Mobility &amp; Spine Decompression</span>
            </div>
            <span className="text-slate-500">Upcoming · 5 min</span>
          </div>
        </div>
      </div>
    </div>
  );
};
