import React from 'react';
import { Camera, Plus, Sparkles, Brain, CheckCircle2, Droplet, Clock, Utensils, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NourishScreen: React.FC = () => {
  const {
    nourishSubTab,
    setNourishSubTab,
    meals,
    setShowSnapMealModal,
    setShowManualMealModal,
  } = useApp();

  const totalCaloriesLogged = meals.reduce((acc, m) => acc + (m.calories || 0), 0);
  const totalProteinLogged = meals.reduce((acc, m) => acc + (m.protein || 0), 0);
  const totalCarbsLogged = meals.reduce((acc, m) => acc + (m.carbs || 0), 0);
  const totalFatsLogged = meals.reduce((acc, m) => acc + (m.fat || 0), 0);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300 max-w-7xl mx-auto w-full">
      {/* Top Header & Subtab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="inline-flex p-1 rounded-xl bg-[#141822] border border-white/[0.06] self-start">
          <button
            onClick={() => setNourishSubTab('log')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              nourishSubTab === 'log'
                ? 'bg-[#1e2535] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#34d399]" />
            <span>Meal History & Macros</span>
          </button>

          <button
            onClick={() => setNourishSubTab('insights')}
            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              nourishSubTab === 'insights'
                ? 'bg-[#1e2535] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Circadian Nutrition Insights
          </button>
        </div>

        {/* Quick Log Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSnapMealModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#34d399] hover:bg-[#2fd094] text-[#052814] font-bold text-xs shadow-md shadow-[#34d399]/20 transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Snap Meal Photo</span>
          </button>

          <button
            onClick={() => setShowManualMealModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#161b25] hover:bg-[#202735] border border-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#34d399]" />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      {nourishSubTab === 'log' ? (
        <div className="space-y-6">
          {/* Daily Energy & Macro Dashboard (Top Grid) */}
          <div className="bg-[#141822] border border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  DAILY CIRCADIAN ENERGY BUDGET
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                    {totalCaloriesLogged}
                  </span>
                  <span className="text-sm font-medium text-slate-400 font-mono">
                    / 2,200 kcal Goal
                  </span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34d399]/15 border border-[#34d399]/30 text-[#34d399] text-xs font-semibold self-start sm:self-auto">
                <Heart className="w-3.5 h-3.5" />
                <span>Balanced Metabolic Rhythm</span>
              </span>
            </div>

            {/* Total Calorie Bar */}
            <div className="h-2.5 w-full bg-[#1e2533] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, (totalCaloriesLogged / 2200) * 100)}%` }}
              />
            </div>

            {/* Macro Breakdown 3 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Protein */}
              <div className="p-3.5 rounded-xl bg-[#181d28] border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Protein</span>
                  <span className="text-[#ff6b4a] font-mono font-bold">
                    {Math.round((totalProteinLogged / 130) * 100)}%
                  </span>
                </div>
                <div className="text-base font-bold text-white font-mono">
                  {totalProteinLogged}g <span className="text-xs text-slate-400 font-normal">/ 130g</span>
                </div>
                <div className="h-1.5 w-full bg-[#222836] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ff6b4a] rounded-full"
                    style={{ width: `${Math.min(100, (totalProteinLogged / 130) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div className="p-3.5 rounded-xl bg-[#181d28] border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Complex Carbs</span>
                  <span className="text-[#22d3ee] font-mono font-bold">
                    {Math.round((totalCarbsLogged / 220) * 100)}%
                  </span>
                </div>
                <div className="text-base font-bold text-white font-mono">
                  {totalCarbsLogged}g <span className="text-xs text-slate-400 font-normal">/ 220g</span>
                </div>
                <div className="h-1.5 w-full bg-[#222836] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#22d3ee] rounded-full"
                    style={{ width: `${Math.min(100, (totalCarbsLogged / 220) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Fats */}
              <div className="p-3.5 rounded-xl bg-[#181d28] border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Healthy Fats</span>
                  <span className="text-[#34d399] font-mono font-bold">
                    {Math.round((totalFatsLogged / 65) * 100)}%
                  </span>
                </div>
                <div className="text-base font-bold text-white font-mono">
                  {totalFatsLogged}g <span className="text-xs text-slate-400 font-normal">/ 65g</span>
                </div>
                <div className="h-1.5 w-full bg-[#222836] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#34d399] rounded-full"
                    style={{ width: `${Math.min(100, (totalFatsLogged / 65) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Desktop Grid: Meals List on Left, Hydration & Rhythm on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Meals Log (7 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Today's Nourishment Log</h3>
                <span className="text-xs text-slate-400 font-mono">{meals.length} entries recorded</span>
              </div>

              <div className="space-y-4">
                {meals.map((meal) => (
                  <div
                    key={meal.id}
                    className="bg-[#141822] border border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-3 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        {meal.image ? (
                          <img
                            src={meal.image}
                            alt={meal.name}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[#222835]"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-[#181d28] border border-white/5 flex items-center justify-center shrink-0 text-xl">
                            🥗
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold tracking-wider text-[#34d399] uppercase">
                              {meal.mealType}
                            </span>
                            <span className="text-slate-500 text-xs">·</span>
                            <span className="text-xs text-slate-400 font-mono">{meal.time}</span>
                          </div>
                          <h4 className="text-base font-bold text-white tracking-tight mt-0.5">
                            {meal.name}
                          </h4>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-lg font-bold text-white font-mono tabular-nums">
                          {meal.calories}
                        </span>
                        <span className="text-xs text-slate-400 block font-normal">kcal</span>
                      </div>
                    </div>

                    {/* Macro pills */}
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-[#ff6b4a]/15 text-[#ff8366] font-mono font-medium">
                        {meal.protein}g Protein
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-[#22d3ee]/15 text-[#22d3ee] font-mono font-medium">
                        {meal.carbs}g Carbs
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-[#34d399]/15 text-[#34d399] font-mono font-medium">
                        {meal.fat}g Fats
                      </span>
                    </div>

                    {/* Mindful Bio-Feedback Insight */}
                    {meal.mindfulInsight && (
                      <div className="p-3 rounded-xl bg-[#171d28] border border-white/5 text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
                        <Sparkles className="w-4 h-4 text-[#34d399] shrink-0 mt-0.5" />
                        <span>{meal.mindfulInsight}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Hydration & Circadian Timing (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Hydration Tracker */}
              <div className="bg-[#141822] border border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Droplet className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Hydration Buffer</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-white">2.2L / 3.0L</span>
                </div>

                <p className="text-xs text-slate-400">
                  Drinking 250ml every 45 minutes protects neurological processing speed and muscular power.
                </p>

                <div className="h-2 w-full bg-[#1c2331] rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '73%' }} />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => alert('Logged +250ml water')}
                    className="flex-1 py-2 rounded-xl bg-[#181e2b] hover:bg-[#202737] text-xs font-semibold text-slate-200 border border-white/5 transition-colors cursor-pointer"
                  >
                    + 250 ml
                  </button>
                  <button
                    onClick={() => alert('Logged +500ml water')}
                    className="flex-1 py-2 rounded-xl bg-[#181e2b] hover:bg-[#202737] text-xs font-semibold text-slate-200 border border-white/5 transition-colors cursor-pointer"
                  >
                    + 500 ml
                  </button>
                </div>
              </div>

              {/* Bio-Rhythm Meal Windows */}
              <div className="bg-[#141822] border border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-3">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  CIRCADIAN TIMING PROTOCOL
                </span>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#171d28] border border-white/5 space-y-0.5">
                    <div className="flex items-center justify-between font-semibold text-white">
                      <span>Post-Workout Refuel</span>
                      <span className="text-emerald-400 font-mono">1:00 PM</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">High protein + glycogen restoring complex carbohydrates</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#171d28] border border-white/5 space-y-0.5">
                    <div className="flex items-center justify-between font-semibold text-white">
                      <span>Evening Wind-Down Dinner</span>
                      <span className="text-slate-400 font-mono">7:30 PM</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">Tryptophan-rich lean proteins + low glycemic fiber</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Insights Subtab */
        <div className="space-y-4">
          <div className="bg-[#141822] border border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-white">Bio-Rhythmic Nutrition Dynamics</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Chrononutrition emphasizes that when you eat is as biologically critical as what you eat. Food intake triggers peripheral clocks in the liver and gut, which modulate insulin sensitivity and dopamine cascades.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#181d28] border border-white/5 space-y-2">
                <span className="text-xs font-bold text-[#ff6b4a]">Morning Metabolic Ignition</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Consume protein within 90 minutes of waking to anchor dopamine and prevent afternoon energy valleys.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#181d28] border border-white/5 space-y-2">
                <span className="text-xs font-bold text-[#22d3ee]">Ultradian Focus Satiety</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Avoid heavy glycemic spikes during peak focus windows (10am–1pm) to eliminate postprandial brain fog.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#181d28] border border-white/5 space-y-2">
                <span className="text-xs font-bold text-[#34d399]">3-Hour Melatonin Buffer</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cease caloric intake 3 hours before sleep to allow body temperature to drop for deep restorative slow-wave sleep.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
