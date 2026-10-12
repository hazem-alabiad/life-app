import React, { useState } from 'react';
import {
  X,
  Plus,
  Check,
  Sparkles,
  Home,
  Clock,
  Target,
  Flame,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WorkoutSession, ExerciseItem } from '../types';
import { APP_IMAGES } from '../assets/images';

export const BuildWorkoutModal: React.FC = () => {
  const { showCustomWorkoutBuilder, setShowCustomWorkoutBuilder, startWorkout } = useApp();

  const [activeTab, setActiveTab] = useState<'questionnaire' | 'manual'>('questionnaire');

  // Questionnaire state
  const [goal, setGoal] = useState<'posture' | 'upper' | 'lower' | 'fullbody'>('posture');
  const [duration, setDuration] = useState<number>(15);
  const [fatiguePoint, setFatiguePoint] = useState<'neck' | 'hips' | 'lumbar' | 'stamina'>('neck');
  const [intensity, setIntensity] = useState<'Light' | 'Moderate' | 'High'>('Moderate');

  // Generated preview state
  const [generatedRoutine, setGeneratedRoutine] = useState<WorkoutSession | null>(null);

  // Manual builder state
  const [manualTitle, setManualTitle] = useState('');
  const [manualDuration, setManualDuration] = useState(20);
  const [manualIntensity, setManualIntensity] = useState<'Light' | 'Moderate' | 'High'>('Moderate');
  const [selectedDrills, setSelectedDrills] = useState<string[]>([
    'Bodyweight Deep Squats',
    'Thoracic Spine Twist',
    'Hollow Body Hold',
  ]);

  if (!showCustomWorkoutBuilder) return null;

  // Complete Zero-Equipment Home Calisthenics Exercise Catalog
  const homeExerciseCatalog: Record<string, ExerciseItem> = {
    'Bodyweight Deep Squats': {
      id: 'drill-squats',
      name: 'Bodyweight Deep Squats',
      sets: 3,
      repsOrDuration: '12-15 reps',
      image: APP_IMAGES.exerciseBodyweightSquat,
      targetMuscles: ['Quadriceps', 'Glutes', 'Hip Flexors'],
      tips: 'Keep chest upright, push knees out, and descend to full comfortable depth.',
    },
    'Thoracic Spine Twist': {
      id: 'drill-thoracic',
      name: 'Thoracic Spine Twist',
      sets: 3,
      repsOrDuration: '45 sec / side',
      image: APP_IMAGES.stretchThoracicTwist,
      targetMuscles: ['Mid-Back', 'Rotators', 'Ribcage'],
      tips: 'Open upper thoracic spine while keeping lumbar and pelvis stabilized.',
    },
    'Hollow Body Hold': {
      id: 'drill-hollow',
      name: 'Hollow Body Hold',
      sets: 3,
      repsOrDuration: '30-45 sec hold',
      image: APP_IMAGES.exerciseHollowHold,
      targetMuscles: ['Deep Core', 'Transverse Abdominis', 'Hip Flexors'],
      tips: 'Press lower back into mat, tuck chin, and point toes with tension.',
    },
    'Plank Rotations': {
      id: 'drill-plank-rot',
      name: 'Plank Rotations',
      sets: 3,
      repsOrDuration: '10 reps / side',
      image: APP_IMAGES.exercisePlankRotations,
      targetMuscles: ['Obliques', 'Shoulders', 'Anti-Rotation Core'],
      tips: 'Rotate torso smoothly with controlled tempo. Pause 1 second at apex.',
    },
    'Bodyweight Tricep Dips': {
      id: 'drill-dips',
      name: 'Bodyweight Tricep Dips (Chair/Floor)',
      sets: 3,
      repsOrDuration: '12 reps',
      image: APP_IMAGES.exerciseTricepDips,
      targetMuscles: ['Triceps', 'Anterior Deltoids'],
      tips: 'Use chair or couch edge, lower until elbows reach 90 degrees.',
    },
    'Suboccipital Neck Release': {
      id: 'drill-neck',
      name: 'Suboccipital Neck Release',
      sets: 2,
      repsOrDuration: '60 sec',
      image: APP_IMAGES.stretchNeckRelease,
      targetMuscles: ['Upper Traps', 'Cervical Spine'],
      tips: 'Gentle passive lateral stretch to decompress screen-gazing tech neck.',
    },
  };

  const generateFromQuestionnaire = () => {
    let title = '';
    let selectedKeys: string[] = [];

    if (goal === 'posture') {
      title = 'Desk Posture & Spinal Decompression (Zero Equipment)';
      selectedKeys = ['Thoracic Spine Twist', 'Suboccipital Neck Release', 'Hollow Body Hold', 'Bodyweight Deep Squats'];
    } else if (goal === 'upper') {
      title = 'Upper Body & Core Calisthenics (Home)';
      selectedKeys = ['Bodyweight Tricep Dips', 'Plank Rotations', 'Hollow Body Hold', 'Thoracic Spine Twist'];
    } else if (goal === 'lower') {
      title = 'Lower Body Mobility & Air Squat Power (Home)';
      selectedKeys = ['Bodyweight Deep Squats', 'Hollow Body Hold', 'Thoracic Spine Twist'];
    } else {
      title = 'Full-Body Metabolic Flow (Zero Equipment)';
      selectedKeys = ['Bodyweight Deep Squats', 'Plank Rotations', 'Bodyweight Tricep Dips', 'Hollow Body Hold'];
    }

    // Add specific corrective drill based on fatigue point
    if (fatiguePoint === 'neck' && !selectedKeys.includes('Suboccipital Neck Release')) {
      selectedKeys.push('Suboccipital Neck Release');
    }

    const routine: WorkoutSession = {
      id: `custom-home-${Date.now()}`,
      title,
      durationMin: duration,
      intensity,
      tags: ['100% Home', 'Zero Equipment', 'Custom Tailored'],
      exercises: selectedKeys.map((k) => homeExerciseCatalog[k]).filter(Boolean),
    };

    setGeneratedRoutine(routine);
  };

  const handleLaunchGenerated = () => {
    if (generatedRoutine) {
      setShowCustomWorkoutBuilder(false);
      startWorkout(generatedRoutine);
    }
  };

  const handleLaunchManual = () => {
    const routine: WorkoutSession = {
      id: `custom-manual-${Date.now()}`,
      title: manualTitle.trim() || 'Custom Home Bodyweight Routine',
      durationMin: manualDuration,
      intensity: manualIntensity,
      tags: ['Home Bodyweight', 'Zero Equipment'],
      exercises: selectedDrills.map((k) => homeExerciseCatalog[k]).filter(Boolean),
    };

    setShowCustomWorkoutBuilder(false);
    startWorkout(routine);
  };

  const toggleManualDrill = (key: string) => {
    if (selectedDrills.includes(key)) {
      if (selectedDrills.length > 1) {
        setSelectedDrills(selectedDrills.filter((k) => k !== key));
      }
    } else {
      setSelectedDrills([...selectedDrills, key]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#11141c] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ff6b4a]/15 text-[#ff6b4a] flex items-center justify-center">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Home Routine Architect
              </h3>
              <p className="text-xs text-slate-400">100% Bodyweight • Zero Equipment Required</p>
            </div>
          </div>
          <button
            onClick={() => setShowCustomWorkoutBuilder(false)}
            className="w-8 h-8 rounded-full bg-[#1b202a] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Builder Mode Switcher */}
        <div className="flex p-1 rounded-xl bg-[#161a24] border border-white/5">
          <button
            onClick={() => {
              setActiveTab('questionnaire');
              setGeneratedRoutine(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'questionnaire'
                ? 'bg-[#1e2536] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#34d399]" />
            <span>Smart Questionnaire</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-[#1e2536] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Manual Drill Picker</span>
          </button>
        </div>

        {/* Tab 1: Smart Questionnaire Flow */}
        {activeTab === 'questionnaire' && (
          <div className="space-y-4">
            {!generatedRoutine ? (
              <>
                {/* Question 1: Primary Goal */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    1. Primary Bodyweight Objective
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'posture', label: 'Desk Posture Reset', desc: 'Spine decompression & chest opening' },
                      { id: 'upper', label: 'Upper Body & Core', desc: 'Tricep dips, hollow holds, plank twists' },
                      { id: 'lower', label: 'Lower Body & Mobility', desc: 'Deep air squats, hip capsules' },
                      { id: 'fullbody', label: 'Full-Body Flow', desc: 'Metabolic calisthenic sequence' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setGoal(item.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          goal === item.id
                            ? 'bg-[#182333] border-[#34d399] text-white'
                            : 'bg-[#151923] border-white/5 text-slate-300 hover:bg-[#1a202c]'
                        }`}
                      >
                        <span className="text-xs font-bold block">{item.label}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2: Duration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    2. Available Duration
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 15, 25, 35].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDuration(mins)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer ${
                          duration === mins
                            ? 'bg-[#182333] border-[#22d3ee] text-[#22d3ee]'
                            : 'bg-[#151923] border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 3: Desk Fatigue Point */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    3. Target Fatigue / Pain Point
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'neck', label: '🖥️ Tech Neck & Traps' },
                      { id: 'hips', label: '🪑 Tight Hips & Pelvis' },
                      { id: 'lumbar', label: '💼 Lower Back Tension' },
                      { id: 'stamina', label: '⚡ Whole-Body Lethargy' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFatiguePoint(item.id as any)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                          fatiguePoint === item.id
                            ? 'bg-[#182333] border-[#34d399] text-white'
                            : 'bg-[#151923] border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 4: Intensity */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    4. Impact & Intensity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Light', 'Moderate', 'High'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setIntensity(lvl)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          intensity === lvl
                            ? 'bg-[#182333] border-[#ff6b4a] text-[#ff6b4a]'
                            : 'bg-[#151923] border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lvl === 'Light' ? 'Gentle Flow' : lvl === 'Moderate' ? 'Moderate Tone' : 'Athletic Burn'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateFromQuestionnaire}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#34d399] to-[#22d3ee] text-[#052814] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#34d399]/20 hover:opacity-95 transition-opacity"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Generate 100% Home Bodyweight Routine</span>
                </button>
              </>
            ) : (
              /* Generated Routine Preview */
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-3.5 rounded-xl bg-[#16202c] border border-[#34d399]/30 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#34d399] block font-mono">
                    CUSTOM HOME CALISTHENICS ROUTINE GENERATED
                  </span>
                  <h4 className="text-base font-bold text-white">{generatedRoutine.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-mono pt-0.5">
                    <span>⏱️ {generatedRoutine.durationMin} mins</span>
                    <span>•</span>
                    <span>🔥 {generatedRoutine.intensity} Intensity</span>
                    <span>•</span>
                    <span>🤸 {generatedRoutine.exercises.length} Zero-Equipment Drills</span>
                  </div>
                </div>

                {/* Drill preview cards with images */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                  {generatedRoutine.exercises.map((drill, idx) => (
                    <div
                      key={drill.id}
                      className="p-2.5 rounded-xl bg-[#141822] border border-white/5 flex items-center gap-3"
                    >
                      <img
                        src={drill.image}
                        alt={drill.name}
                        className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-white block truncate">
                          {idx + 1}. {drill.name}
                        </span>
                        <span className="text-[11px] text-cyan-300 font-mono block">
                          {drill.sets} sets • {drill.repsOrDuration}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setGeneratedRoutine(null)}
                    className="py-2.5 px-3 rounded-xl bg-[#1a202c] hover:bg-[#222a3a] border border-white/10 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-Customize</span>
                  </button>

                  <button
                    onClick={handleLaunchGenerated}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#34d399] hover:bg-[#2fd094] text-[#052814] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-[#34d399]/20"
                  >
                    <span>Start Routine Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Manual Drill Picker */}
        {activeTab === 'manual' && (
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Routine Title
              </label>
              <input
                type="text"
                placeholder="e.g. Living Room Bodyweight Flow"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#161a25] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Duration (mins)
                </label>
                <input
                  type="number"
                  value={manualDuration}
                  onChange={(e) => setManualDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#161a25] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Intensity
                </label>
                <select
                  value={manualIntensity}
                  onChange={(e) => setManualIntensity(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#161a25] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Light">Light</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {/* Select Drills */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Choose Home Bodyweight Drills ({selectedDrills.length} selected)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                {Object.keys(homeExerciseCatalog).map((name) => {
                  const drill = homeExerciseCatalog[name];
                  const isSelected = selectedDrills.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleManualDrill(name)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#182333] border-[#34d399]'
                          : 'bg-[#141822] border-white/5 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={drill.image}
                        alt={drill.name}
                        className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold text-white block truncate">
                          {drill.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {drill.targetMuscles[0]}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#34d399] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleLaunchManual}
              className="w-full py-2.5 rounded-xl bg-[#34d399] hover:bg-[#2fd094] text-[#052814] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
            >
              <span>Launch Custom Workout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
