import type { AppState, SessionRecord, Workout } from '../types';
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
