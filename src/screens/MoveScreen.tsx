import React, { useState } from 'react';
import {
  Calendar,
  Dumbbell,
  History,
  Play,
  Clock,
  Sparkles,
  CheckCircle2,
  Flame,
  Search,
  ArrowRight,
  RotateCcw,
  Wind,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useApp, defaultMainWorkout, mobilityFlowWorkout, defaultExercises } from '../context/AppContext';
import { APP_IMAGES } from '../assets/images';

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
    settings,
  } = useApp();

  const [exerciseFilter, setExerciseFilter] = useState<'all' | 'upper' | 'lower' | 'core' | 'mobility'>('all');
  const [exerciseSearch, setExerciseSearch] = useState('');

  const daysOfWeek = [
    { day: 'Mon', date: 5, completed: false },
    { day: 'Tue', date: 6, completed: true },
    { day: 'Wed', date: 7, completed: true },
    { day: 'Thu', date: 8, completed: true },
    { day: 'Fri', date: 9, completed: false, isToday: true },
    { day: 'Sat', date: 10, completed: false },
    { day: 'Sun', date: 11, completed: false },
  ];

  // Comprehensive Exercise Library
  const exerciseLibrary = [
    {
      id: 'lib-squat',
      name: 'Bodyweight Deep Squats',
      category: 'lower',
      sets: 3,
      reps: '12-15 reps',
      image: APP_IMAGES.exerciseBodyweightSquat,
      muscles: ['Quadriceps', 'Glutes', 'Hip Flexors'],
      tips: 'Keep chest upright, push knees outwards over toes, and descend into comfortable full depth.',
    },
    {
      id: 'lib-thoracic',
      name: 'Thoracic Spine Twist',
      category: 'mobility',
      sets: 3,
      reps: '45s per side',
      image: APP_IMAGES.stretchThoracicTwist,
      muscles: ['Mid-Back', 'Rotators', 'Ribcage'],
      tips: 'Rotate through upper thoracic cage while keeping lumbar spine and pelvis stable.',
    },
    {
      id: 'lib-neck',
      name: 'Suboccipital Neck Release',
      category: 'mobility',
      sets: 2,
      reps: '60s hold',
      image: APP_IMAGES.stretchNeckRelease,
      muscles: ['Cervical Spine', 'Upper Traps'],
      tips: 'Gentle passive lateral tilt to reverse screen-gazing tech neck tension.',
    },
    {
      id: 'lib-hollow',
      name: 'Hollow Body Hold',
      category: 'core',
      sets: 3,
      reps: '30-45s hold',
      image: APP_IMAGES.exerciseHollowHold,
      muscles: ['Transverse Abdominis', 'Anterior Core'],
      tips: 'Press lower back completely flush against the floor, point toes, and brace core.',
    },
    {
      id: 'lib-plank',
      name: 'Plank Rotations',
      category: 'core',
      sets: 3,
      reps: '10 reps / side',
      image: APP_IMAGES.exercisePlankRotations,
      muscles: ['Obliques', 'Shoulders', 'Anti-Rotation'],
      tips: 'Maintain rigid spinal line from head to heels, rotate arm up, and pause at apex.',
    },
    {
      id: 'lib-dips',
      name: 'Bodyweight Tricep Dips',
      category: 'upper',
      sets: 3,
      reps: '12 reps',
      image: APP_IMAGES.exerciseTricepDips,
      muscles: ['Triceps Brachii', 'Pectorals', 'Anterior Delts'],
      tips: 'Use chair or bench edge, keep torso upright, and descend until elbows reach 90 degrees.',
    },
    {
      id: 'lib-db-press',
      name: 'Dumbbell Floor / Bench Press',
      category: 'upper',
      sets: 3,
      reps: '10-12 reps',
      image: APP_IMAGES.exerciseDbPress,
      muscles: ['Pectoralis Major', 'Anterior Delts', 'Triceps'],
      tips: 'Retract scapula, press with controlled 3-second descent, and drive to top.',
    },
  ];

  const filteredExercises = exerciseLibrary.filter((ex) => {
    const matchesCategory = exerciseFilter === 'all' || ex.category === exerciseFilter;
    const matchesSearch =
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      ex.muscles.some((m) => m.toLowerCase().includes(exerciseSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const weeklyTarget = settings?.weeklyWorkoutGoal || 5;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300 max-w-6xl mx-auto w-full">
      {/* 1. Header Bar & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Clean Segmented Tab Control */}
        <div className="flex items-center gap-1 p-1 bg-[#12151e] border border-white/5 rounded-xl self-start">
          <button
            onClick={() => setMoveSubTab('schedule')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              moveSubTab === 'schedule'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-rose-400" />
            <span>Weekly Schedule</span>
          </button>

          <button
            onClick={() => setMoveSubTab('exercises')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              moveSubTab === 'exercises'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
            <span>Exercise Library</span>
          </button>

          <button
            onClick={() => setMoveSubTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              moveSubTab === 'history'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5 text-emerald-400" />
            <span>Activity Log</span>
          </button>
        </div>

        {/* AI Custom Routine Builder CTA */}
        <button
          onClick={() => setShowCustomWorkoutBuilder(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs transition-all cursor-pointer shadow-sm self-start sm:self-auto active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>AI Workout Coach (Custom Routine)</span>
        </button>
      </div>

      {/* 2. Schedule Tab View */}
      {moveSubTab === 'schedule' && (
        <div className="space-y-6">
          {/* Minimalist Athletic Week Strip */}
          <div className="bg-[#10131b] border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">Weekly Movement Rhythm</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Consistent training rhythm with 48h full muscle recovery windows
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-400">
                  Weekly Goal:{' '}
                  <strong className="text-white font-mono">{completedWorkoutsCount}/{weeklyTarget}</strong>
                </span>
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {completedWorkoutsCount >= weeklyTarget ? 'Target Achieved' : 'On Track'}
                </span>
              </div>
            </div>

            {/* 7-day row */}
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((item) => {
                const isSelected = selectedDate === item.date;
                return (
                  <button
                    key={item.date}
                    onClick={() => setSelectedDate(item.date)}
                    className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500/15 border-rose-500/40 text-white shadow-sm'
                        : 'bg-[#151923] border-white/5 text-slate-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="text-[11px] font-medium text-slate-400">{item.day}</span>
                    <span className="text-base font-bold font-mono mt-0.5">{item.date}</span>
                    <div className="h-2 mt-1.5 flex items-center justify-center">
                      {item.completed && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Completed" />
                      )}
                      {item.isToday && !item.completed && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" title="Today" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Featured Workout Card */}
          <div className="bg-[#10131b] border border-white/[0.06] rounded-2xl p-6 sm:p-7 space-y-5 hover:border-white/10 transition-colors">
            {/* Top metadata */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="font-semibold text-rose-400">Today's Scheduled Session</span>
                <span aria-hidden="true">·</span>
                <span>{defaultMainWorkout.durationMin} min</span>
                <span aria-hidden="true">·</span>
                <span>{defaultMainWorkout.intensity} Intensity</span>
              </div>
              <span className="font-mono text-slate-400 text-[11px]">
                {defaultMainWorkout.exercises.length} Exercises
              </span>
            </div>

            {/* Title & description */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {defaultMainWorkout.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Hypertrophy and functional calisthenics sequence focusing on upper kinetic pushing power,
                scapular retraction, and rotational abdominal stability.
              </p>
            </div>

            {/* Exercise preview shelf (4 drills) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {defaultMainWorkout.exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="bg-[#151923] border border-white/5 rounded-xl p-3 flex flex-col justify-between space-y-3"
                >
                  <img
                    src={ex.image}
                    alt={ex.name}
                    className="w-full h-28 rounded-lg object-cover bg-[#1c2230]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white truncate">{ex.name}</h4>
                    <p className="text-[11px] font-mono text-rose-400 font-semibold mt-0.5">
                      {ex.sets} sets × {ex.repsOrDuration}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {ex.targetMuscles.join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Start Workout Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => startWorkout(defaultMainWorkout)}
                className="w-full sm:w-auto flex-1 py-3 px-6 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-all cursor-pointer active:scale-98"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Today's Workout</span>
              </button>

              <button
                onClick={() => setShowCustomWorkoutBuilder(true)}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Build with AI Coach</span>
              </button>
            </div>
          </div>

          {/* Quick Recovery & Mobility Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: 15-min Lower Body Mobility */}
            <div className="bg-[#10131b] border border-white/[0.06] rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-cyan-400 font-semibold">Recovery Flow</span>
                  <span aria-hidden="true">·</span>
                  <span>15 min</span>
                  <span aria-hidden="true">·</span>
                  <span>Light</span>
                </div>
                <h4 className="text-base font-bold text-white tracking-tight">
                  Post-Work Lower Body Mobility Flow
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Opens tight adductors, lengthens hip flexors, and decompresses the lumbar spine after prolonged sitting.
                </p>
              </div>

              <button
                onClick={() => startWorkout(mobilityFlowWorkout)}
                className="py-2.5 px-4 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Mobility Flow (15m)</span>
              </button>
            </div>

            {/* Card 2: 5-min Micro Recovery */}
            <div className="bg-[#10131b] border border-white/[0.06] rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-emerald-400 font-semibold">Micro-Break</span>
                  <span aria-hidden="true">·</span>
                  <span>5 min</span>
                  <span aria-hidden="true">·</span>
                  <span>Zero Equipment</span>
                </div>
                <h4 className="text-base font-bold text-white tracking-tight">
                  Desk Posture &amp; Spine Decompression
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Instant 3-stage protocol with tutorial visuals to release suboccipital neck tightness and restore posture.
                </p>
              </div>

              <button
                onClick={openMicroRecovery}
                className="py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start"
              >
                <Wind className="w-3.5 h-3.5" />
                <span>Start 5m Posture Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Exercise Library Tab */}
      {moveSubTab === 'exercises' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Search and Category Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                placeholder="Search drills by name or muscle group..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#10131b] border border-white/[0.06] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Muscle Group Filters */}
            <div className="flex items-center gap-1 p-1 bg-[#10131b] border border-white/[0.06] rounded-xl overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Drills' },
                { id: 'upper', label: 'Upper' },
                { id: 'lower', label: 'Lower' },
                { id: 'core', label: 'Core' },
                { id: 'mobility', label: 'Mobility' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setExerciseFilter(cat.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    exerciseFilter === cat.id
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((drill) => (
              <div
                key={drill.id}
                className="bg-[#10131b] border border-white/[0.06] rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-white/10 transition-colors"
              >
                <div className="space-y-3">
                  <img
                    src={drill.image}
                    alt={drill.name}
                    className="w-full h-40 rounded-xl object-cover bg-[#171d28]"
                  />
                  <div>
                    <div className="flex items-baseline justify-between">
                      <h4 className="text-sm font-bold text-white">{drill.name}</h4>
                      <span className="font-mono text-xs font-semibold text-rose-400">
                        {drill.sets} sets × {drill.reps}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{drill.tips}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">{drill.muscles.join(' · ')}</span>
                  <button
                    onClick={() =>
                      startWorkout({
                        id: `single-${drill.id}`,
                        title: `${drill.name} Focus Drill`,
                        durationMin: 10,
                        intensity: 'Moderate',
                        tags: [drill.category, 'Focus'],
                        exercises: [
                          {
                            id: drill.id,
                            name: drill.name,
                            sets: drill.sets,
                            repsOrDuration: drill.reps,
                            image: drill.image,
                            targetMuscles: drill.muscles,
                            tips: drill.tips,
                          },
                        ],
                      })
                    }
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    <span>Practice</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Activity Log Tab */}
      {moveSubTab === 'history' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Summary Metric Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#10131b] border border-white/[0.06] rounded-2xl p-5">
              <span className="text-xs text-slate-400">Total Workouts Completed</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {completedWorkoutsCount} <span className="text-sm font-sans font-normal text-slate-500">sessions</span>
              </div>
            </div>

            <div className="bg-[#10131b] border border-white/[0.06] rounded-2xl p-5">
              <span className="text-xs text-slate-400">Total Movement Time</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {totalMovementMinutes} <span className="text-sm font-sans font-normal text-slate-500">minutes</span>
              </div>
            </div>

            <div className="bg-[#10131b] border border-white/[0.06] rounded-2xl p-5">
              <span className="text-xs text-slate-400">Weekly Goal Progress</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {Math.round((completedWorkoutsCount / weeklyTarget) * 100)}%
              </div>
            </div>
          </div>

          {/* Session Timeline */}
          <div className="bg-[#10131b] border border-white/[0.06] rounded-2xl divide-y divide-white/[0.04]">
            <div className="p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Upper Body &amp; Core Power</h4>
                  <p className="text-[11px] text-slate-400">Yesterday at 04:30 PM · 35 min completed</p>
                </div>
              </div>
              <span className="font-mono text-xs text-emerald-400 font-semibold">+35 min</span>
            </div>

            <div className="p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Post-Work Lower Body Mobility Flow</h4>
                  <p className="text-[11px] text-slate-400">Wed May 7 · 15 min completed</p>
                </div>
              </div>
              <span className="font-mono text-xs text-emerald-400 font-semibold">+15 min</span>
            </div>

            <div className="p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Desk Posture &amp; Spinal Decompression</h4>
                  <p className="text-[11px] text-slate-400">Tue May 6 · 20 min completed</p>
                </div>
              </div>
              <span className="font-mono text-xs text-emerald-400 font-semibold">+20 min</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
