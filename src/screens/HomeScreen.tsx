import { ArrowRight, Pause, Play, Settings2, Sparkles } from 'lucide-react';
import { Card, CardHeader, SectionLabel } from '../components/Card';
import { Button, IconButton } from '../components/Button';
import { MacroBar } from '../components/Bar';
import { Ring } from '../components/Ring';
import { StatPill, Tag } from '../components/Chip';
import { CONTAINER } from '../components/TopBar';
import { ACCENT } from '../components/accent';
import { useStore } from '../state/store';
import type { SheetKind, TabId, Workout } from '../types';
import { formatClock, formatFocusLength, formatKcal, formatMinutes, pct } from '../lib/format';
import { dayOfYear, formatFullDate, relativeDayLabel } from '../lib/date';
import { kcalToday, focusTodayMs, lastMeal, nextWorkout, weekWorkoutStats } from '../lib/selectors';
import { INSIGHTS } from '../data/insights';

interface HomeScreenProps {
  onNavigate: (tab: TabId) => void;
  onOpenSheet: (sheet: SheetKind) => void;
  onStartWorkout: (workout: Workout) => void;
}

export function HomeScreen({ onNavigate, onOpenSheet, onStartWorkout }: HomeScreenProps) {
  const { state, dispatch, remainingMs, progress, now } = useStore();
  const today = new Date(now);

  const stats = weekWorkoutStats(state, today);
  const focusMs = focusTodayMs(state, today);
  const kcal = kcalToday(state, today);
  const upcoming = nextWorkout(state, today);
  const meal = lastMeal(state);
  const insight = INSIGHTS[dayOfYear(today) % INSIGHTS.length]!;

  const timerRunning = state.timer.status === 'running';
  const timerVisible = state.timer.status !== 'idle';
  const activeTask = state.tasks.find((t) => t.id === state.timer.taskId) ?? null;
  const modeLabel =
    state.timer.mode === 'focus'
      ? 'Focus'
      : state.timer.mode === 'short'
        ? 'Short break'
        : 'Long break';

  return (
    <div className={`${CONTAINER} pb-40 lg:pb-16`}>
      {/* Date and a gear. No avatar, no greeting banner: the screen is the
          greeting. */}
      <div className="flex items-center justify-between pb-4 pt-safe lg:pt-8">
        <h1 className="pt-4 text-[1.375rem] font-medium leading-7 text-ink lg:pt-0 lg:text-[1.875rem] lg:leading-9">
          {formatFullDate(today)}
        </h1>
        <div className="pt-3 lg:pt-0">
          <IconButton label="Settings" onClick={() => onOpenSheet({ kind: 'settings' })}>
            <Settings2 size={19} />
          </IconButton>
        </div>
      </div>

      {/* Today at a glance — pills on a phone, three stat cards from tablet up. */}
      <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 py-0.5 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
        <StatPill
          accent="move"
          label="Move"
          value={`${stats.done} / ${stats.goal}`}
          hint={`${formatMinutes(stats.minutes)} this week`}
          onClick={() => onNavigate('move')}
        />
        <StatPill
          accent="focus"
          label="Focus"
          value={formatFocusLength(focusMs) || '0m'}
          hint={timerRunning ? 'Session running now' : 'Logged today'}
          onClick={() => onNavigate('focus')}
        />
        <StatPill
          accent="nourish"
          label="Nourish"
          value={formatKcal(kcal)}
          hint={`of ${formatKcal(state.settings.dailyCalorieGoal)}`}
          onClick={() => onNavigate('nourish')}
        />
      </div>

      {/*
       * One card list that reflows into the desktop 8:4 arrangement. Dense
       * auto-placement keeps the phone order (active, ring, next, insight,
       * food) exactly as specified while letting the wide layout pair a wide
       * card with a narrow one on each row.
       */}
      <div className="mt-4 grid gap-4 lg:grid-flow-row-dense lg:grid-cols-12 lg:items-start">
        {timerVisible && (
          <Card className="relative overflow-hidden lg:col-span-8">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  {timerRunning && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-focus opacity-70" />
                  )}
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-focus" />
                </span>
                <span className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-focus">
                  {modeLabel} {timerRunning ? 'running' : 'paused'}
                </span>
              </div>
              <span className="tnum text-[0.6875rem] text-ink-3">
                {state.timer.completedInCycle} of {state.settings.sessionsBeforeLong} this cycle
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-3">
              <h3 className="truncate text-[1.0625rem] font-medium text-ink lg:text-[1.25rem]">
                {activeTask?.name ?? 'Open session'}
              </h3>
              <span className="tnum text-[1.25rem] font-semibold tracking-tight text-ink lg:text-[1.875rem]">
                {formatClock(remainingMs)}
              </span>
            </div>

            <div className="mb-4 mt-3 h-1.5 w-full overflow-hidden rounded-full bg-track">
              <div
                className="h-full rounded-full bg-focus transition-[width] duration-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigate('focus')}
                className="text-[0.75rem] font-medium text-ink-2"
              >
                Open timer
              </button>
              <Button
                size="sm"
                accent="focus"
                variant="soft"
                icon={timerRunning ? <Pause size={14} /> : <Play size={14} />}
                onClick={() => {
                  if (timerRunning) dispatch({ type: 'timer/pause', now: Date.now() });
                  else dispatch({ type: 'timer/start', now: Date.now() });
                }}
              >
                {timerRunning ? 'Pause' : 'Resume'}
              </Button>
            </div>
          </Card>
        )}

        {/* Weekly movement rhythm: one ring, two numbers, no streak shaming. */}
        <Card className="lg:col-span-4">
          <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-start lg:gap-5">
            <div className="min-w-0">
              <SectionLabel className="mb-1.5 block">Weekly rhythm</SectionLabel>
              <h3 className="text-[1.0625rem] font-medium text-ink">
                {stats.done} of {stats.goal} completed
              </h3>
              <p className="mt-1 text-[0.75rem] text-ink-2">
                {formatMinutes(stats.minutes)} total
                {stats.done >= stats.goal ? (
                  <span className="text-move"> · goal met</span>
                ) : (
                  <span className="text-ink-3"> · {stats.goal - stats.done} to go</span>
                )}
              </p>
            </div>
            <Ring
              progress={pct(stats.done, stats.goal)}
              color={ACCENT.move.hex}
              size={84}
              stroke={6}
              label={`${stats.done} of ${stats.goal} sessions`}
            >
              <span className="tnum text-[0.9375rem] font-semibold text-ink">
                {Math.round(pct(stats.done, stats.goal) * 100)}%
              </span>
            </Ring>
          </div>
        </Card>

        {/* Up next — one tap to begin. */}
        {upcoming ? (
          <Card className="lg:col-span-8">
            <CardHeader
              label={upcoming.daysAway === 0 ? 'Up next today' : 'Up next'}
              action={
                <span className="text-[0.6875rem] text-ink-3">
                  {upcoming.daysAway === 0
                    ? 'Today'
                    : relativeDayLabel(new Date(`${upcoming.day}T00:00:00`), today)}
                </span>
              }
            />
            <h3 className="text-[1.0625rem] font-medium text-ink lg:text-[1.25rem]">
              {upcoming.workout.name}
            </h3>
            <div className="mb-4 mt-2.5 flex flex-wrap items-center gap-2">
              {upcoming.workout.muscles.map((m) => (
                <Tag key={m}>{m}</Tag>
              ))}
              <span className="text-[0.6875rem] text-ink-3">· {upcoming.workout.durationMin} min</span>
            </div>
            <Button
              accent="move"
              block
              icon={<Play size={18} />}
              onClick={() => onStartWorkout(upcoming.workout)}
              className="lg:w-auto lg:min-w-[220px]"
            >
              Start workout
            </Button>
          </Card>
        ) : (
          <Card className="lg:col-span-8">
            <CardHeader label="Up next" />
            <h3 className="text-[1.0625rem] font-medium text-ink">Nothing scheduled</h3>
            <p className="mt-1.5 text-[0.8125rem] leading-5 text-ink-2">
              The week is clear. Pick a session when you want one — a rest day is a legitimate plan.
            </p>
            <Button
              accent="move"
              variant="soft"
              block
              className="mt-4 lg:w-auto lg:min-w-[220px]"
              onClick={() => onNavigate('move')}
            >
              Open the schedule
            </Button>
          </Card>
        )}

        {/* One calm line a day, expandable rather than shouted. */}
        <Card
          as="button"
          onClick={() => onOpenSheet({ kind: 'insight' })}
          ariaLabel="Daily insight"
          className="lg:col-span-8"
        >
          <div className="mb-2 flex items-center gap-2">
            <Sparkles size={14} className="text-ink-3" />
            <SectionLabel>Daily insight</SectionLabel>
          </div>
          <h3 className="text-[0.9375rem] font-medium leading-6 text-ink lg:text-[1.0625rem]">
            {insight.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-5 text-ink-2 lg:line-clamp-none">
            {insight.body}
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-[0.75rem] font-medium text-ink-3">
            Read more <ArrowRight size={13} />
          </span>
        </Card>

        {/* Last thing logged, with the macro split at a glance. */}
        {meal && (
          <Card
            as="button"
            onClick={() => onNavigate('nourish')}
            ariaLabel="Recent meal"
            className="lg:col-span-4"
          >
            <CardHeader
              label="Latest fuel"
              action={
                <span className="inline-flex items-center gap-1 text-[0.6875rem] text-nourish">
                  Log details <ArrowRight size={12} />
                </span>
              }
            />
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h4 className="truncate text-[0.9375rem] font-medium text-ink">{meal.name}</h4>
              <span className="tnum flex-shrink-0 text-[0.8125rem] font-semibold text-ink">
                {formatKcal(meal.kcal)}
              </span>
            </div>
            <MacroBar protein={meal.macros.protein} carbs={meal.macros.carbs} fat={meal.macros.fat} />
            <p className="mt-2.5 text-[0.6875rem] text-ink-3">
              {relativeDayLabel(new Date(meal.createdAt), today)} ·{' '}
              {new Date(meal.createdAt).toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
