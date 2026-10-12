import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, CameraOff, Check, ImageOff, Info, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Card, CardHeader, SectionLabel } from '../../components/Card';
import { MacroBar } from '../../components/Bar';
import { AnalyzingCard, EmptyState } from '../../components/States';
import { useStore } from '../../state/store';
import type { MealEntry } from '../../types';
import { newId } from '../../lib/id';
import { formatKcal } from '../../lib/format';
import { dateKey, parseDateKey, relativeDayLabel } from '../../lib/date';
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

export function LogView({ onOpenMeal }: LogViewProps) {
  const { state, dispatch, now } = useStore();
  const [stage, setStage] = useState<'idle' | 'analyzing' | 'result' | 'manual'>('idle');
  const [step, setStep] = useState(0);
  const [estimate, setEstimate] = useState<MealEstimate | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [manualName, setManualName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // The analysis beat is deliberate: instant answers feel like guesses.
  useEffect(() => {
    if (stage !== 'analyzing') return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % ANALYSIS_STEPS.length), 1000);
    return () => window.clearInterval(id);
  }, [stage]);

  const today = new Date(now);
  const groups = useMemo(() => {
    const map = new Map<string, MealEntry[]>();
    for (const meal of state.meals) {
      const key = dateKey(new Date(meal.createdAt));
      const list = map.get(key) ?? [];
      list.push(meal);
      map.set(key, list);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [state.meals]);

  const todayMeals = state.meals.filter((m) => dateKey(new Date(m.createdAt)) === dateKey(today));
  const todayKcal = todayMeals.reduce((sum, m) => sum + m.kcal, 0);

  const handleFile = async (file: File) => {
    setError(null);
    setStage('analyzing');
    setStep(0);
    const started = Date.now();
    try {
      const [result, thumb] = await Promise.all([estimateMeal(file), downscaleImage(file)]);
      // Hold the skeleton for at least 3 seconds so the result reads as work.
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
    /* Capture on the left, the day's log on the right once there is room. */
    <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-6">
      <div className="space-y-4 lg:col-span-5">
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

      {/* The camera is the whole point of this screen. */}
      {stage === 'idle' && (
        <>
          <Card className="relative overflow-hidden text-center">
            <div
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                background:
                  'radial-gradient(circle at 50% 0%, var(--nourish-soft), transparent 70%)',
              }}
            />
            <div className="relative">
              <SectionLabel className="mb-1 block">Today</SectionLabel>
              <p className="tnum text-[1.875rem] font-semibold leading-tight text-ink">
                {formatKcal(todayKcal)}
              </p>
              <p className="mt-1 text-[0.75rem] text-ink-3">
                {todayMeals.length} meal{todayMeals.length === 1 ? '' : 's'} logged
              </p>

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mx-auto mt-6 flex h-40 w-40 flex-col items-center justify-center gap-2.5 rounded-full bg-nourish text-nourish-ink transition-opacity active:opacity-90"
                style={{ boxShadow: '0 0 60px -14px rgba(74,222,128,0.55)' }}
              >
                <Camera size={34} strokeWidth={1.8} />
                <span className="text-[0.875rem] font-semibold">Snap a meal</span>
              </button>

              <div className="mt-5 flex items-center justify-center gap-2">
                <Button
                  accent="nourish"
                  variant="ghost"
                  size="sm"
                  icon={<CameraOff size={15} />}
                  onClick={() => setStage('manual')}
                >
                  Add without photo
                </Button>
              </div>
            </div>
          </Card>

          {error && (
            <Card pad="sm" className="flex items-start gap-2.5">
              <Info size={15} className="mt-0.5 flex-shrink-0 text-ink-3" />
              <p className="text-[0.75rem] leading-5 text-ink-2">{error}</p>
            </Card>
          )}
        </>
      )}

      {stage === 'analyzing' && <AnalyzingCard step={ANALYSIS_STEPS[step]!} />}

      {/* The result is a card you confirm, never a number you have to accept. */}
      {stage === 'result' && estimate && (
        <Card className="animate-rise">
          <CardHeader
            label="Estimated meal"
            action={
              <span className="text-[0.625rem] uppercase tracking-[0.12em] text-ink-3">
                on-device estimate
              </span>
            }
          />
          <div className="flex items-start gap-4">
            {photo ? (
              <img
                src={photo}
                alt="The meal you captured"
                className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-surface-3">
                <ImageOff size={20} className="text-ink-3" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-[1rem] font-medium text-ink">{estimate.name}</h3>
              <p className="tnum mt-1 text-[0.8125rem] font-semibold text-nourish">
                {formatKcal(estimate.kcal)}
              </p>
              <p className="mt-1 text-[0.6875rem] text-ink-3">
                {Math.round(estimate.confidence * 100)}% match · adjust anything that looks wrong
              </p>
            </div>
          </div>

          <MacroBar
            protein={estimate.macros.protein}
            carbs={estimate.macros.carbs}
            fat={estimate.macros.fat}
            labels
            className="mt-5"
          />

          <ul className="mt-5 space-y-2.5">
            {estimate.tips.map((tip) => (
              <li key={tip} className="flex gap-2.5 text-[0.75rem] leading-5 text-ink-2">
                <Sparkles size={13} className="mt-0.5 flex-shrink-0 text-nourish" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex gap-2">
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
            This build estimates from a local food table rather than a vision model, so treat the
            name and the numbers as a starting point.
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
            className="h-12 w-full rounded-2xl border border-line bg-field px-4 text-[0.875rem] text-ink placeholder:text-ink-3 focus:border-nourish/50"
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

      </div>

      {/* Everything logged, newest first, grouped by day. */}
      <div className="mt-4 space-y-5 lg:col-span-7 lg:mt-0">
      {groups.length === 0 ? (
        <EmptyState
          title="Nothing logged yet"
          body="Photograph a meal and it will show up here, macros and all."
        />
      ) : (
        <div className="space-y-5">
          {groups.map(([day, meals]) => {
            const total = meals.reduce((sum, m) => sum + m.kcal, 0);
            return (
              <section key={day}>
                <div className="mb-2 flex items-baseline justify-between">
                  <SectionLabel>{relativeDayLabel(parseDateKey(day), today)}</SectionLabel>
                  <span className="tnum text-[0.6875rem] text-ink-3">{formatKcal(total)}</span>
                </div>
                <ul className="space-y-2">
                  {meals.map((meal) => (
                    <li key={meal.id}>
                      <Card pad="sm">
                        <div className="flex items-center gap-3.5">
                          <button
                            type="button"
                            onClick={() => onOpenMeal(meal.id)}
                            className="flex min-w-0 flex-1 items-center gap-3.5 text-left"
                          >
                            {meal.photo ? (
                              <img
                                src={meal.photo}
                                alt=""
                                className="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
                              />
                            ) : (
                              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-nourish-soft">
                                <Sparkles size={16} className="text-nourish" />
                              </span>
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[0.875rem] font-medium text-ink">
                                {meal.name}
                              </span>
                              <span className="tnum mt-0.5 block text-[0.6875rem] text-ink-3">
                                {formatKcal(meal.kcal)} · P{Math.round(meal.macros.protein)} C
                                {Math.round(meal.macros.carbs)} F{Math.round(meal.macros.fat)}
                              </span>
                            </span>
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${meal.name}`}
                            onClick={() => dispatch({ type: 'meal/remove', id: meal.id })}
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-ink-3"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
