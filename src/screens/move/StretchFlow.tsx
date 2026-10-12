import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronRight, Minus, Plus, Wind, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { ExerciseArt } from '../../components/ExerciseArt';
import { Ring } from '../../components/Ring';
import { Card, SectionLabel } from '../../components/Card';
import { FilterChip } from '../../components/Chip';
import { useStore } from '../../state/store';
import { useWakeLock } from '../../lib/useWakeLock';
import { newId } from '../../lib/id';
import { getExercise } from '../../data/exercises';
import { STRETCH_GOAL_LABELS, stretchSequence } from '../../data/workouts';
import type { SessionRecord, StretchGoal } from '../../types';
import { formatClock } from '../../lib/format';

const GOALS: StretchGoal[] = ['flexibility', 'back', 'shoulder', 'mobility'];
const TIME_OPTIONS = [5, 10, 15];
const TRANSITION_SECONDS = 10;

interface StretchFlowProps {
  onClose: () => void;
}

export function StretchFlow({ onClose }: StretchFlowProps) {
  const { state, dispatch } = useStore();
  const [phase, setPhase] = useState<'onboarding' | 'hold' | 'transition' | 'done'>(
    state.settings.stretchOnboardingDone ? 'hold' : 'onboarding',
  );
  const [goal, setGoal] = useState<StretchGoal>(state.settings.stretchGoal);
  const [minutes, setMinutes] = useState(10);
  const [index, setIndex] = useState(0);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [holdTotal, setHoldTotal] = useState(30_000);
  const startedAt = useRef(Date.now());

  useWakeLock(phase === 'hold' || phase === 'transition');

  const sequence = useMemo(() => stretchSequence(goal, minutes), [goal, minutes]);
  const currentId = sequence[Math.min(index, sequence.length - 1)]!;
  const nextId = sequence[index + 1];
  const current = getExercise(currentId);
  const next = nextId ? getExercise(nextId) : undefined;

  // One interval drives both the hold and the transition countdowns.
  useEffect(() => {
    if (phase !== 'hold' && phase !== 'transition') return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (endsAt == null) return;
    if (now < endsAt) return;
    if (phase === 'hold') {
      if (index + 1 >= sequence.length) {
        setPhase('done');
      } else {
        setPhase('transition');
        setEndsAt(Date.now() + TRANSITION_SECONDS * 1000);
      }
    } else if (phase === 'transition') {
      setIndex((i) => i + 1);
      setPhase('hold');
      setEndsAt(null);
    }
  }, [now, endsAt, phase, index, sequence.length]);

  // Starting a hold arms its own countdown.
  useEffect(() => {
    if (phase !== 'hold') return;
    const holdSeconds = current?.holdSeconds ?? 30;
    setHoldTotal(holdSeconds * 1000);
    setEndsAt(Date.now() + holdSeconds * 1000);
  }, [phase, current]);

  const remaining = endsAt != null ? Math.max(0, endsAt - now) : 0;
  const record = (completed: boolean) => {
    const entry: SessionRecord = {
      id: newId('sess'),
      name: `Stretch · ${STRETCH_GOAL_LABELS[goal].label}`,
      kind: 'stretch',
      completedAt: Date.now(),
      durationMin: Math.max(1, Math.round((Date.now() - startedAt.current) / 60_000)),
      exerciseCount: completed ? sequence.length : Math.max(1, index),
      muscles: ['Mobility'],
    };
    dispatch({ type: 'session/record', record: entry });
  };

  /* ------------------------------------------------------------ onboarding */

  if (phase === 'onboarding') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
        <header className="flex h-14 items-center justify-between px-4 pt-safe">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
            Guided stretch
          </span>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-2"
          >
            <X size={20} />
          </button>
        </header>
        <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-8">
          <h1 className="mt-2 text-[1.5rem] font-medium leading-8 text-ink">
            Two questions, then we start.
          </h1>
          <p className="mt-2 text-[0.8125rem] leading-5 text-ink-2">
            Stretching is not the warm-up act. Tell me what you need from it and I will build the
            sequence.
          </p>

          <div className="mt-6">
            <SectionLabel className="mb-2.5 block">What is your main goal?</SectionLabel>
            <div className="space-y-2">
              {GOALS.map((option) => {
                const meta = STRETCH_GOAL_LABELS[option];
                const selected = goal === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setGoal(option)}
                    aria-pressed={selected}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                      selected ? 'border-transparent bg-focus-soft' : 'border-line bg-surface'
                    }`}
                  >
                    <span>
                      <span
                        className={`block text-[0.875rem] font-medium ${selected ? 'text-focus' : 'text-ink'}`}
                      >
                        {meta.label}
                      </span>
                      <span className="mt-0.5 block text-[0.75rem] text-ink-3">{meta.blurb}</span>
                    </span>
                    {selected && <Check size={17} className="text-focus" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <SectionLabel className="mb-2.5 block">How much time do you have?</SectionLabel>
            <div className="flex flex-wrap items-center gap-2">
              {TIME_OPTIONS.map((option) => (
                <FilterChip
                  key={option}
                  accent="focus"
                  selected={minutes === option}
                  onClick={() => setMinutes(option)}
                >
                  {option} min
                </FilterChip>
              ))}
              <div className="flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-1">
                <button
                  type="button"
                  aria-label="Less time"
                  onClick={() => setMinutes((m) => Math.max(3, m - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-2"
                >
                  <Minus size={14} />
                </button>
                <span className="tnum w-14 text-center text-[0.75rem] text-ink-2">
                  Custom {minutes}
                </span>
                <button
                  type="button"
                  aria-label="More time"
                  onClick={() => setMinutes((m) => Math.min(40, m + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-2"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <p className="mt-3 text-[0.75rem] text-ink-3">
              {sequence.length} movements · about {minutes} minutes with transitions.
            </p>
          </div>
        </div>

        <div className="px-4 pb-8 pb-safe">
          <Button
            accent="focus"
            block
            size="lg"
            onClick={() => {
              dispatch({
                type: 'settings/patch',
                patch: { stretchGoal: goal, stretchOnboardingDone: true },
              });
              setPhase('hold');
            }}
          >
            Start stretching
          </Button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ done */

  if (phase === 'done') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-focus-soft">
            <Wind size={26} className="text-focus" />
          </div>
          <h2 className="text-[1.375rem] font-medium text-ink">Sequence complete</h2>
          <p className="mt-2 max-w-[30ch] text-[0.8125rem] leading-5 text-ink-2">
            {sequence.length} movements ·{' '}
            {Math.max(1, Math.round((Date.now() - startedAt.current) / 60_000))} min
          </p>
          <p className="mt-4 max-w-[32ch] text-[0.75rem] leading-5 text-ink-3">
            Notice where you feel looser than when you started. That is the part worth repeating.
          </p>
        </div>
        <div className="px-4 pb-10 pb-safe">
          <Button
            accent="focus"
            block
            size="lg"
            onClick={() => {
              record(true);
              onClose();
            }}
          >
            Save session
          </Button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ play */

  const inTransition = phase === 'transition';
  const shown = inTransition && next ? next : current!;
  const holdSeconds = current?.holdSeconds ?? 30;
  const progress = inTransition
    ? 1 - remaining / (TRANSITION_SECONDS * 1000)
    : 1 - remaining / holdTotal;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
      <header className="flex items-center justify-between px-4 pt-safe">
        <div className="flex h-14 items-center gap-3">
          <button
            type="button"
            aria-label="End stretch session"
            onClick={onClose}
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-2"
          >
            <X size={20} />
          </button>
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
              {STRETCH_GOAL_LABELS[goal].label}
            </p>
            <p className="tnum text-[0.75rem] text-ink-2">
              {index + 1} of {sequence.length}
            </p>
          </div>
        </div>
        <span className="tnum text-[0.75rem] text-ink-3">
          {formatClock(Date.now() - startedAt.current)}
        </span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        {inTransition ? (
          <>
            <SectionLabel className="mb-4 block">Next up</SectionLabel>
            <ExerciseArt exercise={shown} size={120} rounded="rounded-[1.75rem]" />
            <h1 className="mt-5 text-[1.5rem] font-medium leading-8 text-ink">{shown.name}</h1>
            <p className="mt-2 max-w-[28ch] text-[0.8125rem] leading-5 text-ink-2">
              {shown.instructions[0]}
            </p>
            <p className="tnum mt-6 text-[0.8125rem] text-ink-3">
              Starting in {Math.ceil(remaining / 1000)}s
            </p>
            <Button
              accent="focus"
              variant="soft"
              className="mt-4"
              onClick={() => {
                setIndex((i) => i + 1);
                setPhase('hold');
                setEndsAt(null);
              }}
              icon={<ChevronRight size={16} />}
            >
              Start now
            </Button>
            <div className="mt-8 w-40">
              <div className="h-1 w-full overflow-hidden rounded-full bg-track">
                <div
                  className="h-full rounded-full bg-focus transition-[width] duration-300"
                  style={{ width: `${Math.min(100, progress * 100)}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <Ring
              progress={progress}
              color="var(--focus)"
              size={230}
              stroke={9}
              glow
              label={`${holdSeconds} second hold`}
            >
              <span className="tnum text-[2.5rem] font-semibold leading-none text-ink">
                {Math.ceil(remaining / 1000)}
              </span>
              <span className="mt-2 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ink-3">
                seconds
              </span>
            </Ring>
            <h1 className="mt-6 text-[1.5rem] font-medium leading-8 text-ink">{current?.name}</h1>
            <p className="mt-2 max-w-[30ch] text-[0.8125rem] leading-5 text-ink-2">
              {current?.instructions[1] ?? current?.instructions[0]}
            </p>
          </>
        )}
      </div>

      <div className="px-4 pb-8 pb-safe">
        {!inTransition && (
          <Card className="mb-3 border-line bg-surface" pad="sm">
            <p className="text-[0.75rem] leading-5 text-ink-3">
              {current?.instructions.at(-1)}
            </p>
          </Card>
        )}
        <Button
          accent="focus"
          variant="ghost"
          block
          onClick={() => {
            if (index + 1 >= sequence.length) {
              setPhase('done');
              return;
            }
            setIndex((i) => i + 1);
            setPhase('hold');
            setEndsAt(null);
          }}
        >
          Skip to next
        </Button>
      </div>
    </div>
  );
}
