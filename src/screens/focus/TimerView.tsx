import { useEffect, useState } from 'react';
import { Eye, GripVertical, Pause, Play, Plus, RotateCcw, SkipForward, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { Card, SectionLabel } from '../../components/Card';
import { Ring } from '../../components/Ring';
import { ExerciseArt } from '../../components/ExerciseArt';
import { useStore } from '../../state/store';
import type { SheetKind, TimerMode } from '../../types';
import { formatClock } from '../../lib/format';
import { getExercise } from '../../data/exercises';
import { BREAK_STRETCHES } from '../../data/insights';

const MODES: Array<{ id: TimerMode; label: string }> = [
  { id: 'focus', label: 'Pomodoro' },
  { id: 'short', label: 'Short break' },
  { id: 'long', label: 'Long break' },
];

interface TimerViewProps {
  onOpenSheet: (sheet: SheetKind) => void;
}

export function TimerView({ onOpenSheet }: TimerViewProps) {
  const { state, dispatch, remainingMs, progress, modeDuration } = useStore();
  const { timer, settings, tasks } = state;
  const [stretchDismissed, setStretchDismissed] = useState(false);
  const [eyeRestEndsAt, setEyeRestEndsAt] = useState<number | null>(null);
  const [eyeNow, setEyeNow] = useState(() => Date.now());

  const isBreak = timer.mode !== 'focus';
  const running = timer.status === 'running';
  const activeTask = tasks.find((t) => t.id === timer.taskId) ?? null;

  // A fresh break deserves a fresh prompt.
  useEffect(() => {
    if (isBreak) setStretchDismissed(false);
  }, [isBreak, timer.mode]);

  useEffect(() => {
    if (eyeRestEndsAt == null) return;
    setEyeNow(Date.now());
    const id = window.setInterval(() => setEyeNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [eyeRestEndsAt]);

  useEffect(() => {
    if (eyeRestEndsAt != null && eyeNow >= eyeRestEndsAt) setEyeRestEndsAt(null);
  }, [eyeNow, eyeRestEndsAt]);

  const breakStretch =
    BREAK_STRETCHES[settings.stretchGoal] ??
    BREAK_STRETCHES.back ??
    [];
  const prompt = breakStretch[timer.completedInCycle % Math.max(1, breakStretch.length)];
  const promptExercise = prompt ? getExercise(prompt.exerciseId) : undefined;

  const switchMode = (mode: TimerMode) => {
    if (mode === timer.mode) return;
    dispatch({ type: 'timer/setMode', mode, durationMs: modeDuration(mode) });
  };

  return (
    <div
      className={`transition-opacity duration-500 lg:grid lg:grid-cols-12 lg:items-start lg:gap-6 ${isBreak ? 'opacity-95' : ''}`}
    >
      <div className="space-y-4 lg:col-span-7">
      <Card className={`text-center ${isBreak ? 'bg-surface' : ''}`}>
        <div className="flex items-center justify-center">
          <Ring
            progress={progress}
            color={isBreak ? 'var(--ink-3)' : 'var(--focus)'}
            size={252}
            stroke={10}
            glow={running}
            label={`${formatClock(remainingMs)} remaining`}
          />
        </div>

        {/* The duration reads below the ring, at a size you can catch at a glance. */}
        <p className="tnum mt-4 text-[2.75rem] font-semibold leading-none tracking-tight text-ink">
          {formatClock(remainingMs)}
        </p>
        <p className="mt-2 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink-3">
          {timer.mode === 'focus' ? 'Pomodoro' : timer.mode === 'short' ? 'Short break' : 'Long break'}
          {activeTask ? ` · ${activeTask.name}` : ''}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {MODES.map((mode) => {
            const selected = timer.mode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                aria-pressed={selected}
                onClick={() => switchMode(mode.id)}
                className={`rounded-full border px-4 py-2 text-[0.75rem] font-medium transition-colors ${
                  selected
                    ? 'border-transparent bg-focus-soft text-focus'
                    : 'border-line bg-surface-2 text-ink-2'
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>

        <p className="tnum mt-3 text-[0.75rem] text-ink-3">
          {Math.round(timer.durationMs / 60_000)} min · {timer.completedInCycle} of{' '}
          {settings.sessionsBeforeLong} before a long break
        </p>

        <div className="mt-5 flex items-center justify-center gap-2.5">
          <Button
            accent="focus"
            size="lg"
            className="min-w-[132px]"
            icon={running ? <Pause size={18} /> : <Play size={18} />}
            onClick={() => {
              if (running) dispatch({ type: 'timer/pause', now: Date.now() });
              else dispatch({ type: 'timer/start', now: Date.now() });
            }}
          >
            {running ? 'Pause' : timer.status === 'paused' ? 'Resume' : 'Start'}
          </Button>
          <Button
            accent="focus"
            variant="ghost"
            size="lg"
            icon={<RotateCcw size={17} />}
            aria-label="Reset the current phase"
            onClick={() => dispatch({ type: 'timer/reset', durationMs: modeDuration(timer.mode) })}
          >
            Reset
          </Button>
        </div>
      </Card>

      {/* Break screen: the room dims and one small thing is offered. */}
      {isBreak && settings.stretchOnBreak && !stretchDismissed && promptExercise && (
        <Card elevated className="animate-rise">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <SectionLabel>While you are away</SectionLabel>
            </div>
            <button
              type="button"
              aria-label="Dismiss stretch prompt"
              onClick={() => setStretchDismissed(true)}
              className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-ink-3"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <ExerciseArt exercise={promptExercise} size={72} rounded="rounded-2xl" />
            <div className="min-w-0 flex-1">
              <h3 className="text-[0.9375rem] font-medium text-ink">{promptExercise.name}</h3>
              <p className="mt-1 text-[0.75rem] leading-5 text-ink-2">{prompt?.line}</p>
            </div>
          </div>

          {settings.eyeRest && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Eye size={16} className="flex-shrink-0 text-ink-3" />
                <p className="text-[0.75rem] leading-5 text-ink-2">
                  Look at something 6&nbsp;m away for 20 seconds.
                </p>
              </div>
              {eyeRestEndsAt != null ? (
                <span className="tnum flex-shrink-0 text-[0.8125rem] font-semibold text-focus">
                  {Math.ceil(Math.max(0, eyeRestEndsAt - eyeNow) / 1000)}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setEyeRestEndsAt(Date.now() + 20_000)}
                  className="flex-shrink-0 text-[0.75rem] font-medium text-focus"
                >
                  Start
                </button>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Manual skip stays available for anyone who prefers to steer. */}
      <div className="hidden justify-center pt-1 lg:flex">
        <button
          type="button"
          onClick={() => dispatch({ type: 'timer/finish', now: Date.now(), durationMs: modeDuration })}
          className="inline-flex items-center gap-1.5 text-[0.75rem] text-ink-3"
        >
          <SkipForward size={13} /> Skip this phase
        </button>
      </div>
      </div>

      <div className="space-y-4 lg:col-span-5">
      {/* Task list: the plan for the session, not a to-do inbox. */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <SectionLabel>Tasks</SectionLabel>
          <span className="text-[0.6875rem] text-ink-3">
            {activeTask ? 'Tap another to switch' : 'Tap a task to focus on it'}
          </span>
        </div>

        <ul className="space-y-2">
          {tasks.map((task) => {
            const selected = task.id === timer.taskId;
            return (
              <li key={task.id}>
                <div
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                    selected ? 'border-transparent bg-focus-soft' : 'border-line bg-surface'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({ type: 'task/select', id: selected ? null : task.id })
                    }
                    aria-pressed={selected}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <GripVertical size={15} className="flex-shrink-0 text-ink-3" />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-[0.875rem] ${selected ? 'font-medium text-focus' : 'text-ink'}`}
                      >
                        {task.name}
                      </span>
                      <span className="mt-1.5 flex items-center gap-1.5">
                        {Array.from({ length: task.planned }, (_, i) => (
                          <span
                            key={i}
                            className={`h-1.5 w-1.5 rounded-full ${
                              i < task.done ? 'bg-move' : 'bg-track'
                            }`}
                          />
                        ))}
                        <span className="tnum ml-1 text-[0.625rem] text-ink-3">
                          {task.done}/{task.planned}
                        </span>
                      </span>
                    </span>
                  </button>
                  {selected && running && (
                    <span className="flex-shrink-0 rounded-full bg-focus px-2 py-0.5 text-[0.625rem] font-semibold text-focus-ink">
                      Active
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <Button
          accent="focus"
          variant="soft"
          block
          className="mt-3"
          icon={<Plus size={16} />}
          onClick={() => onOpenSheet({ kind: 'add-task' })}
        >
          Add task
        </Button>
      </div>

      {/* Manual skip stays available for anyone who prefers to steer. */}
      <div className="flex justify-center pt-1 lg:hidden">
        <button
          type="button"
          onClick={() => dispatch({ type: 'timer/finish', now: Date.now(), durationMs: modeDuration })}
          className="inline-flex items-center gap-1.5 text-[0.75rem] text-ink-3"
        >
          <SkipForward size={13} /> Skip this phase
        </button>
      </div>

      {timer.completedInCycle > 0 && !isBreak && (
        <Card pad="sm" className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-focus" aria-hidden />
          <p className="text-[0.75rem] leading-5 text-ink-2">
            {timer.completedInCycle} pomodoro{timer.completedInCycle === 1 ? '' : 's'} banked this
            cycle. Breaks arrive on their own — you do not need to track them.
          </p>
        </Card>
      )}
      </div>
    </div>
  );
}
