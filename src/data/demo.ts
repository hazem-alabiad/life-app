import type { FocusTask, Schedule, SessionRecord } from '../types';
import { addDays, dateKey, startOfWeek } from '../lib/date';
import { buildWorkout, WORKOUT_TEMPLATES } from './workouts';

/**
 * Sample data.
 *
 * An empty dashboard cannot be reviewed, so the first launch seeds a plausible
 * week. `AppState.demoSeeded` stays true until the user clears it, and the
 * Insights view surfaces that state rather than passing the numbers off as
 * the user's own.
 */

function template(index: number, name?: string) {
  const source = WORKOUT_TEMPLATES[index]!;
  const items = source.items.map(([exerciseId, sets]) => ({ exerciseId, sets }));
  return buildWorkout(name ?? source.name, items, 'manual');
}

export function seedSchedule(now = new Date()): Schedule {
  const monday = startOfWeek(now);
  const plan: Array<[number, number]> = [
    [0, 0], // Monday — Upper Body & Core
    [2, 1], // Wednesday — Lower Body Strength
    [4, 2], // Friday — Full Body Circuit
  ];
  const schedule: Schedule = {};
  for (const [offset, templateIndex] of plan) {
    schedule[dateKey(addDays(monday, offset))] = [template(templateIndex)];
  }
  return schedule;
}

export function seedSessions(now = new Date()): SessionRecord[] {
  const monday = startOfWeek(now);
  const entries: Array<[number, string, string[], number]> = [
    [0, 'Upper Body & Core', ['Chest', 'Back', 'Shoulders', 'Core'], 42],
    [2, 'Lower Body Strength', ['Legs', 'Glutes'], 48],
    [3, 'Guided Stretch', ['Back', 'Legs'], 12],
  ];
  return entries
    .map(([offset, name, muscles, durationMin]) => {
      const day = addDays(monday, offset);
      // Skip anything that has not happened yet.
      if (day.getTime() > now.getTime()) return null;
      day.setHours(18, 30, 0, 0);
      return {
        id: `seed_sess_${offset}`,
        name,
        kind: (name === 'Guided Stretch' ? 'stretch' : 'workout') as SessionRecord['kind'],
        completedAt: day.getTime(),
        durationMin,
        exerciseCount: muscles.length + 1,
        muscles,
      };
    })
    .filter((s): s is SessionRecord => s !== null);
}

export function seedTasks(now = new Date()): FocusTask[] {
  return [
    { id: 'seed_task_1', name: 'Draft the release notes', planned: 3, done: 1, createdAt: now.getTime() - 86_400_000 },
    { id: 'seed_task_2', name: 'Review the API contract', planned: 2, done: 0, createdAt: now.getTime() - 86_400_000 },
    { id: 'seed_task_3', name: 'Read two chapters', planned: 1, done: 0, createdAt: now.getTime() - 86_400_000 },
  ];
}
