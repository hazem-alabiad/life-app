import type { AppState, MealRecord, SessionRecord, Workout } from '../types';
import { addDays, dateKey, isSameDay, startOfWeek, todayKey } from './date';

export interface WeekWorkoutStats {
  done: number;
  goal: number;
  minutes: number;
}

export function weekWorkoutStats(state: AppState, now = new Date()): WeekWorkoutStats {
  const monday = startOfWeek(now);
  const sunday = addDays(monday, 7);
  const inWeek = state.sessions.filter((s) => {
    const at = new Date(s.completedAt);
    return at >= monday && at < sunday && s.kind === 'workout';
  });
  return {
    done: inWeek.length,
    goal: state.settings.weeklyWorkoutGoal,
    minutes: inWeek.reduce((sum, s) => sum + s.durationMin, 0),
  };
}

/** Completed focus time today, plus whatever is running right now. */
export function focusTodayMs(state: AppState, now = new Date()): number {
  const done = state.focusHistory
    .filter((r) => isSameDay(new Date(r.endedAt), now))
    .reduce((sum, r) => sum + r.focusMinutes * 60_000, 0);

  const live =
    state.timer.mode === 'focus' && state.timer.status !== 'idle' && state.timer.startedAt
      ? Math.max(0, Date.now() - state.timer.startedAt)
      : 0;

  return done + live;
}

export interface NextWorkout {
  day: string;
  workout: Workout;
  daysAway: number;
}

/** The next planned session from today forward, or null when the week is clear. */
export function nextWorkout(state: AppState, now = new Date()): NextWorkout | null {
  for (let offset = 0; offset <= 13; offset++) {
    const day = addDays(now, offset);
    const list = state.schedule[dateKey(day)] ?? [];
    const workout = list.find((w) => w.kind === 'workout') ?? list[0];
    if (workout) return { day: dateKey(day), workout, daysAway: offset };
  }
  return null;
}

/** Muscles trained in the last ten days, used to pick the next suggestion. */
export function recentMuscles(state: AppState, now = new Date()): string[] {
  const cutoff = addDays(now, -10).getTime();
  return state.sessions.filter((s) => s.completedAt >= cutoff).flatMap((s) => s.muscles);
}

export function workoutsForDay(state: AppState, day: Date): Workout[] {
  return state.schedule[dateKey(day)] ?? [];
}

export function focusByDay(state: AppState): Array<{ day: string; records: SessionRecord[] }> {
  const groups = new Map<string, SessionRecord[]>();
  for (const session of state.sessions) {
    const key = dateKey(new Date(session.completedAt));
    const list = groups.get(key) ?? [];
    list.push(session);
    groups.set(key, list);
  }
  return [...groups.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([day, records]) => ({ day, records }));
}

export function focusRecordsByDay(state: AppState) {
  const groups = new Map<string, typeof state.focusHistory>();
  for (const record of state.focusHistory) {
    const key = dateKey(new Date(record.endedAt));
    const list = groups.get(key) ?? [];
    list.push(record);
    groups.set(key, list);
  }
  return [...groups.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([day, records]) => ({ day, records }));
}

export interface FocusWeekSummary {
  pomodoros: number;
  minutes: number;
}

export function focusWeekSummary(state: AppState, now = new Date()): FocusWeekSummary {
  const monday = startOfWeek(now);
  const week = state.focusHistory.filter((r) => new Date(r.endedAt) >= monday && r.completed);
  return {
    pomodoros: week.length,
    minutes: week.reduce((sum, r) => sum + r.focusMinutes, 0),
  };
}

export function isToday(key: string, now = new Date()): boolean {
  return key === todayKey(now);
}

/* --------------------------------------------------------------- nourish */

/** Today's meals in logged order, planned meals included. */
export function mealsForDay(state: AppState, day: Date): MealRecord[] {
  return state.meals
    .filter((m) => isSameDay(new Date(m.loggedAt), day))
    .sort((a, b) => a.loggedAt - b.loggedAt);
}

export interface DayNutrition {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  logged: number;
  planned: number;
}

/** The ring counts eaten meals only; planned ones stay faint until logged. */
export function dayNutrition(state: AppState, day: Date): DayNutrition {
  const meals = mealsForDay(state, day);
  const eaten = meals.filter((m) => !m.planned);
  const sum = (pick: (m: MealRecord) => number) => eaten.reduce((total, m) => total + pick(m), 0);
  return {
    calories: sum((m) => m.calories),
    proteinG: sum((m) => m.proteinG),
    carbsG: sum((m) => m.carbsG),
    fatG: sum((m) => m.fatG),
    logged: eaten.length,
    planned: meals.length - eaten.length,
  };
}

/** Macro targets derived from the calorie goal on a 30/40/30 split. */
export function macroGoals(dailyCalorieGoal: number): { proteinG: number; carbsG: number; fatG: number } {
  return {
    proteinG: Math.round((dailyCalorieGoal * 0.3) / 4),
    carbsG: Math.round((dailyCalorieGoal * 0.4) / 4),
    fatG: Math.round((dailyCalorieGoal * 0.3) / 9),
  };
}

export function hydrationForDay(state: AppState, day: Date): number {
  return state.hydration[dateKey(day)] ?? 0;
}

/** Local-date keys with any logged life: workout, focus, meal, or water. */
export function activeDayKeys(state: AppState): Set<string> {
  const keys = new Set<string>();
  for (const s of state.sessions) keys.add(dateKey(new Date(s.completedAt)));
  for (const r of state.focusHistory) keys.add(dateKey(new Date(r.endedAt)));
  for (const m of state.meals) {
    if (!m.planned) keys.add(dateKey(new Date(m.loggedAt)));
  }
  for (const [key, ml] of Object.entries(state.hydration)) {
    if (ml > 0) keys.add(key);
  }
  return keys;
}

/** Consecutive active days ending today (or yesterday, if today is still blank). */
export function rhythmCount(state: AppState, now = new Date()): number {
  const active = activeDayKeys(state);
  let cursor = new Date(now);
  if (!active.has(dateKey(cursor))) cursor = addDays(cursor, -1);
  let count = 0;
  while (active.has(dateKey(cursor))) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

/** 1-based day count since first launch, for the "Day N" marker. */
export function dayNumber(firstLaunchAt: number, now = new Date()): number {
  return Math.max(1, Math.floor((now.getTime() - firstLaunchAt) / 86_400_000) + 1);
}
