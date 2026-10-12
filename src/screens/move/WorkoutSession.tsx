import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Plus, SkipForward, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { ExerciseArt } from '../../components/ExerciseArt';
import { Ring } from '../../components/Ring';
import { SectionLabel } from '../../components/Card';
import { useStore } from '../../state/store';
import { useWakeLock } from '../../lib/useWakeLock';
import { newId } from '../../lib/id';
import { getExercise, EXERCISES_BY_ID } from '../../data/exercises';
import { musclesFor } from '../../data/workouts';
import type { Workout } from '../../types';
import { formatClock } from '../../lib/format';

const DEFAULT_REST_SECONDS = 75;

interface WorkoutSessionProps {
  workout: Workout;
  onClose: () => void;
}

export function WorkoutSession({ workout, onClose }: WorkoutSessionProps) {
  const { dispatch } = useStore();
  useWakeLock(true);

  const [index, setIndex] = useState(0);
  const [setsDone, setSetsDone] = useState<boolean[][]>(() =>
    workout.items.map((item) => Array.from({ length: item.sets }, () => false)),
  );
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const [restTotal, setRestTotal] = useState(DEFAULT_REST_SECONDS * 1000);
  const [now, setNow] = useState(() => Date.now());
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(Date.now());

  const item = workout.items[index]!;
  const exercise = getExercise(item.exerciseId);
  const done = setsDone[index] ?? [];

  const completedSets = useMemo(
    () => setsDone.reduce((sum, list) => sum + list.filter(Boolean).length, 0),
    [setsDone],
  );
  const totalSets = workout.items.reduce((sum, i) => sum + i.sets, 0);
  const movementsDone = setsDone.filter((list) => list.some(Boolean)).length;

  useEffect(() => {
    if (restEndsAt == null) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [restEndsAt]);

  useEffect(() => {
    if (restEndsAt != null && now >= restEndsAt) setRestEndsAt(null);
  }, [now, restEndsAt]);

  const restRemaining = restEndsAt != null ? Math.max(0, restEndsAt - now) : 0;
  const resting = restEndsAt != null;
  const elapsedMs = Date.now() - startedAt.current;

  const toggleSet = (setIndex: number) => {
    setSetsDone((prev) => {
      const next = prev.map((list) => [...list]);
      const target = next[index];
      if (!target) return prev;
      const turningOn = !target[setIndex];
      target[setIndex] = turningOn;

      // Rest only makes sense between sets, never after the final one.
      const remainingAfter = next[index]!.filter(Boolean).length;
      const isLastSet = remainingAfter >= (workout.items[index]?.sets ?? 0);
      if (turningOn && !isLastSet) {
        setRestTotal(DEFAULT_REST_SECONDS * 1000);
        setRestEndsAt(Date.now() + DEFAULT_REST_SECONDS * 1000);
      }
      return next;
    });
  };

  const logSession = () => {
    dispatch({
      type: 'session/record',
      record: {
        id: newId('sess'),
        name: workout.name,
        kind: 'workout',
        completedAt: Date.now(),
        durationMin: Math.max(1, Math.round((Date.now() - startedAt.current) / 60_000)),
        exerciseCount: Math.max(1, movementsDone),
        muscles: musclesFor(workout.items),
      },
    });
    setFinished(true);
  };

  if (finished) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-move-soft">
            <Check size={28} className="text-move" />
          </div>
          <h2 className="text-[1.375rem] font-medium text-ink">Session logged</h2>
          <p className="mt-2 max-w-[30ch] text-[0.8125rem] leading-5 text-ink-2">
            {movementsDone} movement{movementsDone === 1 ? '' : 's'} ·{' '}
            {completedSets} of {totalSets} sets ·{' '}
            {Math.max(1, Math.round((Date.now() - startedAt.current) / 60_000))} min
          </p>
          <p className="mt-4 max-w-[32ch] text-[0.75rem] leading-5 text-ink-3">
            Nothing to chase here. Recovery is where the work lands.
          </p>
        </div>
        <div className="px-4 pb-10 pb-safe">
          <Button accent="move" block size="lg" onClick={onClose}>
            Back to schedule
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
      <header className="flex items-center justify-between px-4 pt-safe">
        <div className="flex h-14 items-center gap-3">
          <button
            type="button"
            aria-label="End session"
            onClick={onClose}
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-2"
          >
            <X size={20} />
          </button>
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
              {workout.name}
            </p>
            <p className="tnum text-[0.75rem] text-ink-2">
              Movement {index + 1} of {workout.items.length} · {completedSets}/{totalSets} sets
            </p>
          </div>
        </div>
        <span className="tnum text-[0.75rem] text-ink-3">{formatClock(elapsedMs)}</span>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-4 pb-40">
        {/* The movement, large enough to read from across the room. */}
        <div className="flex flex-col items-center pt-4 text-center">
          <ExerciseArt exercise={exercise ?? EXERCISES_BY_ID['plank']!} size={168} rounded="rounded-[2rem]" />
          <h1 className="mt-5 text-[1.5rem] font-medium leading-8 text-ink">{exercise?.name}</h1>
          <p className="mt-1 text-[0.8125rem] text-ink-2">
            {exercise?.target} · {exercise?.recommended}
          </p>
        </div>

        {/* Instructions stay folded until asked for. */}
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setInstructionsOpen((v) => !v)}
            aria-expanded={instructionsOpen}
            className="flex w-full items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3 text-left"
          >
            <SectionLabel>How it should feel</SectionLabel>
            <ChevronDown
              size={16}
              className={`text-ink-3 transition-transform ${instructionsOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {instructionsOpen && (
            <ol className="mt-2 space-y-2 rounded-2xl border border-line bg-surface px-4 py-4">
              {exercise?.instructions.map((line, i) => (
                <li key={line} className="flex gap-3 text-[0.8125rem] leading-5 text-ink-2">
                  <span className="tnum flex-shrink-0 text-ink-3">{i + 1}</span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Set tracker: numbered buttons, one tap each. */}
        <div className="mt-5">
          <SectionLabel className="mb-2.5 block">Sets</SectionLabel>
          <div className="flex flex-wrap gap-2.5">
            {done.map((isDone, setIndex) => (
              <button
                key={setIndex}
                type="button"
                onClick={() => toggleSet(setIndex)}
                aria-pressed={isDone}
                aria-label={`Set ${setIndex + 1}${isDone ? ', done' : ''}`}
                className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-[0.9375rem] font-semibold transition-colors ${
                  isDone
                    ? 'border-transparent bg-move text-move-ink'
                    : 'border-line bg-surface text-ink-2'
                }`}
              >
                {isDone ? <Check size={20} /> : setIndex + 1}
              </button>
            ))}
          </div>
          {done.every(Boolean) && index < workout.items.length - 1 && (
            <p className="mt-3 text-[0.75rem] text-move">
              All sets done — move to the next movement when you are ready.
            </p>
          )}
        </div>

        {/* Rest runs itself between sets, and gets out of the way. */}
        {resting && (
          <div className="mt-6 flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-4">
            <Ring
              progress={1 - restRemaining / restTotal}
              color="var(--ink-3)"
              size={64}
              stroke={5}
              label="Rest"
            >
              <span className="tnum text-[0.8125rem] font-semibold text-ink">
                {Math.ceil(restRemaining / 1000)}
              </span>
            </Ring>
            <div className="min-w-0 flex-1">
              <p className="text-[0.8125rem] font-medium text-ink">Resting</p>
              <p className="mt-0.5 text-[0.75rem] text-ink-3">
                Breathe out slowly. Next set when you are steady.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setRestEndsAt((prev) => (prev ?? Date.now()) + 20_000)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-3 text-ink-2"
                aria-label="Add twenty seconds of rest"
              >
                <Plus size={15} />
              </button>
              <button
                type="button"
                onClick={() => setRestEndsAt(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-3 text-ink-2"
                aria-label="Skip rest"
              >
                <SkipForward size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Movement navigation. */}
        <div className="mt-6 flex gap-2">
          <Button
            accent="move"
            variant="ghost"
            size="sm"
            className="flex-1"
            disabled={index === 0}
            icon={<ChevronLeft size={15} />}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            Previous
          </Button>
          <Button
            accent="move"
            variant="ghost"
            size="sm"
            className="flex-1"
            disabled={index >= workout.items.length - 1}
            onClick={() => setIndex((i) => Math.min(workout.items.length - 1, i + 1))}
          >
            Next <ChevronRight size={15} />
          </Button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end p-4 pb-8 pb-safe">
        <Button
          accent="move"
          size="lg"
          className="pointer-events-auto"
          icon={<Check size={18} />}
          onClick={logSession}
        >
          Finish
        </Button>
      </div>
    </div>
  );
}
