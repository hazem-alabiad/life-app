import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ManualMealModal: React.FC = () => {
  const { showManualMealModal, setShowManualMealModal, addMeal } = useApp();

  const [name, setName] = useState('');
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch');
  const [calories, setCalories] = useState('550');
  const [protein, setProtein] = useState('35');
  const [carbs, setCarbs] = useState('50');
  const [fat, setFat] = useState('16');
  const [insight, setInsight] = useState('Balanced nutrient density for active recovery.');

  if (!showManualMealModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addMeal({
      name: name.trim(),
      mealType,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calories: parseInt(calories, 10) || 500,
      protein: parseInt(protein, 10) || 30,
      carbs: parseInt(carbs, 10) || 45,
      fat: parseInt(fat, 10) || 15,
      mindfulInsight: insight,
    });

    setName('');
    setShowManualMealModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#131720] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h3 className="text-base font-bold text-white">Manual Meal Log</h3>
          <button
            onClick={() => setShowManualMealModal(false)}
            className="w-8 h-8 rounded-full bg-[#1e2430] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Meal Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Avocado Toast with Hemp Hearts"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#1b202a] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#34d399]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Meal Slot
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setMealType(type)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                    mealType === type
                      ? 'bg-[#202634] border-[#34d399] text-[#34d399]'
                      : 'bg-[#181c25] border-white/5 text-slate-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Calories (kcal)
              </label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1b202a] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#34d399]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1b202a] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#34d399]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1b202a] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#34d399]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Fats (g)
              </label>
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1b202a] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#34d399]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Mindful Observation / Biofeedback Note
            </label>
            <input
              type="text"
              value={insight}
              onChange={(e) => setInsight(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#1b202a] border border-white/10 text-white text-xs focus:outline-none focus:border-[#34d399]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#34d399] hover:bg-[#2fd094] text-[#052814] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#34d399]/20"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Add to Nutrition Journal</span>
          </button>
        </form>
      </div>
    </div>
  );
};
