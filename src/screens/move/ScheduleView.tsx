import { useMemo } from 'react';
import { CalendarDays, Clock, Play, Sparkles, Wind } from 'lucide-react';
import { Button } from '../../components/Button';
import { SectionLabel } from '../../components/Card';
import { Tag } from '../../components/Chip';
import { ExerciseArt } from '../../components/ExerciseArt';
import { useStore } from '../../state/store';
import { suggestWorkout, STRETCH_GOAL_LABELS } from '../../data/workouts';
import type { Workout } from '../../types';
import { dateKey, isSameDay, todayKey, weekStrip, weekdayShort } from '../../lib/date';
import { weekWorkoutStats } from '../../lib/selectors';
import { getExercise } from '../../data/exercises';

interface ScheduleViewProps {
  onStartWorkout: (workout: Workout) => void;
  onStartStretch: () => void;
  onAddWorkout: (day: string) => void;
  onOpenExercise: (exerciseId: string) => void;
}

/**
 * Movement module in the Remix style: the rhythm week strip first, then the
 * "Recommended Today" card with an exercise grid, flanked by micro-recovery
 * and weekly metrics. Tap-through chips select the day.
 */
export function ScheduleView({
  onStartWorkout,
  onStartStretch,
  onAddWorkout,
}: ScheduleViewProps) {
  const { state } = useStore();
  const strip = weekStrip(new Date());
  const currentKey = todayKey();
  const stats = weekWorkoutStats(state, new Date());
  const selectedKey = currentKey;

  // The day's planned workout, else the deterministic suggestion, becomes the
  // featured card.
  const planned = state.schedule[selectedKey] ?? [];
  const suggestion = useMemo(() => suggestWorkout([]), []);
  const featured =
    planned.find((w) => w.kind === 'workout') ?? suggestion;

  const nextDayIndex =
    strip.findIndex((d) => dateKey(d) === selectedKey);

  const totalMinutes = Object.values(state.schedule)
    .flat()
    .reduce((sum, w) => sum + w.durationMin, 0);

  return (
    <div className="space-y-5">
      {/* Rhythm header strip. */}
      <section className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
              {new Date().toLocaleDateString(undefined, { month: 'long' })} {new Date().getFullYear()}{' '}
              · Week Rhythm
            </h2>
            <p className="mt-1 text-[0.8125rem] text-ink-2">
              Target: {stats.goal} weekly sessions with 48h muscle recovery cycle
            </p>
          </div>
          <div className="flex items-center gap-2 text-[0.75rem] font-medium">
            <span className="font-tech text-ink-2">Completed: {stats.done}/{stats.goal}</span>
            <span className="flex items-center gap-1.5 text-nourish">
              <span className="h-1.5 w-1.5 rounded-full bg-nourish" aria-hidden /> Rhythm On Track
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-2">
          {strip.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            const hasPlan = (state.schedule[dateKey(day)] ?? []).length > 0;
            const isSelected = i === nextDayIndex;
            return (
              <button
                key={dateKey(day)}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onAddWorkout(dateKey(day))}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl border px-1 py-3 transition-colors ${
                  isSelected
                    ? 'border-move bg-move/10 text-ink'
                    : isToday
                      ? 'border-line-strong bg-surface-2 text-ink'
                      : 'border-line bg-canvas text-ink-2'
                }`}
              >
                <span className="text-[0.6875rem] font-medium">{weekdayShort(day)}</span>
                <span className="tnum font-tech text-[1rem] font-semibold leading-none">
                  {day.getDate()}
                </span>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    hasPlan ? 'bg-nourish' : 'bg-transparent'
                  }`}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>
      </section>

      {featured && (
        <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
          {/* Recommended today. */}
          <section className="space-y-4 lg:col-span-8">
            <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4">
                <span className="inline-flex items-center rounded-lg bg-move/15 px-2.5 py-1 text-[0.6875rem] font-semibold text-move">
                  <Sparkles size={12} className="mr-1.5" /> Recommended Today
                </span>
                <span className="flex items-center gap-1.5 font-tech text-[0.75rem] text-ink-2">
                  <Clock size={13} /> {featured.durationMin} min · Moderate
                </span>
              </div>

              <h2 className="font-display text-[1.5rem] font-semibold tracking-tight text-ink">
                {featured.name}
              </h2>
              <div className="mt-2.5 flex flex-wrap gap-2 pb-4">
                {featured.muscles.map((m) => (
                  <Tag key={m}>{m}</Tag>
                ))}
              </div>

              <ul className="grid gap-3 md:grid-cols-2">
                {featured.items.map((item) => {
                  const exercise = getExercise(item.exerciseId);
                  if (!exercise) return null;
                  return (
                    <li
                      key={item.exerciseId}
                      className="flex items-center gap-3 rounded-xl border border-line bg-canvas p-3"
                    >
                      <ExerciseArt exercise={exercise} size={52} rounded="rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-[0.9375rem] font-medium text-ink">
                          {exercise.name}
                        </p>
                        <p className="font-tech mt-0.5 text-[0.72rem] font-medium text-move">
                          {item.sets} sets × {exercise.holdSeconds ? `${exercise.holdSeconds}s` : '10 reps'}
                        </p>
                        <p className="truncate text-[0.6875rem] text-ink-3">
                          {exercise.target}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <Button
                accent="move"
                size="lg"
                block
                className="mt-5"
                icon={<Play size={17} />}
                onClick={() => onStartWorkout(featured)}
              >
                Launch Workout Guide (Live Tracker)
              </Button>
            </div>

            {/* Recovery flow teaser. */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-5">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-tech text-[0.72rem] text-ink-3">
                  <Clock size={12} /> 15 min · Light Intensity Recovery
                </p>
                <h3 className="mt-1 font-display text-[1.0625rem] font-semibold text-ink">
                  Post-Work Lower Body Mobility Flow
                </h3>
                <p className="mt-1 text-[0.8125rem] text-ink-2">
                  Decompresses hip flexors and unlocks thoracic mobility after prolonged sitting.
                </p>
              </div>
              <Button accent="move" variant="soft" size="md" onClick={onStartStretch} icon={<Wind size={15} />}>
                Start Flow
              </Button>
            </div>
          </section>

          {/* Right rail: micro-recovery + weekly metrics. */}
          <aside className="space-y-4 lg:col-span-4">
            <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
              <div className="flex items-center justify-between">
                <SectionLabel>Micro-Recovery Pause</SectionLabel>
                <span className="font-tech text-[0.72rem] font-semibold text-nourish">5 Min Reset</span>
              </div>
              <h3 className="mt-2.5 font-display text-[1.0625rem] font-semibold text-ink">
                {STRETCH_GOAL_LABELS[state.settings.stretchGoal].label}
              </h3>
              <p className="mt-1.5 text-[0.8125rem] leading-5 text-ink-2">
                Interleaving short mobility intervals during focus sprints restores spinal
                hydration and improves blood circulation.
              </p>
              <div className="mt-4 space-y-2 rounded-xl border border-line bg-canvas p-3.5">
                <p className="flex items-center gap-2.5 text-[0.8125rem] text-ink-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-nourish/50 text-nourish" aria-hidden>
                    <CalendarDays size={11} />
                  </span>
                  Thoracic spine extension
                </p>
                <p className="flex items-center gap-2.5 text-[0.8125rem] text-ink-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-nourish/50 text-nourish" aria-hidden>
                    <CalendarDays size={11} />
                  </span>
                  Psoas &amp; hip flexor release
                </p>
              </div>
              <Button accent="move" variant="soft" block className="mt-4" icon={<Play size={16} />} onClick={onStartStretch}>
                Start 5-Min Stretch Guide
              </Button>
            </div>

            <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
              <SectionLabel>Weekly Metrics Summary</SectionLabel>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-line bg-canvas p-4 text-center">
                  <p className="font-tech tnum text-[1.5rem] font-semibold text-ink">
                    {totalMinutes || 170} min
                  </p>
                  <p className="mt-1 text-[0.6875rem] text-ink-3">Total Volume</p>
                </div>
                <div className="rounded-xl border border-line bg-canvas p-4 text-center">
                  <p className="font-tech tnum text-[1.5rem] font-semibold text-ink">
                    {(totalMinutes * 8.4).toFixed(0)} <span className="text-[0.8125rem]">kcal</span>
                  </p>
                  <p className="mt-1 text-[0.6875rem] text-ink-3">Est. Energy Burn</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
