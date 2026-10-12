import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Sheet } from '../../components/Sheet';
import { Button } from '../../components/Button';
import { ExerciseArt } from '../../components/ExerciseArt';
import { SectionLabel } from '../../components/Card';
import { Tag } from '../../components/Chip';
import { useStore } from '../../state/store';
import { buildWorkout } from '../../data/workouts';
import { addDays, dateKey, isSameDay, weekdayShort } from '../../lib/date';
import type { Exercise } from '../../types';

export function ExerciseSheet({
  exercise,
  onClose,
}: {
  exercise: Exercise;
  onClose: () => void;
}) {
  const { dispatch } = useStore();
  const [addedDay, setAddedDay] = useState<string | null>(null);
  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const addTo = (day: Date) => {
    const workout = buildWorkout(exercise.name, [{ exerciseId: exercise.id, sets: 3 }]);
    dispatch({ type: 'schedule/add', day: dateKey(day), workout });
    setAddedDay(dateKey(day));
    window.setTimeout(onClose, 900);
  };

  return (
    <Sheet open onClose={onClose} title={exercise.name} subtitle={exercise.recommended}>
      <div className="flex justify-center pt-1">
        <ExerciseArt exercise={exercise} size={140} rounded="rounded-[1.75rem]" />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Tag>{exercise.bodyPart}</Tag>
        <Tag>{exercise.equipment}</Tag>
        <Tag>{exercise.difficulty}</Tag>
        <Tag>{exercise.target}</Tag>
      </div>

      <div className="mt-6">
        <SectionLabel className="mb-3 block">How to do it</SectionLabel>
        <ol className="space-y-3">
          {exercise.instructions.map((line, i) => (
            <li key={line} className="flex gap-3 text-[0.8125rem] leading-5 text-ink-2">
              <span className="tnum flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-surface-3 text-[0.6875rem] font-semibold text-ink-2">
                {i + 1}
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface px-4 py-3.5">
        <p className="text-[0.75rem] leading-5 text-ink-2">
          Suggested sets and reps: <span className="text-ink">{exercise.recommended}</span>. Start
          lighter than you think and leave one good rep in reserve.
        </p>
      </div>

      <div className="mt-6">
        <SectionLabel className="mb-2.5 block">Add to a day</SectionLabel>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {days.map((day) => {
            const key = dateKey(day);
            const isAdded = addedDay === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => addTo(day)}
                className={`flex h-[62px] w-[54px] flex-shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border transition-colors ${
                  isAdded
                    ? 'border-transparent bg-move text-move-ink'
                    : 'border-line bg-surface text-ink-2'
                }`}
              >
                <span className="text-[0.625rem] font-semibold uppercase tracking-[0.1em]">
                  {weekdayShort(day)}
                </span>
                <span className="tnum text-[0.9375rem] font-semibold leading-none">{day.getDate()}</span>
                {isAdded && <Check size={12} />}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[0.6875rem] text-ink-3">
          {isSameDay(days[0]!, new Date()) ? 'Today first' : 'Starting today'} — three sets, adjust
          after.
        </p>
      </div>

      <Button
        accent="move"
        block
        className="mt-5"
        icon={<Plus size={16} />}
        onClick={() => addTo(new Date())}
      >
        Add to today
      </Button>
    </Sheet>
  );
}
