import React from 'react';
import { Calendar, Dumbbell, History, Play, Clock, Sparkles, Plus, CheckCircle2, Flame, Award, ChevronRight } from 'lucide-react';
import { useApp, defaultMainWorkout, mobilityFlowWorkout } from '../context/AppContext';

export const MoveScreen: React.FC = () => {
  const {
    moveSubTab,
    setMoveSubTab,
    selectedDate,
    setSelectedDate,
    openMicroRecovery,
    startWorkout,
    setShowCustomWorkoutBuilder,
    completedWorkoutsCount,
    totalMovementMinutes,
  } = useApp();

  const daysOfWeek = [
    { day: 'Mon', date: 5, completed: false },
    { day: 'Tue', date: 6, completed: true },
    { day: 'Wed', date: 7, completed: true },
    { day: 'Thu', date: 8, completed: true },
    { day: 'Fri', date: 9, completed: false, isToday: true },
    { day: 'Sat', date: 10, completed: false },
    { day: 'Sun', date: 11, completed: false },
  ];

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300 max-w-7xl mx-auto w-full">
      {/* Top Header & Subtab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMoveSubTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              moveSubTab === 'schedule'
                ? 'bg-[#ff6b4a] text-white shadow-md shadow-[#ff6b4a]/25'
                : 'bg-[#151922] text-slate-300 border border-white/5 hover:bg-[#1d2330]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Weekly Schedule</span>
          </button>

          <button
            onClick={() => setMoveSubTab('exercises')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              moveSubTab === 'exercises'
                ? 'bg-[#ff6b4a] text-white shadow-md shadow-[#ff6b4a]/25'
                : 'bg-[#151922] text-slate-300 border border-white/5 hover:bg-[#1d2330]'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Exercise Library</span>
          </button>

          <button
            onClick={() => setMoveSubTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              moveSubTab === 'history'
                ? 'bg-[#ff6b4a] text-white shadow-md shadow-[#ff6b4a]/25'
                : 'bg-[#151922] text-slate-300 border border-white/5 hover:bg-[#1d2330]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Training Log</span>
          </button>
        </div>

        <button
          onClick={() => setShowCustomWorkoutBuilder(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#ff6b4a]/20 to-[#34d399]/20 hover:from-[#ff6b4a]/30 hover:to-[#34d399]/30 border border-[#ff6b4a]/40 text-xs font-bold text-white transition-all cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#34d399]" />
          <span>Questionnaire Routine Builder (Home Only)</span>
        </button>
      </div>

      {moveSubTab === 'schedule' && (
        <div className="space-y-6">
          {/* Weekly Interactive Calendar Strip */}
          <div className="bg-[#141822] border border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white">May 2025 · Week 19 Rhythm</span>
                <p className="text-[11px] text-slate-400">Target: 5 weekly sessions with 48h muscle recovery cycle</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-400">Completed: <strong className="text-white font-mono">{completedWorkoutsCount}/5</strong></span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Rhythm On Track
                </span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((item) => {
                const isSelected = selectedDate === item.date;
                return (
                  <button
                    key={item.date}
                    onClick={() => setSelectedDate(item.date)}
                    className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#222838] border-[#ff6b4a] shadow-md shadow-[#ff6b4a]/15 text-white'
                        : 'bg-[#11141c] border-white/[0.04] hover:bg-[#181d28] text-slate-300'
                    }`}
                  >
                    <span className="text-[11px] font-medium text-slate-400">{item.day}</span>
                    <span className="text-base font-bold mt-0.5 font-mono tabular-nums">
                      {item.date}
                    </span>
                    <div className="h-2 mt-1 flex items-center justify-center">
                      {item.completed && (
                        <span className="w-2 h-2 rounded-full bg-[#34d399]" title="Workout Completed" />
                      )}
                      {item.isToday && (
                        <span className="w-2 h-2 rounded-full bg-[#ff6b4a]" title="Today" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop 2-Column Workout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Featured Today Workout & Flow */}
            <div className="lg:col-span-2 space-y-6">
              {/* Primary Workout Card */}
              <div className="bg-[#141822] border border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-4 hover:border-[#ff6b4a]/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#ff6b4a]/15 text-[#ff6b4a] text-xs font-semibold border border-[#ff6b4a]/25">
                    <Sparkles className="w-3.5 h-3.5" />
                    Recommended Today
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-300 text-xs font-mono font-semibold">
                    <Clock className="w-4 h-4 text-[#ff6b4a]" />
                    <span>35 min · Moderate</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {defaultMainWorkout.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Focused hypertrophy sequence targeting pushing mechanics and rotational abdominal stability.
                  </p>
                </div>

                {/* Muscle Focus Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-[#1d2331] text-xs font-medium text-slate-300">
                    Pectoralis Major
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#1d2331] text-xs font-medium text-slate-300">
                    Anterior Deltoids
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#1d2331] text-xs font-medium text-slate-300">
                    Triceps Brachii
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#1d2331] text-xs font-medium text-slate-300">
                    Transverse Abdominis
                  </span>
                </div>

                {/* 4 Exercise Thumbnails Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {defaultMainWorkout.exercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#181d28] border border-white/5"
                    >
                      <img
                        src={ex.image}
                        alt={ex.name}
                        className="w-14 h-14 rounded-lg object-cover shrink-0 bg-[#252b38]"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate leading-tight">
                          {ex.name}
                        </p>
                        <p className="text-[11px] text-[#ff6b4a] font-medium font-mono mt-0.5">
                          {ex.sets} sets × {ex.repsOrDuration}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {ex.targetMuscles.join(', ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Start Session CTA */}
                <button
                  onClick={() => startWorkout(defaultMainWorkout)}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#ff6b4a] hover:bg-[#ff5a36] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b4a]/25 transition-all cursor-pointer active:scale-[0.99]"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Launch Workout Guide (Live Tracker)</span>
                </button>
              </div>

              {/* Secondary Workout: Post-Work Mobility Flow */}
              <div className="bg-[#141822] border border-white/[0.08] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>15 min · Light Intensity Recovery</span>
                  </div>
                  <h4 className="text-base font-bold text-white tracking-tight">
                    Post-Work Lower Body Mobility Flow
                  </h4>
                  <p className="text-xs text-slate-400">
                    Decompresses hip flexors and unlocks thoracic mobility after prolonged sitting.
                  </p>
                </div>

                <button
                  onClick={() => startWorkout(mobilityFlowWorkout)}
                  className="px-5 py-2.5 rounded-xl bg-[#1e2535] hover:bg-[#283247] text-xs font-bold text-white border border-white/10 transition-colors shrink-0 cursor-pointer"
                >
                  Start Flow →
                </button>
              </div>
            </div>

            {/* Right Column: Micro-Recovery & Bio-Stats */}
            <div className="space-y-6">
              {/* Micro-Recovery Card */}
              <div className="bg-[#141822] border border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    MICRO-RECOVERY PAUSE
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">5 Min Reset</span>
                </div>

                <h4 className="text-base font-bold text-white tracking-tight">
                  Desk Ergonomic Decompression
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interleaving short mobility intervals during focus sprints restores spinal hydration and improves blood circulation.
                </p>

                <div className="p-3 rounded-xl bg-[#191e2b] border border-white/5 space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ff6b4a]" />
                    <span>Thoracic spine extension</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ff6b4a]" />
                    <span>Psoas & hip flexor release</span>
                  </div>
                </div>

                <button
                  onClick={openMicroRecovery}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#ff6b4a]/20 hover:bg-[#ff6b4a]/30 border border-[#ff6b4a]/40 text-[#ff8366] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start 5-Min Stretch Guide</span>
                </button>
              </div>

              {/* Movement Volume Metrics */}
              <div className="bg-[#141822] border border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-3">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  WEEKLY METRICS SUMMARY
                </span>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-[#191e29] border border-white/5">
                    <Flame className="w-4 h-4 text-[#ff6b4a] mx-auto mb-1" />
                    <span className="text-lg font-bold text-white font-mono">{totalMovementMinutes} min</span>
                    <span className="text-[10px] text-slate-400 block">Total Volume</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#191e29] border border-white/5">
                    <Award className="w-4 h-4 text-[#34d399] mx-auto mb-1" />
                    <span className="text-lg font-bold text-white font-mono">1,420 kcal</span>
                    <span className="text-[10px] text-slate-400 block">Est. Energy Burn</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exercises Library View */}
      {moveSubTab === 'exercises' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Full Biomechanical Exercise Library</h3>
              <p className="text-xs text-slate-400">Targeting hypertrophy, core stiffness, and joint mobility</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">4 Featured Routines</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {defaultMainWorkout.exercises.concat(mobilityFlowWorkout.exercises).map((ex) => (
              <div
                key={ex.id}
                className="bg-[#141822] border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between hover:border-white/20 transition-all space-y-3"
              >
                <div>
                  <img
                    src={ex.image}
                    alt={ex.name}
                    className="w-full h-40 rounded-xl object-cover bg-[#252b38] mb-3"
                  />
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-base font-bold text-white">{ex.name}</h4>
                    <span className="text-xs text-[#ff6b4a] font-mono font-bold">{ex.repsOrDuration}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 my-2">
                    {ex.targetMuscles.map((muscle) => (
                      <span
                        key={muscle}
                        className="text-[10px] bg-[#1d2331] text-slate-300 px-2 py-0.5 rounded-md font-medium"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {ex.tips}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono">{ex.sets} Sets Programmed</span>
                  <button
                    onClick={() => startWorkout(defaultMainWorkout)}
                    className="text-[#ff6b4a] hover:underline font-semibold cursor-pointer"
                  >
                    Add to Session →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Log View */}
      {moveSubTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Movement & Training Log</h3>
              <p className="text-xs text-slate-400">Historical performance across hypertrophy and zone 2 aerobic sessions</p>
            </div>
            <span className="text-xs text-[#34d399] font-medium font-mono">Streak: 4 Consecutive Weeks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#141822] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#ff6b4a]">Thu, May 8 · Yesterday</span>
                <span className="text-xs text-slate-400 font-mono">45 mins · 480 kcal</span>
              </div>
              <h4 className="text-base font-bold text-white">Posterior Chain & Deadlift Prep</h4>
              <p className="text-xs text-slate-400">Romanian deadlifts, Bulgarian split squats, hamstring curls</p>
              <div className="flex items-center gap-3 text-xs text-slate-300 pt-2 border-t border-white/[0.04]">
                <span className="flex items-center gap-1 text-[#34d399]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 4 exercises logged
                </span>
                <span>•</span>
                <span>Avg HR 138 bpm</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#141822] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#ff6b4a]">Wed, May 7</span>
                <span className="text-xs text-slate-400 font-mono">30 mins · 310 kcal</span>
              </div>
              <h4 className="text-base font-bold text-white">Zone 2 Aerobic Flush & Core</h4>
              <p className="text-xs text-slate-400">Stationary bike tempo + hollow holds and bird-dogs</p>
              <div className="flex items-center gap-3 text-xs text-slate-300 pt-2 border-t border-white/[0.04]">
                <span className="flex items-center gap-1 text-[#34d399]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </span>
                <span>•</span>
                <span>Recovery score 92%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
