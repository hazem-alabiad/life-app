import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Droplets,
  HeartPulse,
  ImageOff,
  Info,
  MoonStar,
  Camera as CameraIcon,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Card, CardHeader, SectionLabel } from '../../components/Card';
import { MacroBar } from '../../components/Bar';
import { AnalyzingCard, EmptyState } from '../../components/States';
import { useStore } from '../../state/store';
import type { MealEntry } from '../../types';
import { newId } from '../../lib/id';
import { formatKcal, pct } from '../../lib/format';
import { dateKey, relativeDayLabel } from '../../lib/date';
import { estimateMeal, downscaleImage, manualEstimate, type MealEstimate } from '../../lib/recognize';
import { MANUAL_FOOD_NAMES } from '../../data/foods';

const ANALYSIS_STEPS = [
  'Looking at what is on the plate…',
  'Separating the main components…',
  'Estimating the portion sizes…',
  'Checking the numbers make sense…',
];

interface LogViewProps {
  onOpenMeal: (mealId: string) => void;
}

/** Macro goals in grams for a 2,200 kcal split — displayed as the budget bars. */
const MACRO_GOALS = { protein: 130, carbs: 220, fat: 65 };

export function LogView({ onOpenMeal }: LogViewProps) {
  const { state, dispatch, now } = useStore();
  const [stage, setStage] = useState<'idle' | 'analyzing' | 'result' | 'manual'>('idle');
  const [step, setStep] = useState(0);
  const [estimate, setEstimate] = useState<MealEstimate | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [manualName, setManualName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [water, setWater] = useState(2.2);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (stage !== 'analyzing') return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % ANALYSIS_STEPS.length), 1000);
    return () => window.clearInterval(id);
  }, [stage]);

  const today = new Date(now);
  const todayKeyStr = dateKey(today);

  const todayMeals = useMemo(
    () =>
      state.meals
        .filter((m) => dateKey(new Date(m.createdAt)) === todayKeyStr)
        .sort((a, b) => b.createdAt - a.createdAt),
    [state.meals, todayKeyStr],
  );
  const todayKcal = todayMeals.reduce((sum, m) => sum + m.kcal, 0);
  const macros = todayMeals.reduce(
    (acc, m) => ({
      protein: acc.protein + m.macros.protein,
      carbs: acc.carbs + m.macros.carbs,
      fat: acc.fat + m.macros.fat,
      sugar: acc.sugar,
    }),
    { protein: 0, carbs: 0, fat: 0, sugar: 0 },
  );

  const handleFile = async (file: File) => {
    setError(null);
    setStage('analyzing');
    setStep(0);
    const started = Date.now();
    try {
      const [result, thumb] = await Promise.all([estimateMeal(file), downscaleImage(file)]);
      const wait = Math.max(0, 3000 - (Date.now() - started));
      await new Promise((resolve) => setTimeout(resolve, wait));
      setEstimate(result);
      setPhoto(thumb || null);
      setStage('result');
    } catch {
      setError('That image could not be read. Try another photo, or add it without one.');
      setStage('idle');
    }
  };

  const saveMeal = (result: MealEstimate, image: string | null, source: 'photo' | 'manual') => {
    dispatch({
      type: 'meal/add',
      meal: {
        id: newId('meal'),
        name: result.name,
        kcal: result.kcal,
        macros: result.macros,
        tips: result.tips,
        confidence: result.confidence,
        createdAt: Date.now(),
        photo: image,
        source,
      },
    });
    setStage('idle');
    setEstimate(null);
    setPhoto(null);
    setManualName('');
  };

  return (
    <div className="space-y-5">
      {/* Daily circadian energy budget. */}
      <section className="rounded-[var(--radius-card)] border border-line bg-surface p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <SectionLabel>Daily Circadian Energy Budget</SectionLabel>
            <p className="font-tech tnum mt-2 text-[2.5rem] font-semibold leading-none text-ink">
              {todayKcal.toLocaleString()}
              <span className="ml-2 text-[1rem] font-medium text-ink-3">
                /{' '}
                {state.settings.dailyCalorieGoal.toLocaleString()}{' '}
                kcal goal
              </span>
            </p>
          </div>
          <span className="inline-flex items-center rounded-lg border border-nourish/40 bg-nourish-soft px-3 py-1.5 text-[0.75rem] font-semibold text-nourish">
            <HeartPulse size={13} className="mr-1.5" /> Balanced Metabolic Rhythm
          </span>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-track">
          <div
            className="h-full rounded-full bg-nourish transition-[width] duration-500"
            style={{ width: `${pct(todayKcal, state.settings.dailyCalorieGoal) * 100}%` }}
          />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-line bg-canvas p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[0.8125rem] text-ink-2">Protein</span>
              <span className="font-tech text-[0.72rem] font-semibold text-move">
                {Math.round(pct(macros.protein, MACRO_GOALS.protein) * 100)}%
              </span>
            </div>
            <p className="font-tech tnum mt-1 text-[1.25rem] font-semibold text-ink">
              {Math.round(macros.protein)}g
              <span className="ml-1.5 text-[0.75rem] font-medium text-ink-3">
                / {MACRO_GOALS.protein}g
              </span>
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-track">
              <div
                className="h-full rounded-full bg-move"
                style={{ width: `${pct(macros.protein, MACRO_GOALS.protein) * 100}%` }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-line bg-canvas p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[0.8125rem] text-ink-2">Complex Carbs</span>
              <span className="font-tech text-[0.72rem] font-semibold text-focus">
                {Math.round(pct(macros.carbs, MACRO_GOALS.carbs) * 100)}%
              </span>
            </div>
            <p className="font-tech tnum mt-1 text-[1.25rem] font-semibold text-ink">
              {Math.round(macros.carbs)}g
              <span className="ml-1.5 text-[0.75rem] font-medium text-ink-3">
                / {MACRO_GOALS.carbs}g
              </span>
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-track">
              <div
                className="h-full rounded-full bg-focus"
                style={{ width: `${pct(macros.carbs, MACRO_GOALS.carbs) * 100}%` }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-line bg-canvas p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[0.8125rem] text-ink-2">Healthy Fats</span>
              <span className="font-tech text-[0.72rem] font-semibold text-nourish">
                {Math.round(pct(macros.fat, MACRO_GOALS.fat) * 100)}%
              </span>
            </div>
            <p className="font-tech tnum mt-1 text-[1.25rem] font-semibold text-ink">
              {Math.round(macros.fat)}g
              <span className="ml-1.5 text-[0.75rem] font-medium text-ink-3">
                / {MACRO_GOALS.fat}g
              </span>
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-track">
              <div
                className="h-full rounded-full bg-nourish"
                style={{ width: `${pct(macros.fat, MACRO_GOALS.fat) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
        {/* Log column. */}
        <div className="space-y-4 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-[1.25rem] font-semibold tracking-tight text-ink">
              Today&apos;s Nourishment Log
            </h2>
            <span className="font-tech text-[0.72rem] text-ink-3">
              {todayMeals.length} entr{todayMeals.length === 1 ? 'y' : 'ies'} recorded
            </span>
          </div>

          {/* Capture row. */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = '';
            }}
          />

          {stage === 'idle' && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                accent="nourish"
                size="md"
                icon={<CameraIcon size={16} />}
                onClick={() => fileRef.current?.click()}
              >
                Snap Meal Photo
              </Button>
              <Button
                accent="nourish"
                variant="soft"
                size="md"
                icon={<Plus size={16} />}
                onClick={() => setStage('manual')}
              >
                Manual Entry
              </Button>
            </div>
          )}

          {error && (
            <Card pad="sm" className="flex items-start gap-2.5">
              <Info size={15} className="mt-0.5 flex-shrink-0 text-ink-3" />
              <p className="text-[0.75rem] leading-5 text-ink-2">{error}</p>
            </Card>
          )}

          {stage === 'analyzing' && <AnalyzingCard step={ANALYSIS_STEPS[step]!} />}

          {stage === 'result' && estimate && (
            <Card className="animate-rise">
              <CardHeader
                label="Estimated meal"
                action={
                  <span className="font-tech text-[0.65rem] uppercase tracking-[0.1em] text-ink-3">
                    on-device estimate
                  </span>
                }
              />
              <div className="flex items-start gap-4">
                {photo ? (
                  <img
                    src={photo}
                    alt="The meal you captured"
                    className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-surface-3">
                    <ImageOff size={20} className="text-ink-3" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-[1.0625rem] font-semibold text-ink">
                    {estimate.name}
                  </h3>
                  <p className="font-tech tnum mt-1 text-[0.8125rem] font-semibold text-nourish">
                    {formatKcal(estimate.kcal)} · {Math.round(estimate.confidence * 100)}% match
                  </p>
                </div>
              </div>
              <MacroBar
                protein={estimate.macros.protein}
                carbs={estimate.macros.carbs}
                fat={estimate.macros.fat}
                labels
                className="mt-4"
              />
              <ul className="mt-4 space-y-2">
                {estimate.tips.map((tip) => (
                  <li
                    key={tip}
                    className="flex items-start gap-2.5 rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-[0.78rem] leading-5 text-ink-2"
                  >
                    <Sparkles size={13} className="mt-0.5 flex-shrink-0 text-nourish" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2">
                <Button
                  accent="nourish"
                  className="flex-1"
                  icon={<Check size={16} />}
                  onClick={() => saveMeal(estimate, photo, 'photo')}
                >
                  Log it
                </Button>
                <Button
                  accent="nourish"
                  variant="ghost"
                  onClick={() => {
                    setStage('idle');
                    setEstimate(null);
                    setPhoto(null);
                  }}
                >
                  Discard
                </Button>
              </div>
              <p className="mt-3 text-[0.6875rem] leading-5 text-ink-3">
                This build estimates from a local food table rather than a vision model, so treat
                the name and the numbers as a starting point.
              </p>
            </Card>
          )}

          {stage === 'manual' && (
            <Card className="animate-rise">
              <CardHeader label="Add without a photo" />
              <input
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="What did you have?"
                aria-label="Meal name"
                className="h-12 w-full rounded-xl border border-line bg-field px-4 text-[0.875rem] text-ink placeholder:text-ink-3 focus:border-nourish/50"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {MANUAL_FOOD_NAMES.slice(0, 8).map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setManualName(name)}
                    className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-[0.6875rem] text-ink-2"
                  >
                    {name}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  accent="nourish"
                  className="flex-1"
                  disabled={manualName.trim().length < 2}
                  icon={<Check size={16} />}
                  onClick={() => saveMeal(manualEstimate(manualName.trim()), null, 'manual')}
                >
                  Log it
                </Button>
                <Button accent="nourish" variant="ghost" onClick={() => setStage('idle')}>
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* Today's meals as rich cards. */}
          {todayMeals.length > 0 ? (
            <ul className="space-y-3">
              {todayMeals.map((meal, index) => (
                <li key={meal.id}>
                  <Card pad="md">
                    <div className="flex items-start gap-4">
                      {meal.photo ? (
                        <img
                          src={meal.photo}
                          alt=""
                          className="h-14 w-14 flex-shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-surface-3">
                          <Sparkles size={18} className="text-nourish" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="font-tech text-[0.65rem] uppercase tracking-[0.14em] text-ink-3">
                            {mealTimeLabel(meal, index)}
                          </p>
                          <p className="font-tech tnum text-[1.0625rem] font-semibold text-ink">
                            {Math.round(meal.kcal)}
                            <span className="ml-1 text-[0.65rem] text-ink-3">kcal</span>
                          </p>
                        </div>
                        <h3 className="font-display mt-0.5 truncate text-[1.0625rem] font-semibold text-ink">
                          {meal.name}
                        </h3>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          <MacroChip
                            tone="move"
                            label={`Protein`}
                            value={`${Math.round(meal.macros.protein)}g`}
                          />
                          <MacroChip
                            tone="focus"
                            label={`Carbs`}
                            value={`${Math.round(meal.macros.carbs)}g`}
                          />
                          <MacroChip
                            tone="nourish"
                            label={`Fats`}
                            value={`${Math.round(meal.macros.fat)}g`}
                          />
                        </div>
                      </div>
                    </div>

                    {meal.tips[0] && (
                      <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-line bg-canvas px-3.5 py-2.5">
                        <Sparkles size={13} className="mt-0.5 flex-shrink-0 text-nourish" />
                        <p className="text-[0.78rem] leading-5 text-ink-2">{meal.tips[0]}</p>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenMeal(meal.id)}
                        className="rounded-lg px-3 py-1.5 text-[0.75rem] font-medium text-ink-2 transition-colors hover:bg-surface-2"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${meal.name}`}
                        onClick={() => dispatch({ type: 'meal/remove', id: meal.id })}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-surface-2"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            stage === 'idle' && (
              <EmptyState
                title="Nothing logged yet"
                body="Photograph a meal and it will show up here, macros and all."
              />
            )
          )}

          {/* Past days, lighter. */}
          {state.meals.some((m) => dateKey(new Date(m.createdAt)) !== todayKeyStr) && (
            <section className="pt-2">
              <SectionLabel>Earlier days</SectionLabel>
              <ul className="mt-2 space-y-1.5">
                {state.meals
                  .filter((m) => dateKey(new Date(m.createdAt)) !== todayKeyStr)
                  .slice(0, 6)
                  .map((meal) => (
                    <li key={meal.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5">
                      <button
                        type="button"
                        onClick={() => onOpenMeal(meal.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-ink-2">
                          <span className="text-ink">{meal.name}</span>
                          <span className="ml-2 font-tech text-[0.6875rem] text-ink-3">
                            {relativeDayLabel(new Date(meal.createdAt), today)}
                          </span>
                        </span>
                        <span className="font-tech tnum flex-shrink-0 text-[0.75rem] text-ink-3">
                          {Math.round(meal.kcal)} kcal
                        </span>
                      </button>
                    </li>
                  ))}
              </ul>
            </section>
          )}
        </div>

        {/* Rail: hydration + circadian timing. */}
        <aside className="space-y-4 lg:col-span-4">
          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Droplets size={15} className="text-focus" />
                <SectionLabel>Hydration Buffer</SectionLabel>
              </span>
              <span className="font-tech tnum text-[0.78rem] font-semibold text-ink">
                {water.toFixed(1)}<span className="text-ink-3"> / 3.0L</span>
              </span>
            </div>
            <p className="mt-2 text-[0.8125rem] leading-5 text-ink-2">
              Drinking 250ml every 45 minutes protects processing speed and muscular power.
            </p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-track">
              <div
                className="h-full rounded-full bg-focus transition-[width] duration-500"
                style={{ width: `${Math.min(100, (water / 3) * 100)}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWater((w) => Math.min(3, w + 0.25))}
                className="rounded-xl border border-line bg-canvas py-2.5 font-tech text-[0.78rem] font-semibold text-ink-2 transition-colors hover:bg-surface-2"
              >
                + 250 ml
              </button>
              <button
                type="button"
                onClick={() => setWater((w) => Math.min(3, w + 0.5))}
                className="rounded-xl border border-line bg-canvas py-2.5 font-tech text-[0.78rem] font-semibold text-ink-2 transition-colors hover:bg-surface-2"
              >
                + 500 ml
              </button>
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
            <div className="flex items-center gap-2">
              <MoonStar size={15} className="text-gold" />
              <SectionLabel>Circadian Timing Protocol</SectionLabel>
            </div>
            <div className="mt-4 space-y-2.5">
              <div className="flex items-start justify-between gap-3 rounded-xl border border-line bg-canvas px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[0.8125rem] font-medium text-ink">Post-Workout Refuel</p>
                  <p className="mt-0.5 text-[0.75rem] text-ink-3">
                    Protein + glycogen-restoring carbohydrates
                  </p>
                </div>
                <span className="font-tech flex-shrink-0 text-[0.72rem] text-nourish">1:00 PM</span>
              </div>
              <div className="flex items-start justify-between gap-3 rounded-xl border border-line bg-canvas px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[0.8125rem] font-medium text-ink">Evening Wind-Down</p>
                  <p className="mt-0.5 text-[0.75rem] text-ink-3">
                    Tryptophan-rich protein, low glycemic fiber
                  </p>
                </div>
                <span className="font-tech flex-shrink-0 text-[0.72rem] text-gold">7:30 PM</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MacroChip({
  tone,
  label,
  value,
}: {
  tone: 'move' | 'focus' | 'nourish';
  label: string;
  value: string;
}) {
  const toneMap = {
    move: 'bg-move/15 text-move',
    focus: 'bg-focus/15 text-focus',
    nourish: 'bg-nourish/15 text-nourish',
  } as const;
  return (
    <span className={`font-tech rounded-md px-2 py-1 text-[0.6875rem] font-semibold ${toneMap[tone]}`}>
      {value} {label}
    </span>
  );
}

function mealTimeLabel(meal: MealEntry, index: number): string {
  if (index === 0) return 'Latest';
  const at = new Date(meal.createdAt);
  return at.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
}
