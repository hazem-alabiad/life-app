import { useMemo, useState } from 'react';
import { Check, Minus, Plus, Search, X } from 'lucide-react';
import { Sheet } from '../../components/Sheet';
import { Button } from '../../components/Button';
import { ExerciseArt } from '../../components/ExerciseArt';
import { SectionLabel } from '../../components/Card';
import { useStore } from '../../state/store';
import { STRENGTH_EXERCISES, getExercise } from '../../data/exercises';
import { buildWorkout, estimateDuration, WORKOUT_TEMPLATES } from '../../data/workouts';
import { parseDateKey } from '../../lib/date';
import type { WorkoutItem } from '../../types';

interface BuilderProps {
  day: string;
  onClose: () => void;
  onStart: (workout: ReturnType<typeof buildWorkout>) => void;
}

export function WorkoutBuilderSheet({ day, onClose, onStart }: BuilderProps) {
  const { dispatch } = useStore();
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<WorkoutItem[]>([]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STRENGTH_EXERCISES.slice(0, 12);
    return STRENGTH_EXERCISES.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.bodyPart.toLowerCase().includes(q) ||
        e.target.toLowerCase().includes(q),
    ).slice(0, 20);
  }, [query]);

  const add = (exerciseId: string) =>
    setItems((prev) =>
      prev.some((i) => i.exerciseId === exerciseId)
        ? prev
        : [...prev, { exerciseId, sets: 3 }],
    );

  const setSets = (exerciseId: string, delta: number) =>
    setItems((prev) =>
      prev.map((i) =>
        i.exerciseId === exerciseId
          ? { ...i, sets: Math.min(8, Math.max(1, i.sets + delta)) }
          : i,
      ),
    );

  const totalSets = items.reduce((sum, i) => sum + i.sets, 0);
  const canSave = items.length > 0;

  const finalName = name.trim() || (items.length === 1 ? getExercise(items[0]!.exerciseId)?.name ?? 'Custom session' : 'Custom session');

  const save = (startNow: boolean) => {
    const workout = buildWorkout(finalName, items);
    dispatch({ type: 'schedule/add', day, workout });
    if (startNow) onStart(workout);
    else onClose();
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title="Build a workout"
      subtitle={`Adding to ${parseDateKey(day).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}`}
      footer={
        <div className="flex gap-2">
          <Button
            accent="move"
            className="flex-1"
            disabled={!canSave}
            icon={<Check size={16} />}
            onClick={() => save(false)}
          >
            Save
          </Button>
          <Button accent="move" variant="ghost" disabled={!canSave} onClick={() => save(true)}>
            Start now
          </Button>
        </div>
      }
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name it (optional)"
        aria-label="Workout name"
        className="h-12 w-full rounded-2xl border border-line bg-field px-4 text-[0.875rem] text-ink placeholder:text-ink-3 focus:border-move/50"
      />

      {WORKOUT_TEMPLATES.length > 0 && items.length === 0 && (
        <div className="mt-4">
          <SectionLabel className="mb-2.5 block">Or start from a plan</SectionLabel>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {WORKOUT_TEMPLATES.slice(0, 5).map((template) => (
              <button
                key={template.name}
                type="button"
                onClick={() =>
                  setItems(template.items.map(([exerciseId, sets]) => ({ exerciseId, sets })))
                }
                className="flex-shrink-0 rounded-2xl border border-line bg-surface px-3.5 py-2.5 text-left"
              >
                <span className="block text-[0.75rem] font-medium text-ink">{template.name}</span>
                <span className="mt-0.5 block text-[0.6875rem] text-ink-3">
                  {template.items.length} movements
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <SectionLabel>In this session</SectionLabel>
            <span className="tnum text-[0.6875rem] text-ink-3">
              {items.length} movements · ~{estimateDuration(items)} min
            </span>
          </div>
          <ul className="space-y-2">
            {items.map((item) => {
              const exercise = getExercise(item.exerciseId);
              if (!exercise) return null;
              return (
                <li
                  key={item.exerciseId}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-2.5"
                >
                  <ExerciseArt exercise={exercise} size={38} rounded="rounded-lg" animated={false} />
                  <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-ink">
                    {exercise.name}
                  </span>
                  <span className="flex flex-shrink-0 items-center gap-0.5 rounded-full border border-line bg-field p-0.5">
                    <button
                      type="button"
                      aria-label={`Fewer sets of ${exercise.name}`}
                      onClick={() => setSets(item.exerciseId, -1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-ink-2"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="tnum w-6 text-center text-[0.75rem] text-ink">{item.sets}</span>
                    <button
                      type="button"
                      aria-label={`More sets of ${exercise.name}`}
                      onClick={() => setSets(item.exerciseId, 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-ink-2"
                    >
                      <Plus size={13} />
                    </button>
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${exercise.name}`}
                    onClick={() =>
                      setItems((prev) => prev.filter((i) => i.exerciseId !== item.exerciseId))
                    }
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-ink-3"
                  >
                    <X size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-5">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search movements"
            aria-label="Search movements to add"
            className="h-11 w-full rounded-full border border-line bg-field pl-10 pr-4 text-[0.8125rem] text-ink placeholder:text-ink-3 focus:border-move/50"
          />
        </div>
        <ul className="mt-3 space-y-1.5">
          {results.map((exercise) => {
            const selected = items.some((i) => i.exerciseId === exercise.id);
            return (
              <li key={exercise.id}>
                <button
                  type="button"
                  onClick={() => (selected ? undefined : add(exercise.id))}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left ${
                    selected ? 'border-transparent bg-move-soft' : 'border-line bg-surface'
                  }`}
                >
                  <ExerciseArt exercise={exercise} size={36} rounded="rounded-lg" animated={false} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.8125rem] text-ink">{exercise.name}</span>
                    <span className="mt-0.5 block text-[0.6875rem] text-ink-3">{exercise.target}</span>
                  </span>
                  {selected ? (
                    <Check size={15} className="flex-shrink-0 text-move" />
                  ) : (
                    <Plus size={15} className="flex-shrink-0 text-ink-3" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        {totalSets > 0 && (
          <p className="mt-3 text-[0.6875rem] text-ink-3">
            {totalSets} sets planned. Rest is timed for you between them.
          </p>
        )}
      </div>
    </Sheet>
  );
}
