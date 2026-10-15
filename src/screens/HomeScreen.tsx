import {
  Droplets,
  Pause,
  Play,
  Sparkles,
  Wind,
} from 'lucide-react';
import { CONTAINER } from '../components/TopBar';
import { Button } from '../components/Button';
import { useStore } from '../state/store';
import type { SheetKind, TabId, Workout } from '../types';
import { formatClock } from '../lib/format';
import { formatFullDate } from '../lib/date';
import { addDays, dateKey, weekdayShort } from '../lib/date';
import {
  activeDayKeys,
  dayNutrition,
  focusTodayMs,
  hydrationForDay,
  nextWorkout,
  rhythmCount,
  weekWorkoutStats,
} from '../lib/selectors';

interface HomeScreenProps {
  onNavigate: (tab: TabId) => void;
  onOpenSheet: (sheet: SheetKind) => void;
  onStartWorkout: (workout: Workout) => void;
  onStartStretch: () => void;
}

function greeting(d: Date): string {
  const h = d.getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function HomeScreen({ onNavigate, onOpenSheet, onStartWorkout, onStartStretch }: HomeScreenProps) {
  const { state, now } = useStore();
  const today = new Date(now);

  const stats = weekWorkoutStats(state, today);
  const timerVisible = state.timer.status !== 'idle';

  const focusLine = timerVisible
    ? 'Focus sprint active, daily movement on track'
    : stats.done > 0
      ? 'Movement logged today — keep the rhythm'
      : 'Daily movement on track';

  return (
    <div className={`${CONTAINER} pb-40 lg:pb-16`}>
      {/* Greeting header + Peak Flow replacement: the app's own summary line. */}
      <div className="pb-8 pt-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-ink lg:text-[2.75rem]">
              {greeting(today)}, Hazem
            </h1>
            <p className="mt-1.5 text-[0.875rem] text-ink-2">
              {formatFullDate(today)} · {focusLine}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2 text-[0.75rem] font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-nourish" aria-hidden />
            <span className="text-nourish">Rhythm on track</span>
          </div>
        </div>
      </div>

      {/* Up next — the single most likely action, so the day starts with one
          decision instead of three. */}
      <UpNext
        onNavigate={onNavigate}
        onStartWorkout={onStartWorkout}
      />

      {/* Daily equilibrium: the three pillars as one glanceable ring stack.
          Each pillar is a door into its module. */}
      <Equilibrium onNavigate={onNavigate} />

      {/* 7-day harmony strip + quick desk widgets. */}
      <Harmony />
      <QuickWidgets onNavigate={onNavigate} />

      {/* One insight card, never more. */}
      <button
        type="button"
        onClick={() => onOpenSheet({ kind: 'insight' })}
        className="flex w-full items-start gap-3.5 rounded-[var(--radius-card)] border border-line bg-surface p-5 text-left transition-colors hover:bg-surface-2"
      >
        <span className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-nourish-soft text-nourish">
          <Sparkles size={19} />
        </span>
        <span>
          <span className="font-tech block text-[0.6875rem] uppercase tracking-[0.14em] text-nourish">
            Daily insight
          </span>
          <span className="mt-1 block text-[0.8125rem] leading-5 text-ink-2">
            Open today&apos;s note — one thought on recovery, rhythm, or rest.
          </span>
        </span>
      </button>

      {/* Today's Timeline — the day assembled from what already happened and
          what is queued, chronologically. */}
      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-tight text-ink">
          Today&apos;s Timeline
        </h2>
        <button
          type="button"
          onClick={onStartStretch}
          className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-ink-2 transition-colors hover:text-ink"
        >
          <Sparkles size={14} className="text-focus" /> Launch 5m Posture Reset
        </button>
      </div>

      <div className="mt-3 overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
        <TimelineList
          onNavigate={onNavigate}
          onStartWorkout={onStartWorkout}
        />
      </div>
    </div>
  );
}

/** Three concentric pillar rings with a shared centre readout. */
function TriRings({ move, focus, fuel }: { move: number; focus: number; fuel: number }) {
  const ring = (r: number, progress: number, color: string) => {
    const circumference = 2 * Math.PI * r;
    const clamped = Math.min(1, Math.max(0, progress));
    return (
      <g key={color}>
        <circle cx="60" cy="60" r={r} fill="transparent" stroke="var(--track)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="transparent"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          style={{ transition: 'stroke-dashoffset 500ms cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </g>
    );
  };
  return (
    <svg viewBox="0 0 120 120" className="h-44 w-44 -rotate-90" role="img" aria-label="Daily equilibrium rings">
      {ring(52, move, 'var(--move)')}
      {ring(41, focus, 'var(--focus)')}
      {ring(30, fuel, 'var(--nourish)')}
    </svg>
  );
}

function Equilibrium({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const { state, now } = useStore();
  const today = new Date(now);
  const stats = weekWorkoutStats(state, today);
  const focusGoalMin = Math.max(1, state.settings.pomodoroMin * state.settings.sessionsBeforeLong);
  const focusMin = Math.round(focusTodayMs(state, today) / 60_000);
  const nutrition = dayNutrition(state, today);

  const move = stats.goal > 0 ? stats.done / stats.goal : 0;
  const focus = focusMin / focusGoalMin;
  const fuel = state.settings.dailyCalorieGoal > 0 ? nutrition.calories / state.settings.dailyCalorieGoal : 0;
  const average = (Math.min(1, move) + Math.min(1, focus) + Math.min(1, fuel)) / 3;
  const word = average >= 0.66 ? 'Balanced' : average >= 0.33 ? 'Building' : 'Quiet start';

  return (
    <section className="mt-4 rounded-[var(--radius-card)] border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-tech text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">
            Tri-pillar telemetry
          </p>
          <h2 className="mt-0.5 font-display text-[1.0625rem] font-semibold text-ink">
            Daily equilibrium
          </h2>
        </div>
        <span className="font-tech rounded-full bg-surface-3 px-2.5 py-1 text-[0.6875rem] text-ink-2">
          {word}
        </span>
      </div>

      <div className="relative mt-2 flex items-center justify-center">
        <TriRings move={move} focus={focus} fuel={fuel} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-ink-3">
            Equilibrium
          </span>
          <span className="font-tech tnum text-[1.75rem] font-semibold leading-none text-ink">
            {Math.round(average * 100)}%
          </span>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onNavigate('move')}
          className="rounded-2xl bg-canvas p-2.5 text-left transition-colors hover:bg-surface-2"
        >
          <p className="flex items-center gap-1.5 text-[0.6875rem] text-ink-3">
            <span className="h-2 w-2 rounded-full bg-move" aria-hidden /> Move
          </p>
          <p className="font-tech tnum mt-1 text-[0.875rem] font-medium text-ink">
            {stats.done}
            <span className="text-[0.6875rem] text-ink-3">/{stats.goal} sess</span>
          </p>
          <p className="font-tech mt-0.5 text-[0.6875rem] text-move">{Math.round(Math.min(1, move) * 100)}%</p>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('focus')}
          className="rounded-2xl bg-canvas p-2.5 text-left transition-colors hover:bg-surface-2"
        >
          <p className="flex items-center gap-1.5 text-[0.6875rem] text-ink-3">
            <span className="h-2 w-2 rounded-full bg-focus" aria-hidden /> Focus
          </p>
          <p className="font-tech tnum mt-1 text-[0.875rem] font-medium text-ink">
            {focusMin}
            <span className="text-[0.6875rem] text-ink-3">/{focusGoalMin}m</span>
          </p>
          <p className="font-tech mt-0.5 text-[0.6875rem] text-focus">{Math.round(Math.min(1, focus) * 100)}%</p>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('fuel')}
          className="rounded-2xl bg-canvas p-2.5 text-left transition-colors hover:bg-surface-2"
        >
          <p className="flex items-center gap-1.5 text-[0.6875rem] text-ink-3">
            <span className="h-2 w-2 rounded-full bg-nourish" aria-hidden /> Fuel
          </p>
          <p className="font-tech tnum mt-1 text-[0.875rem] font-medium text-ink">
            {nutrition.calories.toLocaleString()}
            <span className="text-[0.6875rem] text-ink-3"> kcal</span>
          </p>
          <p className="font-tech mt-0.5 text-[0.6875rem] text-nourish">{Math.round(Math.min(1, fuel) * 100)}%</p>
        </button>
      </div>
    </section>
  );
}

function Harmony() {
  const { state, now } = useStore();
  const today = new Date(now);
  const active = activeDayKeys(state);
  const rhythm = rhythmCount(state, today);
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

  return (
    <section className="mt-4 rounded-[var(--radius-card)] border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="font-tech text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">
          7-day harmony
        </p>
        <span className="font-tech text-[0.6875rem] font-medium text-nourish">
          {rhythm > 0 ? `${rhythm}-day rhythm` : 'a fresh page'}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {days.map((day) => {
          const isToday = dateKey(day) === dateKey(today);
          const lit = active.has(dateKey(day));
          return (
            <div
              key={dateKey(day)}
              className={`flex flex-col items-center rounded-xl py-2 ${
                isToday ? 'bg-nourish-soft/40' : 'bg-canvas'
              }`}
            >
              <span className={`text-[0.6875rem] ${isToday ? 'font-semibold text-nourish' : 'text-ink-3'}`}>
                {weekdayShort(day)[0]}
              </span>
              <span className={`font-tech mt-0.5 text-[0.75rem] ${isToday ? 'font-bold text-nourish' : 'text-ink-2'}`}>
                {day.getDate()}
              </span>
              <span
                className={`mt-1.5 h-1.5 w-1.5 rounded-full ${lit ? 'bg-nourish' : 'bg-track'}`}
                aria-hidden
              />
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[0.75rem] text-ink-3">
        Consistency over intensity — rhythm beats streaks.
      </p>
    </section>
  );
}

function QuickWidgets({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const { state, dispatch, now } = useStore();
  const today = new Date(now);
  const waterMl = hydrationForDay(state, today);

  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onNavigate('focus')}
        className="flex h-16 items-center gap-3 rounded-[1.4rem] bg-surface p-3 text-left transition-colors hover:bg-surface-2"
      >
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-focus-soft text-focus">
          <Wind size={19} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[0.8125rem] font-semibold text-ink">Breath reset</span>
          <span className="block truncate text-[0.6875rem] text-ink-3">60s in Focus</span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => dispatch({ type: 'hydration/add', day: dateKey(today), ml: 250 })}
        className="flex h-16 items-center gap-3 rounded-[1.4rem] bg-surface p-3 text-left transition-colors hover:bg-surface-2"
      >
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-nourish-soft text-nourish">
          <Droplets size={19} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[0.8125rem] font-semibold text-ink">+250ml water</span>
          <span className="font-tech block truncate text-[0.6875rem] text-ink-3">
            {waterMl >= 1000 ? `${(waterMl / 1000).toFixed(1)}L logged` : `${waterMl}ml logged`}
          </span>
        </span>
      </button>
    </div>
  );
}

/** The day's single next action: resume a live sprint, start today's
    workout, or bank the first sprint of a clear day. */
function UpNext({
  onNavigate,
  onStartWorkout,
}: {
  onNavigate: (tab: TabId) => void;
  onStartWorkout: (workout: Workout) => void;
}) {
  const { state, dispatch, remainingMs, now } = useStore();
  const today = new Date(now);
  const upcoming = nextWorkout(state, today);

  const timerRunning = state.timer.status === 'running';
  const timerVisible = state.timer.status !== 'idle';
  const activeTask = state.tasks.find((t) => t.id === state.timer.taskId) ?? null;

  if (timerVisible) {
    return (
      <section className="rounded-[var(--radius-card)] border border-focus/40 bg-surface p-5">
        <span className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Up next
        </span>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="font-tech tnum text-[2rem] font-semibold leading-none tracking-tight text-ink">
              {formatClock(remainingMs)}
            </p>
            <p className="mt-1.5 truncate text-[0.8125rem] text-ink-2">
              {activeTask?.name ?? 'Deep Work Sprint'} · {timerRunning ? 'in flow' : 'paused'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              accent="focus"
              size="md"
              icon={timerRunning ? <Pause size={15} /> : <Play size={15} />}
              onClick={() =>
                dispatch(
                  timerRunning
                    ? { type: 'timer/pause', now: Date.now() }
                    : { type: 'timer/start', now: Date.now() },
                )
              }
            >
              {timerRunning ? 'Pause' : 'Resume'}
            </Button>
            <Button accent="focus" variant="soft" size="md" onClick={() => onNavigate('focus')}>
              Open timer
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (upcoming && upcoming.daysAway === 0) {
    return (
      <section className="rounded-[var(--radius-card)] border border-move/40 bg-surface p-5">
        <span className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Up next
        </span>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate font-display text-[1.375rem] font-semibold tracking-tight text-ink">
              {upcoming.workout.name}
            </p>
            <p className="mt-1 text-[0.8125rem] text-ink-2">
              {upcoming.workout.durationMin} min · {upcoming.workout.items.length} exercises
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              accent="move"
              size="md"
              icon={<Play size={15} />}
              onClick={() => onStartWorkout(upcoming.workout)}
            >
              Start workout
            </Button>
            <Button accent="move" variant="soft" size="md" onClick={() => onNavigate('move')}>
              View plan
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
      <span className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
        Up next
      </span>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="font-display text-[1.375rem] font-semibold tracking-tight text-ink">
            A clear day
          </p>
          <p className="mt-1 text-[0.8125rem] text-ink-2">
            Bank one sprint to start the rhythm.
          </p>
        </div>
        <Button accent="focus" size="md" icon={<Play size={15} />} onClick={() => onNavigate('focus')}>
          Start sprint
        </Button>
      </div>
    </section>
  );
}

function TimelineList({
  onNavigate,
}: {
  onNavigate: (tab: TabId) => void;
  onStartWorkout?: (workout: Workout) => void;
}) {
  const { state, now } = useStore();
  const today = new Date(now);
  const rows: Array<{
    key: string;
    time: string;
    label: string;
    status: string;
    statusTone: string;
    dot: string;
  }> = [];

  const fmtTime = (at: Date) =>
    at.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });

  // The day assembled from what already happened and what is queued.
  const active =
    state.timer.mode === 'focus' && state.timer.status !== 'idle'
      ? state.tasks.find((t) => t.id === state.timer.taskId)
      : null;
  if (active && state.timer.startedAt) {
    rows.push({
      key: active.id,
      time: fmtTime(new Date(state.timer.startedAt)),
      label: `Deep Focus Sprint · ${active.name}`,
      status: 'In Progress',
      statusTone: 'text-focus',
      dot: 'bg-focus',
    });
  }

  const upcoming = nextWorkout(state, today);
  if (upcoming && upcoming.daysAway === 0) {
    rows.push({
      key: upcoming.workout.id,
      time: '—',
      label: upcoming.workout.name,
      status: `Upcoming · ${upcoming.workout.durationMin} min`,
      statusTone: 'text-ink-3',
      dot: 'bg-track',
    });
  }

  if (rows.length === 0) {
    return (
      <div className="px-5 py-8 text-center">
        <p className="font-display text-[0.9375rem] font-medium text-ink">A clear day</p>
        <p className="mt-1 text-[0.8125rem] text-ink-2">
          Start a sprint and it will appear here, in order.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Button accent="focus" variant="soft" size="sm" onClick={() => onNavigate('focus')}>
            Start sprint
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {rows.map((row) => (
        <li key={row.key} className="flex items-center gap-4 px-4 py-3.5 md:px-6">
          <span className="font-tech tnum w-16 flex-shrink-0 text-[0.75rem] text-ink-3">
            {row.time}
          </span>
          <span className={`h-2 w-2 flex-shrink-0 rounded-full ${row.dot}`} aria-hidden />
          <span className="min-w-0 flex-1 truncate text-[0.875rem] font-medium text-ink">
            {row.label}
          </span>
          <span className={`flex-shrink-0 font-tech text-[0.75rem] ${row.statusTone}`}>
            {row.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
