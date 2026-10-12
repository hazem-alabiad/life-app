import React, { useState } from 'react';
import { X, Camera, Sparkles, Check, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { APP_IMAGES } from '../assets/images';

export const SnapMealModal: React.FC = () => {
  const { showSnapMealModal, setShowSnapMealModal, addMeal } = useApp();
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analyzedResult, setAnalyzedResult] = useState<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    insight: string;
    image: string;
  } | null>(null);

  if (!showSnapMealModal) return null;

  const presets = [
    {
      name: 'Wild Salmon & Quinoa Bowl',
      calories: 640,
      protein: 42,
      carbs: 55,
      fat: 18,
      mealType: 'Lunch' as const,
      image: APP_IMAGES.mealSalmonBowl,
      insight: 'High protein and omega-3s. Good sustained energy for afternoon focus sessions. Remember to hydrate with 500ml water.',
    },
    {
      name: 'Sourdough Avocado & Poached Eggs',
      calories: 520,
      protein: 24,
      carbs: 45,
      fat: 26,
      mealType: 'Breakfast' as const,
      image: APP_IMAGES.mealSalmonBowl,
      insight: 'Choline from pastured egg yolks stimulates acetylcholine production, boosting neurotransmitter efficiency.',
    },
    {
      name: 'Grass-Fed Sirloin & Roasted Roots',
      calories: 710,
      protein: 48,
      carbs: 42,
      fat: 22,
      mealType: 'Dinner' as const,
      image: APP_IMAGES.mealSalmonBowl,
      insight: 'Bio-available iron and creatine aid nocturnal cellular repair and glycogen restoration.',
    },
  ];

  const handleSelectPreset = (preset: typeof presets[0]) => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzedResult(preset);
    }, 1200);
  };

  const handleSaveMeal = () => {
    if (!analyzedResult) return;
    addMeal({
      name: analyzedResult.name,
      mealType: analyzedResult.mealType,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calories: analyzedResult.calories,
      protein: analyzedResult.protein,
      carbs: analyzedResult.carbs,
      fat: analyzedResult.fat,
      image: analyzedResult.image,
      mindfulInsight: analyzedResult.insight,
    });
    setAnalyzedResult(null);
    setShowSnapMealModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#131720] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
            <h3 className="text-base font-bold text-white">Smart Meal Scanner</h3>
          </div>
          <button
            onClick={() => {
              setAnalyzedResult(null);
              setShowSnapMealModal(false);
            }}
            className="w-8 h-8 rounded-full bg-[#1e2430] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {analyzing ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-[#34d399]/20 border-t-[#34d399] animate-spin" />
              <Camera className="w-8 h-8 text-[#34d399]" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Mindful Macro Vision</h4>
              <p className="text-xs text-slate-400 mt-1">
                Decomposing ingredients, caloric density & biofeedback...
              </p>
            </div>
          </div>
        ) : analyzedResult ? (
          <div className="space-y-4">
            <div className="relative h-44 rounded-2xl overflow-hidden">
              <img
                src={analyzedResult.image}
                alt={analyzedResult.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131720] via-transparent to-transparent" />
              <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#34d399] uppercase tracking-wider">
                    RECOGNIZED MEAL
                  </span>
                  <h4 className="text-base font-bold text-white drop-shadow">
                    {analyzedResult.name}
                  </h4>
                </div>
                <span className="text-base font-bold text-[#34d399] font-mono">
                  {analyzedResult.calories} kcal
                </span>
              </div>
            </div>

            {/* Macro Breakdown */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-[#1b202a] border border-white/5 text-center">
                <span className="text-[10px] text-slate-400 block">Protein</span>
                <span className="text-sm font-bold text-[#ff6b4a] font-mono">
                  {analyzedResult.protein}g
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1b202a] border border-white/5 text-center">
                <span className="text-[10px] text-slate-400 block">Carbs</span>
                <span className="text-sm font-bold text-[#22d3ee] font-mono">
                  {analyzedResult.carbs}g
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1b202a] border border-white/5 text-center">
                <span className="text-[10px] text-slate-400 block">Fats</span>
                <span className="text-sm font-bold text-[#34d399] font-mono">
                  {analyzedResult.fat}g
                </span>
              </div>
            </div>

            {/* Mindful biofeedback */}
            <div className="p-3.5 rounded-xl bg-[#171c26] border border-white/[0.04] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#34d399]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rhythmic Biofeedback</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {analyzedResult.insight}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setAnalyzedResult(null)}
                className="py-3 px-4 rounded-xl bg-[#1b202a] text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <button
                onClick={handleSaveMeal}
                className="flex-1 py-3 px-4 rounded-xl bg-[#34d399] hover:bg-[#2fd094] text-[#052814] text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#34d399]/20 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Log to Today's Rhythm</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center bg-[#151922] space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#34d399]/15 text-[#34d399] flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Take Meal Photo</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Align plate in center of viewfinder. Our rhythmic engine estimates macro ratios
                and digestive pacing.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Quick Sample Plates
              </span>
              <div className="space-y-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleSelectPreset(preset)}
                    className="w-full p-3 rounded-xl bg-[#181c26] border border-white/5 hover:border-white/20 text-left flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{preset.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {preset.mealType} · {preset.protein}g P · {preset.carbs}g C · {preset.fat}g F
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#34d399] font-mono">
                      {preset.calories} kcal
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
