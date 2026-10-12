import { useMemo, useState } from 'react';
import { CalendarDays, Play, Plus, Sparkles, Timer, Wind } from 'lucide-react';
import { Card, CardHeader, SectionLabel } from '../../components/Card';
import { Button } from '../../components/Button';
import { Tag } from '../../components/Chip';
import { useStore } from '../../state/store';
import type { Workout } from '../../types';
import { dateKey, isSameDay, todayKey, weekStrip, weekdayShort } from '../../lib/date';
import { recentMuscles, workoutsForDay } from '../../lib/selectors';
import { suggestWorkout } from '../../data/workouts';
import { STRETCH_GOAL_LABELS } from '../../data/workouts';

interface ScheduleViewProps {
  onStartWorkout: (workout: Workout) => void;
  onStartStretch: () => void;
  onAddWorkout: (day: string) => void;
  onOpenExercise: (exerciseId: string) => void;
}

export function ScheduleView({
  onStartWorkout,
  onStartStretch,
  onAddWorkout,
  onOpenExercise,
}: ScheduleViewProps) {
  const { state, dispatch } = useStore();
  const [selected, setSelected] = useState(() => todayKey());
  const strip = weekStrip(new Date());
  const selectedDate = new Date(`${selected}T00:00:00`);
  const planned = workoutsForDay(state, selectedDate);

  const suggestion = useMemo(() => suggestWorkout(recentMuscles(state)), [state]);
  const alreadyPlanned = planned.some((w) => w.name === suggestion.name);

  return (
    /*
     * Phone: one column in the order the spec describes — strip, stretch,
     * suggestion, plan. Desktop: the strip spans the row and the plan sits in
     * the 8-column primary with stretch and suggestion beside it in the 4.
     */
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-6 lg:gap-y-4">
      {/* Mon–Sun strip. Tapping a day only changes what is below it. */}
      <div className="no-scrollbar order-1 -mx-4 flex gap-2 overflow-x-auto px-4 pt-1 lg:order-none lg:col-span-12 lg:mx-0 lg:px-0 lg:pt-0">
        {strip.map((day) => {
          const key = dateKey(day);
          const isSelected = key === selected;
          const hasPlan = (state.schedule[key] ?? []).length > 0;
          const isToday = isSameDay(day, new Date());
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              aria-pressed={isSelected}
              className={`flex h-[68px] w-[52px] flex-shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border transition-colors ${
                isSelected
                  ? 'border-transparent bg-move text-move-ink'
                  : 'border-line bg-surface text-ink-2'
              }`}
            >
              <span className="text-[0.625rem] font-semibold uppercase tracking-[0.1em]">
                {weekdayShort(day)}
              </span>
              <span className="tnum text-[1rem] font-semibold leading-none">{day.getDate()}</span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  hasPlan ? (isSelected ? 'bg-move-ink/50' : 'bg-move') : 'bg-transparent'
                }`}
                aria-hidden
              />
              {isToday && !isSelected && (
                <span className="sr-only">Today</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="order-2 flex flex-col gap-4 lg:order-none lg:col-span-4 lg:col-start-9 lg:row-start-2">
      {/* Guided stretch is a first-class session, not a warm-up afterthought. */}
      <Card accentBorder>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2">
              <Wind size={14} className="text-move" />
              <SectionLabel>Guided stretch</SectionLabel>
            </div>
            <h3 className="text-[0.9375rem] font-medium text-ink">
              {STRETCH_GOAL_LABELS[state.settings.stretchGoal].label}
            </h3>
            <p className="mt-1 text-[0.75rem] leading-5 text-ink-2">
              {STRETCH_GOAL_LABELS[state.settings.stretchGoal].blurb}
            </p>
          </div>
          <Button accent="move" variant="soft" size="sm" onClick={onStartStretch}>
            Start
          </Button>
        </div>
      </Card>

      {/* Suggested first: the app should do some of the thinking. */}
      {!alreadyPlanned && suggestion.items.length > 0 && (
        <Card accentBorder>
          <CardHeader
            label={
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={12} /> Suggested
              </span>
            }
            action={<span className="text-[0.6875rem] text-ink-3">{suggestion.durationMin} min</span>}
          />
          <h3 className="text-[1rem] font-medium text-ink">{suggestion.name}</h3>
          <div className="mb-4 mt-2.5 flex flex-wrap gap-2">
            {suggestion.muscles.map((m) => (
              <Tag key={m}>{m}</Tag>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              accent="move"
              size="sm"
              className="flex-1"
              icon={<Play size={15} />}
              onClick={() => onStartWorkout(suggestion)}
            >
              Start
            </Button>
            <Button
              accent="move"
              variant="ghost"
              size="sm"
              onClick={() =>
                dispatch({ type: 'schedule/add', day: selected, workout: { ...suggestion } })
              }
            >
              Add to day
            </Button>
          </div>
        </Card>
      )}

      </div>

      <div className="order-3 flex flex-col gap-4 lg:order-none lg:col-span-8 lg:col-start-1 lg:row-start-2">
        <div className="mb-3 flex items-center justify-between">
          <SectionLabel>
            {isSameDay(selectedDate, new Date()) ? 'Today' : selectedDate.toLocaleDateString(undefined, { weekday: 'long' })}
          </SectionLabel>
          <span className="text-[0.6875rem] text-ink-3">
            {planned.length > 0 ? `${planned.length} planned` : 'Nothing planned'}
          </span>
        </div>

        {planned.length === 0 ? (
          <Card className="text-center">
            <CalendarDays size={20} className="mx-auto mb-2 text-ink-3" />
            <p className="text-[0.875rem] font-medium text-ink">Rest day</p>
            <p className="mt-1 text-[0.75rem] text-ink-3">
              An empty day is not a missed day. Add something only if you want to.
            </p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {planned.map((workout) => (
              <li key={workout.id}>
                <Card>
                  <div className="mb-1 flex items-start justify-between gap-3">
                    <h3 className="text-[1rem] font-medium text-ink">{workout.name}</h3>
                    <span className="flex flex-shrink-0 items-center gap-1 text-[0.6875rem] text-ink-3">
                      <Timer size={12} /> {workout.durationMin} min
                    </span>
                  </div>
                  <div className="mb-4 mt-2.5 flex flex-wrap gap-2">
                    {workout.muscles.map((m) => (
                      <Tag key={m}>{m}</Tag>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      accent="move"
                      size="sm"
                      className="flex-1"
                      icon={<Play size={15} />}
                      onClick={() => onStartWorkout(workout)}
                    >
                      Start
                    </Button>
                    <Button
                      accent="move"
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenExercise(workout.items[0]!.exerciseId)}
                    >
                      Preview
                    </Button>
                    <Button
                      accent="move"
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove ${workout.name}`}
                      onClick={() =>
                        dispatch({ type: 'schedule/remove', day: selected, workoutId: workout.id })
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}

        <Button
          accent="move"
          variant="soft"
          block
          className="mt-4"
          icon={<Plus size={16} />}
          onClick={() => onAddWorkout(selected)}
        >
          Add a workout
        </Button>

        <p className="pt-1 text-center text-[0.6875rem] text-ink-3 lg:text-left">
          Plans can be moved or dropped at any time — nothing here is a debt.
        </p>
      </div>
    </div>
  );
}
