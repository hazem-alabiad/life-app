import React, { useState, useEffect } from 'react';
import { X, Check, Clock, ChevronRight, ChevronLeft, Dumbbell, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WorkoutSessionModal: React.FC = () => {
  const { activeWorkout, endWorkout } = useApp();
  const [currentExIndex, setCurrentExIndex] = useState<number>(0);
  const [completedSets, setCompletedSets] = useState<{ [key: string]: boolean[] }>({});
  const [restTimer, setRestTimer] = useState<number>(0);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    if (!activeWorkout) return;
    const initial: { [key: string]: boolean[] } = {};
    activeWorkout.exercises.forEach((ex) => {
      initial[ex.id] = new Array(ex.sets).fill(false);
    });
    setCompletedSets(initial);
    setCurrentExIndex(0);
    setIsFinished(false);
  }, [activeWorkout]);

  // Rest timer countdown
  useEffect(() => {
    if (!isResting || restTimer <= 0) return;
    const interval = setInterval(() => {
      setRestTimer((t) => {
        if (t <= 1) {
          setIsResting(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  if (!activeWorkout) return null;

  const currentExercise = activeWorkout.exercises[currentExIndex];
  const sets = completedSets[currentExercise.id] || [];

  const toggleSet = (index: number) => {
    const updated = [...sets];
    updated[index] = !updated[index];
    setCompletedSets((prev) => ({
      ...prev,
      [currentExercise.id]: updated,
    }));

    if (updated[index]) {
      // Start 45s rest timer
      setRestTimer(45);
      setIsResting(true);
    }
  };

  const handleFinish = () => {
    setIsFinished(true);
    setTimeout(() => {
      endWorkout();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#131720] border border-white/10 rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b4a]" />
            <h3 className="text-base font-bold text-white truncate">
              {activeWorkout.title}
            </h3>
          </div>
          <button
            onClick={endWorkout}
            className="w-8 h-8 rounded-full bg-[#1e2430] text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isFinished ? (
          <div className="p-8 text-center flex flex-col items-center justify-center my-auto space-y-4">
            <div className="w-20 h-20 rounded-full bg-[#ff6b4a]/20 border border-[#ff6b4a] flex items-center justify-center text-[#ff6b4a] animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">Session Completed!</h3>
            <p className="text-sm text-slate-300">
              {activeWorkout.durationMin} minutes of high-rhythm stimulus logged to your weekly
              metrics.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Exercise Photo Banner */}
            <div className="relative h-52 rounded-2xl overflow-hidden bg-[#1d222e]">
              <img
                src={currentExercise.image}
                alt={currentExercise.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131720] via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-[#ff6b4a] uppercase">
                    EXERCISE {currentExIndex + 1} OF {activeWorkout.exercises.length}
                  </span>
                  <h4 className="text-xl font-bold text-white drop-shadow">
                    {currentExercise.name}
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-black/60 text-white backdrop-blur-sm border border-white/10">
                  {currentExercise.repsOrDuration}
                </span>
              </div>
            </div>

            {/* Target Muscles */}
            <div className="flex flex-wrap gap-1.5">
              {currentExercise.targetMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="text-xs bg-[#1f2532] text-slate-300 px-2.5 py-1 rounded-md font-medium"
                >
                  {muscle}
                </span>
              ))}
            </div>

            {/* Form tips */}
            <p className="text-xs text-slate-300 bg-[#171c26] p-3 rounded-xl border border-white/[0.04] leading-relaxed">
              💡 {currentExercise.tips}
            </p>

            {/* Rest Timer Banner */}
            {isResting && restTimer > 0 && (
              <div className="p-3 rounded-xl bg-[#ff6b4a]/15 border border-[#ff6b4a]/30 flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#ff6b4a] animate-spin" />
                  <span>Rest interval active</span>
                </div>
                <span className="font-mono font-bold text-sm text-[#ff6b4a]">
                  {restTimer}s remaining
                </span>
              </div>
            )}

            {/* Sets Tracker Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Logged Sets
              </span>
              <div className="grid grid-cols-3 gap-2">
                {sets.map((done, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleSet(idx)}
                    className={`py-3 px-2 rounded-xl border text-center transition-all ${
                      done
                        ? 'bg-[#ff6b4a] border-[#ff6b4a] text-white'
                        : 'bg-[#1b202a] border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-medium block">Set {idx + 1}</span>
                    <span className="text-xs font-bold font-mono">
                      {done ? '✓ Done' : currentExercise.repsOrDuration}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={currentExIndex === 0}
                onClick={() => setCurrentExIndex((i) => i - 1)}
                className="px-3 py-2 rounded-xl bg-[#1b202a] text-xs font-medium text-slate-300 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentExIndex < activeWorkout.exercises.length - 1 ? (
                <button
                  onClick={() => setCurrentExIndex((i) => i + 1)}
                  className="px-4 py-2 rounded-xl bg-[#202634] text-xs font-semibold text-white flex items-center gap-1 cursor-pointer"
                >
                  <span>Next Exercise</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="px-5 py-2.5 rounded-xl bg-[#ff6b4a] hover:bg-[#ff5a36] text-xs font-bold text-white flex items-center gap-1 shadow-lg shadow-[#ff6b4a]/20 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Complete Session</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
