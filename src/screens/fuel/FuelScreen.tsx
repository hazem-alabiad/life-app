import { Check, Droplets, Leaf, Pencil, Plus, Trash2 } from 'lucide-react';
import { CONTAINER } from '../../components/TopBar';
import { Button } from '../../components/Button';
import { Ring } from '../../components/Ring';
import { EmptyState } from '../../components/States';
import { useStore } from '../../state/store';
import type { MealKind, MealRecord, SheetKind } from '../../types';
import { dateKey, formatTime } from '../../lib/date';
import {
  dayNumber,
  dayNutrition,
  hydrationForDay,
  macroGoals,
  mealsForDay,
} from '../../lib/selectors';

function formatMl(ml: number): string {
  if (ml < 1000) return `${ml}ml`;
  return `${(ml / 1000).toFixed(1)}L`;
}

function kindLabel(kind: MealKind): string {
  return kind[0]!.toUpperCase() + kind.slice(1);
}

export function FuelScreen({ onOpenSheet }: { onOpenSheet: (sheet: SheetKind) => void }) {
  const { state, dispatch, now } = useStore();
  const { settings } = state;
  const today = new Date(now);

  const meals = mealsForDay(state, today);
  const nutrition = dayNutrition(state, today);
  const goals = macroGoals(settings.dailyCalorieGoal);
  const waterMl = hydrationForDay(state, today);
  const waterPct = Math.min(100, Math.round((waterMl / settings.hydrationGoalMl) * 100));

  const calProgress = settings.dailyCalorieGoal > 0 ? nutrition.calories / settings.dailyCalorieGoal : 0;
  const remaining = Math.max(0, settings.dailyCalorieGoal - nutrition.calories);

  const macroTotal = Math.max(1, nutrition.proteinG + nutrition.carbsG + nutrition.fatG);
  const macroPct = (value: number, goal: number) =>
    goal > 0 ? Math.min(999, Math.round((value / goal) * 100)) : 0;

  const addWater = () =>
    dispatch({ type: 'hydration/add', day: dateKey(today), ml: 250 });

  return (
    <div className={`${CONTAINER} space-y-4 pb-40 pt-5 lg:pb-16`}>
      <div>
        <p className="font-tech text-[0.6875rem] uppercase tracking-[0.14em] text-nourish">
          Fuel · mindful nutrition
        </p>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-[1.5rem] font-semibold tracking-tight text-ink">
            Daily Nourishment
          </h2>
          <span className="font-tech flex-shrink-0 text-[0.72rem] text-ink-3">
            Day {dayNumber(settings.firstLaunchAt, today)}
          </span>
        </div>
      </div>

      {/* Calorie ring. */}
      <section className="rounded-[var(--radius-card)] border border-line bg-surface p-5 md:p-8">
        <div className="flex items-center justify-center">
          <Ring
            progress={calProgress}
            color="var(--nourish)"
            size={220}
            stroke={10}
            glow={nutrition.calories > 0}
            label={`${nutrition.calories} of ${settings.dailyCalorieGoal} kilocalories`}
          >
            <span className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-ink-3">
              Energy in
            </span>
            <span className="font-tech tnum mt-1 text-[2rem] font-semibold leading-none tracking-tight text-ink">
              {nutrition.calories.toLocaleString()}
              <span className="text-[0.8125rem] font-medium text-ink-3">
                {' '}/ {settings.dailyCalorieGoal.toLocaleString()}
              </span>
            </span>
            <span className="font-tech mt-1 text-[0.72rem] text-nourish">kcal</span>
          </Ring>
        </div>
        <p className="mt-4 text-center text-[0.8125rem] text-ink-2">
          {remaining > 0
            ? `${remaining.toLocaleString()} kcal of room left today`
            : 'Day fully fuelled — anything more is pleasure, not need'}
        </p>
      </section>

      {/* Macros. */}
      <section className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[1rem] font-semibold text-ink">Macronutrients</h3>
          <span className="font-tech text-[0.6875rem] text-ink-3">
            targets follow your calorie goal
          </span>
        </div>
        <div className="mt-3 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-track p-0.5">
          <div className="h-full rounded-l-full bg-move" style={{ width: `${(nutrition.proteinG / macroTotal) * 100}%` }} />
          <div className="h-full bg-focus" style={{ width: `${(nutrition.carbsG / macroTotal) * 100}%` }} />
          <div className="h-full rounded-r-full bg-nourish" style={{ width: `${(nutrition.fatG / macroTotal) * 100}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <MacroCell dot="bg-move" label="Protein" value={nutrition.proteinG} goal={goals.proteinG} pct={macroPct(nutrition.proteinG, goals.proteinG)} />
          <MacroCell dot="bg-focus" label="Carbs" value={nutrition.carbsG} goal={goals.carbsG} pct={macroPct(nutrition.carbsG, goals.carbsG)} />
          <MacroCell dot="bg-nourish" label="Fat" value={nutrition.fatG} goal={goals.fatG} pct={macroPct(nutrition.fatG, goals.fatG)} />
        </div>
      </section>

      {/* Quick actions. */}
      <div className="flex items-center gap-2">
        <Button
          accent="nourish"
          size="lg"
          className="flex-1"
          icon={<Plus size={17} />}
          onClick={() => onOpenSheet({ kind: 'add-meal' })}
        >
          Log meal
        </Button>
        <button
          type="button"
          title="Log 250ml of water"
          aria-label="Log 250ml of water"
          onClick={addWater}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-2 transition-colors hover:bg-surface-2"
        >
          <Droplets size={18} />
        </button>
      </div>

      {/* Hydration. */}
      <section className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface-2 text-focus">
            <Droplets size={19} />
          </span>
          <div className="min-w-0">
            <p className="text-[0.875rem] font-medium text-ink">
              Hydration{' '}
              <span className="font-tech text-[0.75rem] font-medium text-focus">{waterPct}%</span>
            </p>
            <p className="font-tech mt-0.5 text-[0.75rem] text-ink-3">
              {formatMl(waterMl)} of {formatMl(settings.hydrationGoalMl)} goal
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={addWater}
          className="flex h-11 flex-shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface-2 px-4 text-[0.8125rem] font-medium text-ink-2 transition-colors hover:bg-surface-3"
        >
          <Plus size={15} /> 250ml
        </button>
      </section>

      {/* Intake log. */}
      <section>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[1.125rem] font-semibold tracking-tight text-ink">
            Today&apos;s intake
          </h3>
          {meals.length > 0 && (
            <span className="font-tech text-[0.6875rem] text-ink-3">
              {nutrition.logged} logged
              {nutrition.planned > 0 ? ` · ${nutrition.planned} planned` : ''}
            </span>
          )}
        </div>
        {meals.length === 0 ? (
          <div className="mt-3 rounded-[var(--radius-card)] border border-line bg-surface">
            <EmptyState
              title="Nothing logged yet"
              body="The day is unwritten — log your first meal to light the ring."
            />
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {meals.map((meal) => (
              <MealRow
                key={meal.id}
                meal={meal}
                onEdit={() => onOpenSheet({ kind: 'edit-meal', mealId: meal.id })}
                onRemove={() => dispatch({ type: 'meal/remove', id: meal.id })}
                onMarkEaten={() =>
                  dispatch({
                    type: 'meal/edit',
                    id: meal.id,
                    name: meal.name,
                    kind: meal.kind,
                    calories: meal.calories,
                    proteinG: meal.proteinG,
                    carbsG: meal.carbsG,
                    fatG: meal.fatG,
                    planned: false,
                  })
                }
              />
            ))}
          </ul>
        )}
      </section>

      {/* Mindful note. */}
      <section className="flex items-start gap-3.5 rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-nourish-soft text-nourish">
          <Leaf size={18} />
        </span>
        <div>
          <p className="text-[0.875rem] font-medium text-ink">Eat like it counts</p>
          <p className="mt-1 text-[0.8125rem] leading-5 text-ink-2">
            Step away from screens for a few minutes during meals — satiety signals arrive
            late, and they whisper.
          </p>
        </div>
      </section>
    </div>
  );
}

function MacroCell({
  dot,
  label,
  value,
  goal,
  pct,
}: {
  dot: string;
  label: string;
  value: number;
  goal: number;
  pct: number;
}) {
  return (
    <div className="rounded-xl bg-canvas p-2.5">
      <p className="flex items-center gap-1.5 text-[0.6875rem] text-ink-3">
        <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
        {label}
      </p>
      <p className="font-tech tnum mt-1 text-[0.875rem] font-medium text-ink">
        {value}
        <span className="text-[0.6875rem] text-ink-3">/{goal}g</span>
      </p>
      <p className="font-tech mt-0.5 text-[0.6875rem] text-ink-3">{pct}%</p>
    </div>
  );
}

function MealRow({
  meal,
  onEdit,
  onRemove,
  onMarkEaten,
}: {
  meal: MealRecord;
  onEdit: () => void;
  onRemove: () => void;
  onMarkEaten: () => void;
}) {
  return (
    <li
      className={`flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-4 ${
        meal.planned ? 'opacity-70' : ''
      }`}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="flex items-center gap-2 text-[0.6875rem]">
          <span className="font-tech text-ink-3">{formatTime(meal.loggedAt)}</span>
          <span className="h-1 w-1 rounded-full bg-ink-3" aria-hidden />
          <span className={meal.planned ? 'italic text-ink-3' : 'text-nourish'}>
            {meal.planned ? 'Planned' : kindLabel(meal.kind)}
          </span>
        </p>
        <p className="mt-0.5 truncate text-[0.875rem] font-medium text-ink">{meal.name}</p>
        <p className="font-tech mt-1 text-[0.6875rem] text-ink-3">
          {meal.proteinG}g P · {meal.carbsG}g C · {meal.fatG}g F
        </p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-1">
        <div className="mr-1 text-right">
          <p className="font-tech tnum text-[0.875rem] font-semibold text-ink">
            {meal.planned ? `~${meal.calories}` : meal.calories}
          </p>
          <p className="text-[0.6875rem] text-ink-3">kcal</p>
        </div>
        {meal.planned && (
          <button
            type="button"
            aria-label={`Mark ${meal.name} as eaten`}
            title="Mark as eaten"
            onClick={onMarkEaten}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-nourish transition-colors hover:bg-surface-2"
          >
            <Check size={15} />
          </button>
        )}
        <button
          type="button"
          aria-label={`Edit ${meal.name}`}
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-surface-2"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          aria-label={`Remove ${meal.name}`}
          onClick={onRemove}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-surface-2"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </li>
  );
}
