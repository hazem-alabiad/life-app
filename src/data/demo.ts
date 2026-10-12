import type { FocusTask, MealEntry, Schedule, SessionRecord } from '../types';
import { addDays, dateKey, startOfWeek } from '../lib/date';
import { FOODS, tipsFor } from './foods';
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

/** Three meals a day for the past week, drawn from the seeded food table. */
export function seedMeals(now = new Date()): MealEntry[] {
  const plan = [
    { name: 'Oatmeal with Banana', hour: 8 },
    { name: 'Chicken Rice Plate', hour: 13 },
    { name: 'Salmon Quinoa Bowl', hour: 19 },
  ];
  const extras: Record<number, string> = { 1: 'Greek Yoghurt with Berries', 4: 'Sushi Set' };

  const meals: MealEntry[] = [];
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const day = dayOffset === 0 ? new Date(now) : addDays(now, -dayOffset);
    const dayMeals = [...plan];
    const extra = extras[dayOffset];
    if (extra) dayMeals.splice(1, 0, { name: extra, hour: 16 });

    for (const entry of dayMeals) {
      const food = FOODS.find((f) => f.name === entry.name) ?? FOODS[0]!;
      const at = new Date(day);
      // Today's: one meal each roughly at late morning, mid-afternoon, and the
      // most recent hour — clamp under "now" so nothing lands in the future.
      if (dayOffset === 0) {
        const anchorHour = Math.max(11, Math.min(now.getHours(), 20));
        const offsetsByHour: Record<number, number> = { 8: 5, 13: 3, 19: 1 };
        at.setHours(Math.max(6, anchorHour - (offsetsByHour[entry.hour] ?? 2)), 15, 0, 0);
      } else {
        at.setHours(entry.hour, 15 + (dayOffset % 3) * 10, 0, 0);
      }
      // Anything later than right now has not happened yet.
      if (at.getTime() > now.getTime()) continue;
      meals.push({
        id: `seed_meal_${dayOffset}_${entry.hour}`,
        name: food.name,
        kcal: food.kcal,
        macros: food.macros,
        tips: tipsFor(food),
        confidence: 0.72,
        createdAt: at.getTime(),
        photo: null,
        source: 'photo',
      });
    }
  }
  return meals;
}

export function seedTasks(now = new Date()): FocusTask[] {
  return [
    { id: 'seed_task_1', name: 'Draft the release notes', planned: 3, done: 1, createdAt: now.getTime() - 86_400_000 },
    { id: 'seed_task_2', name: 'Review the API contract', planned: 2, done: 0, createdAt: now.getTime() - 86_400_000 },
    { id: 'seed_task_3', name: 'Read two chapters', planned: 1, done: 0, createdAt: now.getTime() - 86_400_000 },
  ];
}
