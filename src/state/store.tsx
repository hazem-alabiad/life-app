import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  AppState,
  FocusSessionRecord,
  FocusTask,
  MealEntry,
  SessionRecord,
  Settings,
  TimerMode,
  TimerState,
  Workout,
} from '../types';
import { newId } from '../lib/id';
import { seedMeals, seedSchedule, seedSessions, seedTasks } from '../data/demo';

const STORAGE_KEY = 'life-app/state/v1';
const STATE_VERSION = 1;

/* --------------------------------------------------------------- defaults */

export function defaultSettings(now = Date.now()): Settings {
  return {
    theme: 'dark',
    pomodoroMin: 25,
    shortBreakMin: 5,
    longBreakMin: 15,
    sessionsBeforeLong: 4,
    stretchOnBreak: true,
    eyeRest: true,
    weeklyWorkoutGoal: 5,
    dailyCalorieGoal: 2200,
    stretchGoal: 'back',
    firstLaunchAt: now,
    stretchOnboardingDone: false,
  };
}

function idleTimer(mode: TimerMode, durationMs: number): TimerState {
  return {
    mode,
    status: 'idle',
    endsAt: null,
    remainingMs: durationMs,
    durationMs,
    completedInCycle: 0,
    taskId: null,
    startedAt: null,
  };
}

export const modeMinutes = (settings: Settings, mode: TimerMode): number => {
  if (mode === 'focus') return settings.pomodoroMin;
  if (mode === 'short') return settings.shortBreakMin;
  return settings.longBreakMin;
};

export const modeDurationMs = (settings: Settings, mode: TimerMode): number =>
  Math.max(1, modeMinutes(settings, mode)) * 60_000;

export function initialState(now = new Date()): AppState {
  const settings = defaultSettings(now.getTime());
  return {
    version: STATE_VERSION,
    demoSeeded: true,
    settings,
    schedule: seedSchedule(now),
    sessions: seedSessions(now),
    tasks: seedTasks(now),
    timer: idleTimer('focus', modeDurationMs(settings, 'focus')),
    focusHistory: [],
    meals: seedMeals(now),
  };
}

/* ---------------------------------------------------------------- reducer */

export type Action =
  | { type: 'settings/patch'; patch: Partial<Settings> }
  | { type: 'schedule/add'; day: string; workout: Workout }
  | { type: 'schedule/remove'; day: string; workoutId: string }
  | { type: 'session/record'; record: SessionRecord }
  | { type: 'task/add'; name: string; planned: number }
  | { type: 'task/remove'; id: string }
  | { type: 'task/select'; id: string | null }
  | { type: 'task/complete-pomodoro'; id: string }
  | { type: 'timer/setMode'; mode: TimerMode; durationMs: number; status?: TimerState['status'] }
  | { type: 'timer/start'; now: number }
  | { type: 'timer/pause'; now: number }
  | { type: 'timer/reset'; durationMs: number }
  | { type: 'timer/finish'; now: number; durationMs: (mode: TimerMode) => number }
  | { type: 'meal/add'; meal: MealEntry }
  | { type: 'meal/remove'; id: string }
  | { type: 'demo/clear' };

/** Which phase follows the one that just ended. */
function nextMode(completedInCycle: number, settings: Settings): TimerMode {
  const cadence = Math.max(1, settings.sessionsBeforeLong);
  if (completedInCycle > 0 && completedInCycle % cadence === 0) return 'long';
  return 'short';
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'settings/patch': {
      const settings = { ...state.settings, ...action.patch };
      const timer = { ...state.timer };
      // A length change only takes effect while the phase is not running.
      if (timer.status !== 'running') {
        const durationMs = modeDurationMs(settings, timer.mode);
        timer.durationMs = durationMs;
        timer.remainingMs = durationMs;
      }
      return { ...state, settings, timer };
    }

    case 'schedule/add': {
      const day = state.schedule[action.day] ?? [];
      return { ...state, schedule: { ...state.schedule, [action.day]: [...day, action.workout] } };
    }

    case 'schedule/remove': {
      const day = (state.schedule[action.day] ?? []).filter((w) => w.id !== action.workoutId);
      const schedule = { ...state.schedule };
      if (day.length > 0) schedule[action.day] = day;
      else delete schedule[action.day];
      return { ...state, schedule };
    }

    case 'session/record':
      return { ...state, sessions: [action.record, ...state.sessions].slice(0, 400) };

    case 'task/add': {
      const task: FocusTask = {
        id: newId('task'),
        name: action.name,
        planned: action.planned,
        done: 0,
        createdAt: Date.now(),
      };
      return { ...state, tasks: [...state.tasks, task] };
    }

    case 'task/remove':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.id),
        timer: state.timer.taskId === action.id ? { ...state.timer, taskId: null } : state.timer,
      };

    case 'task/select':
      return { ...state, timer: { ...state.timer, taskId: action.id } };

    case 'task/complete-pomodoro':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, done: t.done + 1 } : t)),
      };

    case 'timer/setMode': {
      const status = action.status ?? 'idle';
      const timer: TimerState = {
        ...state.timer,
        mode: action.mode,
        status,
        durationMs: action.durationMs,
        remainingMs: action.durationMs,
        endsAt: status === 'running' ? state.timer.endsAt : null,
        startedAt: status === 'running' ? Date.now() : null,
      };
      return { ...state, timer };
    }

    case 'timer/start': {
      const remaining = state.timer.remainingMs > 0 ? state.timer.remainingMs : state.timer.durationMs;
      return {
        ...state,
        timer: {
          ...state.timer,
          status: 'running',
          remainingMs: remaining,
          endsAt: action.now + remaining,
          startedAt: state.timer.startedAt ?? action.now,
        },
      };
    }

    case 'timer/pause': {
      if (state.timer.status !== 'running' || state.timer.endsAt == null) return state;
      return {
        ...state,
        timer: {
          ...state.timer,
          status: 'paused',
          remainingMs: Math.max(0, state.timer.endsAt - action.now),
          endsAt: null,
        },
      };
    }

    case 'timer/reset':
      return {
        ...state,
        timer: {
          ...state.timer,
          status: 'idle',
          endsAt: null,
          remainingMs: action.durationMs,
          durationMs: action.durationMs,
          startedAt: null,
        },
      };

    case 'timer/finish': {
      const finished = state.timer.mode;
      const cycleCount = finished === 'focus' ? state.timer.completedInCycle + 1 : 0;

      // A finished focus block is the only thing worth writing to history.
      let focusHistory = state.focusHistory;
      if (finished === 'focus' && state.timer.startedAt != null) {
        const task = state.tasks.find((t) => t.id === state.timer.taskId) ?? null;
        const record: FocusSessionRecord = {
          id: newId('fs'),
          mode: 'focus',
          taskId: task?.id ?? null,
          taskName: task?.name ?? null,
          startedAt: state.timer.startedAt,
          endedAt: action.now,
          focusMinutes: Math.round(state.timer.durationMs / 60_000),
          completed: true,
        };
        focusHistory = [record, ...focusHistory].slice(0, 500);
      }

      const next = finished === 'focus' ? nextMode(cycleCount, state.settings) : 'focus';
      const durationMs = action.durationMs(next);
      // Breaks roll straight on so the pause actually happens; the return to
      // focus waits for a deliberate tap rather than starting a countdown
      // nobody asked for.
      const autoStart = next !== 'focus';

      return {
        ...state,
        focusHistory,
        tasks:
          finished === 'focus' && state.timer.taskId
            ? state.tasks.map((t) =>
                t.id === state.timer.taskId ? { ...t, done: t.done + 1 } : t,
              )
            : state.tasks,
        timer: {
          ...state.timer,
          mode: next,
          status: autoStart ? 'running' : 'idle',
          durationMs,
          remainingMs: durationMs,
          endsAt: autoStart ? action.now + durationMs : null,
          startedAt: autoStart ? action.now : null,
          completedInCycle: cycleCount,
        },
      };
    }

    case 'meal/add':
      return { ...state, meals: [action.meal, ...state.meals].slice(0, 500) };

    case 'meal/remove':
      return { ...state, meals: state.meals.filter((m) => m.id !== action.id) };

    case 'demo/clear':
      return {
        ...state,
        demoSeeded: false,
        meals: state.meals.filter((m) => !m.id.startsWith('seed_meal_')),
        sessions: state.sessions.filter((s) => !s.id.startsWith('seed_sess_')),
        tasks: state.tasks.filter((t) => !t.id.startsWith('seed_task_')),
      };

    default:
      return state;
  }
}

/* -------------------------------------------------------------- persistence */

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.version !== STATE_VERSION) return initialState();
    // Settings gained over time must not leave holes in stored state.
    parsed.settings = { ...defaultSettings(parsed.settings.firstLaunchAt), ...parsed.settings };
    if (parsed.timer?.status === 'running' && parsed.timer.endsAt == null) {
      parsed.timer = { ...parsed.timer, status: 'paused', endsAt: null };
    }
    return parsed;
  } catch {
    return initialState();
  }
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked — the app keeps working for this session.
  }
}

/* ------------------------------------------------------------------ context */

interface StoreValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  /** Live milliseconds left on the running timer. */
  remainingMs: number;
  /** 0 while untouched, 1 when the phase is complete. */
  progress: number;
  /** Wall-clock time the UI last re-rendered against. */
  now: number;
  modeDuration: (mode: TimerMode) => number;
  /** True when a focus block is running or paused mid-way. */
  focusInProgress: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [now, setNow] = useState(() => Date.now());
  const completedRef = useRef<number | null>(null);

  // Persist on every change; the payload is small and writes are cheap.
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Theme: dark is the default and light is a first-class companion.
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const prefersLight =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: light)').matches;
      const resolved =
        state.settings.theme === 'system' ? (prefersLight ? 'light' : 'dark') : state.settings.theme;
      root.dataset.theme = resolved;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', resolved === 'light' ? '#f6f7f9' : '#111316');
    };
    apply();
    if (state.settings.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [state.settings.theme]);

  const modeDuration = useCallback(
    (mode: TimerMode) => modeDurationMs(state.settings, mode),
    [state.settings],
  );

  // Tick only while something is actually running.
  useEffect(() => {
    if (state.timer.status !== 'running') return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [state.timer.status, state.timer.endsAt]);

  // Completing a phase is an event, not a render side effect: guard against
  // firing twice for the same end timestamp (StrictMode double-invokes effects).
  useEffect(() => {
    const { status, endsAt } = state.timer;
    if (status !== 'running' || endsAt == null) return;
    if (now < endsAt) return;
    if (completedRef.current === endsAt) return;
    completedRef.current = endsAt;
    dispatch({ type: 'timer/finish', now, durationMs: modeDuration });
  }, [now, state.timer, modeDuration]);

  const remainingMs =
    state.timer.status === 'running' && state.timer.endsAt != null
      ? Math.max(0, state.timer.endsAt - now)
      : state.timer.remainingMs;

  const progress =
    state.timer.durationMs > 0
      ? Math.min(1, Math.max(0, 1 - remainingMs / state.timer.durationMs))
      : 0;

  const value = useMemo<StoreValue>(
    () => ({
      state,
      dispatch,
      remainingMs,
      progress,
      now,
      modeDuration,
      focusInProgress: state.timer.mode === 'focus' && state.timer.status !== 'idle',
    }),
    [state, remainingMs, progress, now, modeDuration],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside AppStateProvider');
  return ctx;
}

export type { MealEntry, SessionRecord, Workout };
