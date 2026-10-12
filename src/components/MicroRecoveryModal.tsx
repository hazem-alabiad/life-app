import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Check, Heart, Eye, Sparkles, Wind } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { APP_IMAGES } from '../assets/images';

export const MicroRecoveryModal: React.FC = () => {
  const { activeMicroRecovery, closeMicroRecovery } = useApp();

  const stretchSteps = [
    {
      title: 'Suboccipital & Upper Trapezius Release',
      duration: 60,
      image: APP_IMAGES.stretchNeckRelease,
      cues: 'Gently tilt left ear toward left shoulder. Place hand gently on head for passive weight without pulling. Breathe into right upper trap.',
      target: 'Neck & Cervical Spine',
      breathing: 'Inhale 4s • Exhale 6s slowly',
    },
    {
      title: 'Thoracic Spine Extension & Rotation',
      duration: 75,
      image: APP_IMAGES.stretchThoracicTwist,
      cues: 'From all fours or seated, reach one arm upward toward the ceiling, rotating through mid-back. Keep pelvis neutral and gaze toward the top hand.',
      target: 'Mid-Back & Ribcage',
      breathing: 'Expand ribcage on rotation',
    },
    {
      title: 'Deep Bodyweight Squat & Hip Decompression',
      duration: 90,
      image: APP_IMAGES.exerciseBodyweightSquat,
      cues: 'Descend into a deep comfortable air squat. Press elbows gently against knees to open adductors. Lengthen spine and breathe into pelvis.',
      target: 'Hip Flexors & Glutes',
      breathing: 'Belly breathing • Deep pelvic floor release',
    },
    {
      title: 'Hollow Core Alignment & Lumbar Flattening',
      duration: 60,
      image: APP_IMAGES.exerciseHollowHold,
      cues: 'Lie flat, press lower back completely into mat. Engage transverse abdominis to neutralize anterior pelvic tilt from long sitting.',
      target: 'Anterior Core & Lumbar Spine',
      breathing: 'Steady rhythmic diaphragmatic breath',
    },
  ];

  const [stepIndex, setStepIndex] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(stretchSteps[0].duration);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showLargeTutorial, setShowLargeTutorial] = useState<boolean>(false);

  useEffect(() => {
    if (!activeMicroRecovery) {
      setStepIndex(0);
      setSecondsLeft(stretchSteps[0].duration);
      setIsRunning(true);
      setIsCompleted(false);
      setShowLargeTutorial(false);
      return;
    }
  }, [activeMicroRecovery]);

  useEffect(() => {
    if (!activeMicroRecovery || !isRunning || isCompleted) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (stepIndex < stretchSteps.length - 1) {
            setStepIndex((s) => s + 1);
            return stretchSteps[stepIndex + 1].duration;
          } else {
            setIsCompleted(true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeMicroRecovery, isRunning, stepIndex, isCompleted]);

  if (!activeMicroRecovery) return null;

  const currentStep = stretchSteps[stepIndex];
  const progressPercent = Math.round(
    ((currentStep.duration - secondsLeft) / currentStep.duration) * 100
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#11151f] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34d399] animate-pulse" />
            <h3 className="text-base font-bold text-white">Desk Mobility & Spinal Reset</h3>
          </div>
          <button
            onClick={closeMicroRecovery}
            className="w-8 h-8 rounded-full bg-[#1b212e] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isCompleted ? (
          <div className="py-8 text-center space-y-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#34d399]/20 border border-[#34d399] flex items-center justify-center text-[#34d399]">
              <Heart className="w-8 h-8 fill-current" />
            </div>
            <h4 className="text-xl font-bold text-white">Spinal Tension Reset Complete</h4>
            <p className="text-xs text-slate-300 max-w-xs">
              Decompression achieved. Neural pathway fatigue cleared for your next deep focus block.
            </p>
            <button
              onClick={closeMicroRecovery}
              className="px-6 py-2.5 rounded-xl bg-[#34d399] text-[#032a13] font-bold text-xs cursor-pointer shadow-lg hover:bg-[#2fd094] transition-colors"
            >
              Return to Rhythm
            </button>
          </div>
        ) : (
          <>
            {/* Step Counter & Target Badge */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#34d399] font-mono">
                DRILL {stepIndex + 1} OF {stretchSteps.length}
              </span>
              <span className="bg-[#192231] px-2.5 py-1 rounded-full text-[11px] text-[#22d3ee] border border-[#22d3ee]/20 font-medium">
                {currentStep.target}
              </span>
            </div>

            {/* Visual Tutorial Demonstration Photo / Card (Just like the workout!) */}
            <div className="relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden bg-[#0a0d14] border border-white/10 group">
              <img
                src={currentStep.image}
                alt={currentStep.title}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e17] via-transparent to-black/30 pointer-events-none" />

              {/* Form Guide Tag */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                <Sparkles className="w-3 h-3 text-[#34d399]" />
                <span>FORM TUTORIAL</span>
              </div>

              {/* Breathing Cadence Tag */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-xs text-slate-200 border border-white/10">
                  <Wind className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-[11px] font-mono">{currentStep.breathing}</span>
                </div>
              </div>
            </div>

            {/* Current Step Title & Physical Therapy Cue */}
            <div className="space-y-1.5">
              <h4 className="text-base sm:text-lg font-bold text-white leading-tight">
                {currentStep.title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#161c28] p-3 rounded-xl border border-white/5">
                {currentStep.cues}
              </p>
            </div>

            {/* Circular Timer Visual & Progress */}
            <div className="flex flex-col items-center justify-center py-1">
              <div className="text-4xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                0:{secondsLeft.toString().padStart(2, '0')}
              </div>
              <div className="w-full h-2 bg-[#1b2230] rounded-full overflow-hidden mt-2.5">
                <div
                  className="h-full bg-gradient-to-r from-[#34d399] to-[#22d3ee] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => setSecondsLeft(currentStep.duration)}
                className="w-10 h-10 rounded-xl bg-[#1a202c] hover:bg-[#232b3b] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/5"
                title="Restart Drill"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex-1 py-3 px-5 rounded-xl bg-[#34d399] hover:bg-[#2fd094] text-[#052814] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-[#34d399]/20"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause Drill</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Resume Drill</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (stepIndex < stretchSteps.length - 1) {
                    setStepIndex((s) => s + 1);
                    setSecondsLeft(stretchSteps[stepIndex + 1].duration);
                  } else {
                    setIsCompleted(true);
                  }
                }}
                className="px-4 py-3 rounded-xl bg-[#1a202c] hover:bg-[#232b3b] text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer border border-white/5 transition-colors"
              >
                <span>Next</span>
                <Check className="w-3.5 h-3.5 text-[#34d399]" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
