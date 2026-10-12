import React, { useState } from 'react';
import {
  X,
  Plus,
  Check,
  Sparkles,
  Clock,
  Target,
  Flame,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  Dumbbell,
  AlertCircle,
  Play,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WorkoutSession, ExerciseItem } from '../types';
import { APP_IMAGES } from '../assets/images';

export const BuildWorkoutModal: React.FC = () => {
  const { showCustomWorkoutBuilder, setShowCustomWorkoutBuilder, startWorkout } = useApp();

  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');

  // Questionnaire state
  const [goal, setGoal] = useState<'posture' | 'upper' | 'lower' | 'fullbody' | 'core'>('posture');
  const [duration, setDuration] = useState<number>(20);
  const [fatiguePoint, setFatiguePoint] = useState<'neck' | 'lumbar' | 'hips' | 'shoulders' | 'none'>('neck');
  const [intensity, setIntensity] = useState<'Light' | 'Moderate' | 'High'>('Moderate');
  const [userNotes, setUserNotes] = useState<string>('');

  // AI loading and result state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [generatedRoutine, setGeneratedRoutine] = useState<WorkoutSession | null>(null);

  // Manual builder state
  const [manualTitle, setManualTitle] = useState('My Custom Calisthenics Routine');
  const [manualDuration, setManualDuration] = useState(20);
  const [selectedDrills, setSelectedDrills] = useState<string[]>([
    'Bodyweight Deep Squats',
    'Thoracic Spine Twist',
    'Hollow Body Hold',
  ]);

  if (!showCustomWorkoutBuilder) return null;

  // Complete Zero-Equipment Catalog with Real Visual Assets
  const homeCatalog: Record<string, ExerciseItem> = {
    'Thoracic Spine Twist': {
      id: 'drill-thoracic',
      name: 'Thoracic Spine Twist',
      sets: 3,
      repsOrDuration: '45s each side',
      image: APP_IMAGES.stretchThoracicTwist,
      targetMuscles: ['Mid-Back', 'Rotators', 'Ribcage'],
      tips: 'Open upper thoracic spine while keeping lumbar and pelvis stabilized.',
    },
    'Suboccipital Neck Release': {
      id: 'drill-neck',
      name: 'Suboccipital Neck Release',
      sets: 2,
      repsOrDuration: '60s hold',
      image: APP_IMAGES.stretchNeckRelease,
      targetMuscles: ['Cervical Spine', 'Upper Trapezius'],
      tips: 'Gentle passive lateral tilt to decompress tech-neck tension.',
    },
    'Bodyweight Deep Squats': {
      id: 'drill-squats',
      name: 'Bodyweight Deep Squats',
      sets: 3,
      repsOrDuration: '12-15 reps',
      image: APP_IMAGES.exerciseBodyweightSquat,
      targetMuscles: ['Quadriceps', 'Glutes', 'Hip Flexors'],
      tips: 'Keep chest upright, push knees outwards, and sink into full depth.',
    },
    'Hollow Body Hold': {
      id: 'drill-hollow',
      name: 'Hollow Body Hold',
      sets: 3,
      repsOrDuration: '30-45s hold',
      image: APP_IMAGES.exerciseHollowHold,
      targetMuscles: ['Deep Core', 'Transverse Abdominis', 'Hip Flexors'],
      tips: 'Press lower back flush against the ground, point toes and engage abs.',
    },
    'Plank Rotations': {
      id: 'drill-plank',
      name: 'Plank Rotations',
      sets: 3,
      repsOrDuration: '10 reps / side',
      image: APP_IMAGES.exercisePlankRotations,
      targetMuscles: ['Obliques', 'Shoulders', 'Rotational Stability'],
      tips: 'Rotate torso smoothly with control. Pause 1 second at apex.',
    },
    'Bodyweight Tricep Dips': {
      id: 'drill-dips',
      name: 'Bodyweight Tricep Dips',
      sets: 3,
      repsOrDuration: '12 reps',
      image: APP_IMAGES.exerciseTricepDips,
      targetMuscles: ['Triceps Brachii', 'Anterior Delts', 'Pectorals'],
      tips: 'Use chair or couch edge, lower until elbows reach 90 degrees.',
    },
  };

  // Find suitable image from catalog for any exercise name
  const resolveExerciseImage = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('neck') || lower.includes('trap')) return APP_IMAGES.stretchNeckRelease;
    if (lower.includes('twist') || lower.includes('thoracic') || lower.includes('spine')) return APP_IMAGES.stretchThoracicTwist;
    if (lower.includes('squat') || lower.includes('lunge') || lower.includes('leg')) return APP_IMAGES.exerciseBodyweightSquat;
    if (lower.includes('hollow') || lower.includes('core') || lower.includes('abs')) return APP_IMAGES.exerciseHollowHold;
    if (lower.includes('plank') || lower.includes('rotation') || lower.includes('oblique')) return APP_IMAGES.exercisePlankRotations;
    if (lower.includes('dip') || lower.includes('push') || lower.includes('tricep') || lower.includes('arm')) return APP_IMAGES.exerciseTricepDips;
    return APP_IMAGES.exerciseBodyweightSquat;
  };

  // Generate with Gemini AI
  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          durationMin: duration,
          fatiguePoint,
          intensity,
          equipment: 'Zero Equipment (Home Only)',
          notes: userNotes,
        }),
      });

      if (!res.ok) throw new Error('AI Coach service unavailable');
      const data = await res.json();
      const rawWorkout = data.workout || {};

      // Enrich exercises with images
      const exercises: ExerciseItem[] = (rawWorkout.exercises || []).map((ex: any, idx: number) => ({
        id: `ai-ex-${idx}-${Date.now()}`,
        name: ex.name || `Exercise ${idx + 1}`,
        sets: Number(ex.sets) || 3,
        repsOrDuration: ex.repsOrDuration || '12 reps',
        targetMuscles: Array.isArray(ex.targetMuscles) ? ex.targetMuscles : ['Core', 'Full Body'],
        tips: ex.tips || 'Move with controlled cadence and diaphragmatic breath.',
        image: resolveExerciseImage(ex.name || ''),
      }));

      const finalWorkout: WorkoutSession = {
        id: `ai-routine-${Date.now()}`,
        title: rawWorkout.title || 'Personalized AI Home Routine',
        durationMin: Number(rawWorkout.durationMin) || duration,
        intensity: rawWorkout.intensity || intensity,
        tags: Array.isArray(rawWorkout.tags) ? rawWorkout.tags : ['Home', 'Zero Equipment'],
        exercises: exercises.length > 0 ? exercises : Object.values(homeCatalog).slice(0, 4),
        suggestedBy: 'AI Biomechanics Coach (Gemini)',
      };

      setGeneratedRoutine(finalWorkout);
    } catch (err: any) {
      console.warn('AI Generation fallback:', err);
      // Fallback routine
      const fallbackList =
        goal === 'posture'
          ? [homeCatalog['Thoracic Spine Twist'], homeCatalog['Suboccipital Neck Release'], homeCatalog['Hollow Body Hold']]
          : [homeCatalog['Bodyweight Deep Squats'], homeCatalog['Plank Rotations'], homeCatalog['Bodyweight Tricep Dips'], homeCatalog['Hollow Body Hold']];

      setGeneratedRoutine({
        id: `routine-fallback-${Date.now()}`,
        title: 'Custom Restorative Home Routine',
        durationMin: duration,
        intensity,
        tags: ['Home', 'Zero Equipment', goal],
        exercises: fallbackList,
        suggestedBy: 'Personal Coach',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartRoutine = (workout: WorkoutSession) => {
    startWorkout(workout);
    setShowCustomWorkoutBuilder(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0e1118] border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                AI Custom Routine Architect
              </h3>
              <p className="text-xs text-slate-400">
                Zero equipment home routines tailored to your fatigue and time
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCustomWorkoutBuilder(false)}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch: AI Coach Questionnaire vs Manual Builder */}
        <div className="flex p-1 rounded-xl bg-[#141824] border border-white/5">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Coach Questionnaire</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Manual Drill Picker</span>
          </button>
        </div>

        {/* AI Questionnaire Mode */}
        {activeTab === 'ai' && !generatedRoutine && (
          <div className="space-y-5">
            {/* Question 1: Goal */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                1. What is your primary objective today?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'posture', label: 'Spine & Posture Reset', sub: 'Reverse desk slouch' },
                  { id: 'upper', label: 'Upper Body Power', sub: 'Push & pull calisthenics' },
                  { id: 'lower', label: 'Lower Mobility & Legs', sub: 'Squat depth & hips' },
                  { id: 'fullbody', label: 'Full-Body Metabolic', sub: 'Total kinetic flow' },
                  { id: 'core', label: 'Core & Anti-Rotation', sub: 'Deep abdominal brace' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGoal(item.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      goal === item.id
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm'
                        : 'bg-[#151924] border-white/5 text-slate-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Duration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-300 uppercase tracking-wider">
                  2. Session Time Available
                </label>
                <span className="font-mono font-bold text-emerald-400 text-sm">{duration} min</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[10, 15, 20, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`py-2 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
                      duration === mins
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-[#151924] border border-white/5 text-slate-300 hover:text-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3: Fatigue Spot */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                3. Where do you feel tightness or fatigue right now?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'neck', label: 'Neck & Upper Traps', cue: 'Tech-neck & screen strain' },
                  { id: 'lumbar', label: 'Lower Back / Lumbar', cue: 'Compressed seated spine' },
                  { id: 'hips', label: 'Tight Hip Flexors', cue: 'Shortened from sitting' },
                  { id: 'shoulders', label: 'Shoulders & Chest', cue: 'Forward rounded shoulders' },
                  { id: 'none', label: 'Feeling Fresh / None', cue: 'Ready for full output' },
                ].map((spot) => (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => setFatiguePoint(spot.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      fatiguePoint === spot.id
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-[#151924] border-white/5 text-slate-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{spot.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{spot.cue}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 4: Intensity */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                4. Intensity Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { level: 'Light', label: 'Light Recovery', desc: 'Breathing & mobility' },
                  { level: 'Moderate', label: 'Moderate', desc: 'Cardio-strength balance' },
                  { level: 'High', label: 'High Energy', desc: 'Metabolic burn' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setIntensity(item.level as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      intensity === item.level
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-[#151924] border-white/5 text-slate-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Context */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
                <span>Specific notes for the AI coach (optional)</span>
                <span className="text-[10px] text-slate-500">e.g. wrist discomfort, sat for 8h</span>
              </label>
              <input
                type="text"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="e.g. Sat in back-to-back meetings, need to open my chest and hips"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400/50"
              />
            </div>

            {/* Action button */}
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Custom Routine with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Generate Personalized Routine with AI</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* AI Routine Preview */}
        {activeTab === 'ai' && generatedRoutine && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Routine Header */}
            <div className="p-4 rounded-2xl bg-[#141824] border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  {generatedRoutine.suggestedBy || 'AI Coach Routine'}
                </span>
                <span className="font-mono text-slate-400">
                  {generatedRoutine.durationMin} min · {generatedRoutine.intensity}
                </span>
              </div>

              <h4 className="text-lg font-bold text-white tracking-tight">
                {generatedRoutine.title}
              </h4>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {generatedRoutine.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded-md bg-white/5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Exercise Drills List */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Curated Drills ({generatedRoutine.exercises.length})
              </label>

              <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar pr-1">
                {generatedRoutine.exercises.map((ex, idx) => (
                  <div
                    key={ex.id || idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#141824] border border-white/5"
                  >
                    <img
                      src={ex.image}
                      alt={ex.name}
                      className="w-16 h-16 rounded-lg object-cover shrink-0 bg-[#202735]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h5 className="text-xs font-bold text-white truncate">{ex.name}</h5>
                        <span className="font-mono text-xs font-semibold text-emerald-400 shrink-0">
                          {ex.sets} sets × {ex.repsOrDuration}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {ex.tips}
                      </p>
                      <div className="text-[10px] text-slate-500 font-medium mt-1">
                        Targets: {ex.targetMuscles.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setGeneratedRoutine(null)}
                className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Change Answers</span>
              </button>

              <button
                type="button"
                onClick={() => handleStartRoutine(generatedRoutine)}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start This Workout Now</span>
              </button>
            </div>
          </div>
        )}

        {/* Manual Builder Mode */}
        {activeTab === 'manual' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Routine Title</label>
              <input
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Select Drills from Catalog
              </label>
              <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
                {Object.values(homeCatalog).map((ex) => {
                  const isSelected = selectedDrills.includes(ex.name);
                  return (
                    <div
                      key={ex.id}
                      onClick={() =>
                        setSelectedDrills((prev) =>
                          isSelected ? prev.filter((n) => n !== ex.name) : [...prev, ex.name]
                        )
                      }
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                          : 'bg-[#141824] border-white/5 text-slate-400 hover:bg-white/[0.03]'
                      }`}
                    >
                      <img
                        src={ex.image}
                        alt={ex.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white">{ex.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {ex.sets} sets × {ex.repsOrDuration}
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-emerald-500 text-slate-950 font-bold' : 'border border-white/10'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                const exercises = selectedDrills
                  .map((n) => homeCatalog[n])
                  .filter(Boolean);
                handleStartRoutine({
                  id: `manual-routine-${Date.now()}`,
                  title: manualTitle,
                  durationMin: manualDuration,
                  intensity: 'Moderate',
                  tags: ['Custom', 'Home Calisthenics'],
                  exercises,
                  suggestedBy: 'Custom Routine',
                });
              }}
              disabled={selectedDrills.length === 0}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Custom Workout ({selectedDrills.length} drills)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
