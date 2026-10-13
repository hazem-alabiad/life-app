import {
  ArrowRight,
  Dumbbell,
  Pause,
  Play,
  Sparkles,
  Target,
} from 'lucide-react';
import { CONTAINER } from '../components/TopBar';
import { Button } from '../components/Button';
import { useStore } from '../state/store';
import type { SheetKind, TabId, Workout } from '../types';
import { formatClock, formatMinutes, pct } from '../lib/format';
import { formatFullDate } from '../lib/date';
import {
  focusTodayMs,
  nextWorkout,
  weekWorkoutStats,
} from '../lib/selectors';
import { formatFocusLength } from '../lib/format';

interface HomeScreenProps {
  onNavigate: (tab: TabId) => void;
  onOpenSheet: (sheet: SheetKind) => void;
  onStartWorkout: (workout: Workout) => void;
}

function greeting(d: Date): string {
  const h = d.getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function HomeScreen({ onNavigate, onOpenSheet, onStartWorkout }: HomeScreenProps) {
  const { state, dispatch, remainingMs, progress, now } = useStore();
  const today = new Date(now);

  const stats = weekWorkoutStats(state, today);
  const focusMs = focusTodayMs(state, today);
  const upcoming = nextWorkout(state, today);

  const timerRunning = state.timer.status === 'running';
  const timerVisible = state.timer.status !== 'idle';
  const activeTask = state.tasks.find((t) => t.id === state.timer.taskId) ?? null;

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

      {/* Three module capability cards. */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Focus: live timer when active, cycle snapshot when not. */}
        <section className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
              <Target size={13} className="text-focus" /> Focus
            </span>
            <span className="font-tech text-[0.6875rem] text-ink-3">
              cycle {state.timer.completedInCycle + 1} of {state.settings.sessionsBeforeLong}
            </span>
          </div>

          {timerVisible ? (
            <>
              <p className="font-tech tnum mt-4 text-[2.5rem] font-semibold leading-none tracking-tight text-ink">
                {formatClock(remainingMs)}
              </p>
              <p className="mt-2 text-[0.8125rem] text-ink-2">
                {activeTask?.name ?? 'Deep Work Sprint'}
              </p>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-track">
                <div
                  className="h-full rounded-full bg-focus transition-[width] duration-500"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <div className="mt-5 flex items-center gap-2">
                <Button
                  accent="focus"
                  variant="soft"
                  size="md"
                  className="flex-1"
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
                <Button
                  accent="focus"
                  variant="soft"
                  size="sm"
                  aria-label="Open the timer"
                  onClick={() => onNavigate('focus')}
                >
                  <ArrowRight size={15} />
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="font-tech tnum mt-4 text-[2.5rem] font-semibold leading-none text-ink">
                {String(state.settings.pomodoroMin).padStart(2, '0')}:00
              </p>
              <p className="mt-2 text-[0.8125rem] text-ink-2">
                {formatFocusLength(focusMs)} focused today
              </p>
              <div className="mt-5 flex items-center gap-2">
                <Button
                  accent="focus"
                  size="md"
                  className="flex-1"
                  icon={<Play size={15} />}
                  onClick={() => onNavigate('focus')}
                >
                  Start sprint
                </Button>
                <Button
                  accent="focus"
                  variant="soft"
                  size="sm"
                  aria-label="Open focus module"
                  onClick={() => onNavigate('focus')}
                >
                  <ArrowRight size={15} />
                </Button>
              </div>
            </>
          )}
        </section>

        {/* Movement: weekly rhythm + next session. */}
        <section className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
              <Dumbbell size={13} className="text-move" /> Movement
            </span>
            <span className="font-tech text-[0.6875rem] text-ink-3">
              {stats.done}/{stats.goal} weekly
            </span>
          </div>
          <p className="mt-4 font-display text-[1.25rem] font-semibold leading-snug text-ink">
            {upcoming?.workout.name ?? 'Rest day'}
          </p>
          <p className="mt-1 text-[0.8125rem] text-ink-2">
            {upcoming?.workout.durationMin ?? 0} min ·{' '}
            {upcoming?.workout.items.length ?? 0} exercises
          </p>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-track">
            <div
              className="h-full rounded-full bg-move transition-[width] duration-500"
              style={{ width: `${pct(stats.done, stats.goal) * 100}%` }}
            />
          </div>
          <div className="mt-5 flex items-center gap-2">
            {upcoming && (
              <Button
                accent="move"
                size="md"
                className="flex-1"
                icon={<Play size={15} />}
                onClick={() => onStartWorkout(upcoming.workout)}
              >
                Start Workout
              </Button>
            )}
            <Button
              accent="move"
              variant="soft"
              size="sm"
              aria-label="Open movement module"
              onClick={() => onNavigate('move')}
            >
              <ArrowRight size={15} />
            </Button>
          </div>
        </section>

        {/* Recovery snapshot — the third card completes the rhythm picture
            without its own module. */}
        <section className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
              <Sparkles size={13} className="text-focus" /> Rhythm
            </span>
            <span className="font-tech text-[0.6875rem] text-ink-3">this week</span>
          </div>
          <p className="font-tech tnum mt-4 text-[2.5rem] font-semibold leading-none text-ink">
            {Math.round(pct(stats.done, stats.goal) * 100)}%
          </p>
          <p className="mt-2 text-[0.8125rem] text-ink-2">
            {formatMinutes(stats.minutes)} moved this week
          </p>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-track">
            <div
              className="h-full rounded-full bg-focus transition-[width] duration-500"
              style={{ width: `${pct(stats.done, stats.goal) * 100}%` }}
            />
          </div>
          <div className="mt-5 flex items-center gap-2">
            <Button
              accent="focus"
              variant="soft"
              size="md"
              className="flex-1"
              icon={<Sparkles size={15} />}
              onClick={() => onOpenSheet({ kind: 'insight' })}
            >
              Daily insight
            </Button>
          </div>
        </section>
      </div>

      {/* Today's Timeline — the day assembled from what already happened and
          what is queued, chronologically. */}
      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-tight text-ink">
          Today&apos;s Timeline
        </h2>
        <button
          type="button"
          onClick={() => onOpenSheet({ kind: 'insight' })}
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
