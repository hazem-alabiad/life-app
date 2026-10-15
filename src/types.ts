/** The four destinations in the bottom dock. */
export type TabId = 'home' | 'move' | 'focus' | 'fuel';

/** Every accent colour in the app belongs to exactly one module. */
export type AccentName = 'move' | 'focus' | 'nourish';

/* ------------------------------------------------------------------ move */

export type BodyPart =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Arms'
  | 'Core'
  | 'Legs'
  | 'Glutes'
  | 'Full body'
  | 'Neck';

export type Equipment =
  | 'Bodyweight'
  | 'Dumbbell'
  | 'Barbell'
  | 'Kettlebell'
  | 'Band'
  | 'Bench'
  | 'Machine'
  | 'Mat';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

/** A stretch intent, chosen once during stretch onboarding. */
export type StretchGoal = 'flexibility' | 'back' | 'shoulder' | 'mobility';

export interface Exercise {
  id: string;
  name: string;
  bodyPart: BodyPart;
  /** The primary muscle worked, shown as the row subtitle. */
  target: string;
  equipment: Equipment;
  difficulty: Difficulty;
  /** Stretches appear in stretch flows, not in the strength list. */
  kind: 'strength' | 'stretch';
  instructions: string[];
  /** Sets/reps recommendation shown in the detail sheet. */
  recommended: string;
  /** Timed movements (stretches, holds) count down instead of counting reps. */
  holdSeconds?: number;
  /** Which stretch intents this movement serves. */
  goals?: StretchGoal[];
}

export interface WorkoutItem {
  exerciseId: string;
  sets: number;
}

export interface Workout {
  id: string;
  name: string;
  durationMin: number;
  /** Muscle chips shown on the card; derived from items when building. */
  muscles: string[];
  items: WorkoutItem[];
  source: 'manual' | 'suggested';
  kind: 'workout' | 'stretch';
}

/** Keyed by local date, `yyyy-mm-dd`. */
export type Schedule = Record<string, Workout[]>;

export interface SessionRecord {
  id: string;
  name: string;
  kind: 'workout' | 'stretch';
  completedAt: number;
  durationMin: number;
  exerciseCount: number;
  muscles: string[];
}

/* ----------------------------------------------------------------- focus */

export type TimerMode = 'focus' | 'short' | 'long';

export type TimerStatus = 'idle' | 'running' | 'paused';

/**
 * The timer is stored as an absolute end timestamp rather than a decrementing
 * counter, so it stays correct while the tab is backgrounded or the screen is
 * locked, and survives a reload.
 */
export interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  /** Epoch ms when the current run finishes; null while idle or paused. */
  endsAt: number | null;
  /** Milliseconds left when paused or not started. */
  remainingMs: number;
  /** Length of the current mode's run, for progress maths. */
  durationMs: number;
  /** Pomodoros finished in the current cycle, drives the long-break cadence. */
  completedInCycle: number;
  taskId: string | null;
  startedAt: number | null;
}

export interface FocusTask {
  id: string;
  name: string;
  /** Planned pomodoros, drawn as tomato dots. */
  planned: number;
  done: number;
  createdAt: number;
}

export interface FocusSessionRecord {
  id: string;
  mode: TimerMode;
  taskId: string | null;
  taskName: string | null;
  startedAt: number;
  endedAt: number;
  focusMinutes: number;
  /** Whether the pomodoro ran to completion rather than being abandoned. */
  completed: boolean;
}

/* --------------------------------------------------------------- nourish */

export type MealKind = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealRecord {
  id: string;
  name: string;
  kind: MealKind;
  /** Epoch ms when logged (or planned for). */
  loggedAt: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  /** Planned meals render faintly until logged. */
  planned?: boolean;
}

/* -------------------------------------------------------------- settings */

export interface Settings {
  theme: 'dark' | 'light' | 'system';
  pomodoroMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  sessionsBeforeLong: number;
  stretchOnBreak: boolean;
  eyeRest: boolean;
  weeklyWorkoutGoal: number;
  dailyCalorieGoal: number;
  hydrationGoalMl: number;
  stretchGoal: StretchGoal;
  /** When the app was first opened, used to fade nav labels after a week. */
  firstLaunchAt: number;
  stretchOnboardingDone: boolean;
}

export interface AppState {
  version: number;
  /** True while the seeded sample week is still present, so it can be cleared. */
  demoSeeded: boolean;
  settings: Settings;
  schedule: Schedule;
  sessions: SessionRecord[];
  tasks: FocusTask[];
  meals: MealRecord[];
  /** Water intake in ml, keyed by local date `yyyy-mm-dd`. */
  hydration: Record<string, number>;
  timer: TimerState;
  focusHistory: FocusSessionRecord[];
}

/* -------------------------------------------------------------- ui types */

/** A bottom sheet, described by what it shows rather than by component. */
export type SheetKind =
  | { kind: 'exercise'; exerciseId: string }
  | { kind: 'workout-builder' }
  | { kind: 'stretch-onboarding' }
  | { kind: 'focus-settings' }
  | { kind: 'insight' }
  | { kind: 'add-task' }
  | { kind: 'edit-task'; taskId: string }
  | { kind: 'add-meal' }
  | { kind: 'edit-meal'; mealId: string }
  | { kind: 'settings' }
  | null;

export type MoveView = 'schedule' | 'exercises' | 'history';
export type FocusView = 'timer' | 'history';
