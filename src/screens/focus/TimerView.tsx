import { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Headphones,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipForward,
  Target,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { ChipTabs } from '../../components/Chip';
import { Tag } from '../../components/Chip';
import { SectionLabel } from '../../components/Card';
import { Ring } from '../../components/Ring';
import { useStore } from '../../state/store';
import type { SheetKind, TimerMode } from '../../types';
import { formatClock } from '../../lib/format';
import { getExercise } from '../../data/exercises';
import { BREAK_STRETCHES } from '../../data/insights';

const MODES: Array<{ id: TimerMode; label: string }> = [
  { id: 'focus', label: '25m Sprint' },
  { id: 'short', label: '5m Posture Break' },
  { id: 'long', label: '15m Restorative' },
];

interface TimerViewProps {
  onOpenSheet: (sheet: SheetKind) => void;
}

/**
 * Focus module in the Remix style: "Deep Work Sprint" header, mode chips, a
 * large ring with mono digits, ambient/posture side cards, then the grouped
 * task queue anchored by the current timer target.
 */
export function TimerView({ onOpenSheet }: TimerViewProps) {
  const { state, dispatch, remainingMs, progress, modeDuration } = useStore();
  const { timer, settings, tasks } = state;

  const isBreak = timer.mode !== 'focus';
  const running = timer.status === 'running';
  const activeTask = tasks.find((t) => t.id === timer.taskId) ?? null;

  const breakStretch =
    BREAK_STRETCHES[settings.stretchGoal] ?? BREAK_STRETCHES.back ?? [];
  const prompt = breakStretch[timer.completedInCycle % Math.max(1, breakStretch.length)];
  const promptExercise = prompt ? getExercise(prompt.exerciseId) : undefined;
  const [stretchDismissed, setStretchDismissed] = useState(false);

  const switchMode = (mode: TimerMode) => {
    if (mode === timer.mode) return;
    dispatch({ type: 'timer/setMode', mode, durationMs: modeDuration(mode) });
  };

  const cyclePct =
    timer.completedInCycle > 0
      ? Math.round((timer.completedInCycle / settings.sessionsBeforeLong) * 100)
      : 0;

  // Drag-and-drop reorder state. Native HTML5 DnD — no library, no bundle
  // cost. Pointer path only: touch and keyboard users get the up/down
  // chevrons on every row, which dispatch the same order change.
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const endDrag = () => {
    setDragId(null);
    setDropIndex(null);
  };

  return (
    <div className="space-y-6">
      {isBreak && settings.stretchOnBreak && !stretchDismissed && promptExercise && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-focus/30 bg-focus-soft px-5 py-4">
          <div className="min-w-0">
            <p className="font-tech text-[0.72rem] uppercase tracking-[0.12em] text-ink-3">
              While you are away
            </p>
            <p className="mt-1 text-[0.875rem] font-medium text-ink">
              {promptExercise.name} — {prompt?.line}
            </p>
          </div>
          <button
            type="button"
            aria-label="Dismiss stretch prompt"
            onClick={() => setStretchDismissed(true)}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-ink-3"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
        {/* Timer column. */}
        <section className="space-y-4 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-[2rem] font-bold tracking-tight text-ink">
              Deep Work Sprint
            </h2>
            <span className="font-tech rounded-lg bg-focus-soft px-2.5 py-1 text-[0.72rem] font-semibold text-focus">
              cycle {Math.min(timer.completedInCycle + 1, settings.sessionsBeforeLong)} of{' '}
              {settings.sessionsBeforeLong}
            </span>
          </div>

          <ChipTabs<TimerMode>
            items={MODES}
            value={timer.mode}
            onChange={switchMode}
            accent="focus"
          />

          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 md:p-8">
            <div className="flex items-center justify-center">
              <Ring
                progress={progress}
                color="var(--focus)"
                size={280}
                stroke={8}
                glow={running}
                label={`${formatClock(remainingMs)} remaining`}
              >
                <span className="font-tech tnum text-[3rem] font-semibold leading-none tracking-tight text-ink">
                  {formatClock(remainingMs)}
                </span>
                <span className="mt-2 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-ink-3">
                  {running ? 'Active flow' : timer.status === 'paused' ? 'Paused' : 'Ready'}
                </span>
                <span className="font-tech mt-1 text-[0.72rem] text-focus">
                  {Math.round(progress * 100)}% completed
                </span>
              </Ring>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                aria-label="Reset the current phase"
                onClick={() => dispatch({ type: 'timer/reset', durationMs: modeDuration(timer.mode) })}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface-2 text-ink-2 transition-colors hover:bg-surface-3"
              >
                <RotateCcw size={17} />
              </button>
              <Button
                accent="focus"
                size="lg"
                className="min-w-[180px]"
                icon={running ? <Pause size={18} /> : <Play size={18} />}
                onClick={() => {
                  if (running) dispatch({ type: 'timer/pause', now: Date.now() });
                  else dispatch({ type: 'timer/start', now: Date.now() });
                }}
              >
                {running ? 'Pause Sprint' : timer.status === 'paused' ? 'Resume Sprint' : 'Start Sprint'}
              </Button>
              <button
                type="button"
                aria-label="Skip this phase"
                onClick={() =>
                  dispatch({ type: 'timer/finish', now: Date.now(), durationMs: modeDuration })
                }
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface-2 text-ink-2 transition-colors hover:bg-surface-3"
              >
                <SkipForward size={17} />
              </button>
            </div>

            {activeTask && (
              <div className="mt-6 flex justify-center">
                <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-focus/40 bg-canvas px-3.5 py-1.5">
                  <Target size={13} className="flex-shrink-0 text-focus" />
                  <span className="truncate font-tech text-[0.75rem] text-ink-2">
                    {activeTask.name}
                  </span>
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Side column: ambient sound + posture protocol. */}
        <aside className="space-y-4 lg:col-span-4">
          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
            <div className="flex items-center gap-2">
              <Headphones size={15} className="text-focus" />
              <SectionLabel>Ambient Bio-Acoustics</SectionLabel>
            </div>
            <p className="mt-2 text-[0.8125rem] leading-5 text-ink-2">
              Synthesized audio hum to mask background chatter and enhance focus coherence.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[ 'Binaural', 'Pink Rain' ].map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-between gap-2 rounded-xl border border-line bg-canvas px-3.5 py-3 text-[0.8125rem] text-ink-3"
                >
                  <span className="flex items-center gap-2">
                    {name} <Volume2 size={14} aria-hidden />
                  </span>
                  <Tag>Soon</Tag>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
            <SectionLabel>Interleaved Posture Protocol</SectionLabel>
            <h3 className="mt-2 font-display text-[1.0625rem] font-semibold text-ink">
              Posture Micro-Break Stretch
            </h3>
            <p className="mt-1.5 text-[0.8125rem] text-ink-2">
              When this {Math.round(timer.durationMs / 60_000)}m cycle completes, run the sequence:
            </p>
            <ol className="mt-3 space-y-2">
              {promptExercise
                ? promptExercise.instructions.slice(0, 3).map((line, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-[0.8125rem] leading-5 text-ink-2"
                    >
                      <span className="font-tech mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-focus-soft text-[0.6875rem] font-semibold text-focus">
                        {i + 1}
                      </span>
                      <span>{line}</span>
                    </li>
                  ))
                : [
                    'Stand tall, expand the ribcage (30s)',
                    'Gentle neck retractions (30s)',
                    'Look 6m away and breathe (20s)',
                  ].map((line, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-[0.8125rem] leading-5 text-ink-2"
                    >
                      <span className="font-tech mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-focus-soft text-[0.6875rem] font-semibold text-focus">
                        {i + 1}
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
            </ol>
          </div>
        </aside>
      </div>

      {/* Sprint target + queue. */}
      <div className="mt-8 space-y-3">
        <div>
          <p className="font-tech text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">
            Sprint target &amp; queue
          </p>
          <h2 className="mt-1 font-display text-[1.5rem] font-semibold tracking-tight text-ink">
            Task queue
          </h2>
        </div>

        {activeTask && (
          <div className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-focus/40 bg-canvas px-4 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-focus-soft text-focus">
                <Target size={15} />
              </span>
              <div className="min-w-0">
                <p className="font-tech text-[0.65rem] uppercase tracking-[0.14em] text-ink-3">
                  Current timer focus target
                </p>
                <p className="truncate text-[0.875rem] font-medium text-ink">{activeTask.name}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: 'task/select', id: null })}
              className="flex-shrink-0 rounded-lg border border-line px-3 py-1.5 text-[0.75rem] font-medium text-ink-2 transition-colors hover:bg-surface-2"
            >
              Clear Target
            </button>
          </div>
        )}

        <div className="rounded-[var(--radius-card)] border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 md:px-5">
            <div className="flex items-center gap-2.5">
              <span className="font-display text-[1rem] font-semibold text-ink">Tasks</span>
              <span className="font-tech rounded-full bg-surface-3 px-2 py-0.5 text-[0.6875rem] text-ink-3">
                {tasks.reduce((sum, t) => sum + t.planned, 0)} pomodoros planned
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                accent="focus"
                variant="soft"
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => onOpenSheet({ kind: 'add-task' })}
              >
                New Task
              </Button>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="border-t border-line px-5 py-8 text-center">
              <p className="text-[0.875rem] font-medium text-ink">No tasks queued</p>
              <p className="mt-1 text-[0.8125rem] text-ink-2">
                Add what deserves a sprint. One target per timer keeps the session honest.
              </p>
            </div>
          ) : (
            /* The queue collapses once a target is picked so the running
               view stays ring + controls + current target. Remounting on
               target change resets the disclosure: select collapses,
               clearing re-opens, manual toggle otherwise. */
            <details
              key={activeTask ? `target-${activeTask.id}` : 'no-target'}
              open={!activeTask}
              className="group border-t border-line"
            >
              <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-[0.75rem] font-medium text-ink-3 transition-colors hover:text-ink-2 md:px-5 [&::-webkit-details-marker]:hidden">
                <ChevronDown size={14} className="transition-transform group-open:rotate-180" aria-hidden />
                {activeTask ? `Queue · ${tasks.length - 1} other${tasks.length - 1 === 1 ? '' : 's'}` : `Task list · ${tasks.length}`}
              </summary>
              <ul className="divide-y divide-line border-t border-line">
              {tasks.map((task, index) => {
                const selected = task.id === timer.taskId;
                const isDragged = dragId === task.id;
                const isDropTarget = dropIndex === index && dragId != null && !isDragged;
                return (
                  <li
                    key={task.id}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dropIndex !== index) setDropIndex(index);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragId) dispatch({ type: 'task/move', id: dragId, toIndex: index });
                      endDrag();
                    }}
                    className={`px-4 py-3 transition-colors md:px-5 ${
                      isDragged ? 'opacity-50' : ''
                    } ${isDropTarget ? 'bg-focus-soft/40' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      {/* Drag handle. Not in tab order by design — keyboard
                          and touch reordering lives on the chevrons beside it. */}
                      <span
                        draggable
                        title={`Drag to reorder ${task.name}`}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', task.id);
                          e.dataTransfer.effectAllowed = 'move';
                          setDragId(task.id);
                        }}
                        onDragEnd={endDrag}
                        className="flex h-11 w-6 flex-shrink-0 cursor-grab items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface-2 active:cursor-grabbing"
                      >
                        <GripVertical size={14} />
                      </span>
                      <span
                        className="flex flex-shrink-0 flex-col"
                        role="group"
                        aria-label={`Reorder ${task.name}`}
                      >
                        <button
                          type="button"
                          aria-label={`Move ${task.name} up`}
                          disabled={index === 0}
                          onClick={() => dispatch({ type: 'task/reorder', id: task.id, direction: -1 })}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface-2 disabled:opacity-30"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Move ${task.name} down`}
                          disabled={index === tasks.length - 1}
                          onClick={() => dispatch({ type: 'task/reorder', id: task.id, direction: 1 })}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface-2 disabled:opacity-30"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({ type: 'task/select', id: selected ? null : task.id })
                        }
                        aria-pressed={selected}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                            selected
                              ? 'border-focus bg-focus text-focus-ink'
                              : 'border-line-strong'
                          }`}
                          aria-hidden
                        >
                          {selected && <Check size={12} strokeWidth={3} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate text-[0.875rem] font-medium ${
                              selected ? 'text-focus' : 'text-ink'
                            }`}
                          >
                            {task.name}
                          </span>
                          {/* One textual signal; the bar below carries the glanceable one. */}
                          <span className="font-tech mt-0.5 block text-[0.6875rem] text-ink-3">
                            {task.done}/{task.planned} poms
                          </span>
                        </span>
                      </button>
                      <span className="flex flex-shrink-0 items-center">
                        <button
                          type="button"
                          aria-label={`Remove ${task.name}`}
                          onClick={() => dispatch({ type: 'task/remove', id: task.id })}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-surface-2"
                        >
                          <Trash2 size={14} />
                        </button>
                      </span>
                    </div>
                    {/* Sub-progress bar. */}
                    <div className="mt-2.5 ml-8 h-1 w-full overflow-hidden rounded-full bg-track">
                      <div
                        className="h-full rounded-full bg-nourish transition-[width] duration-500"
                        style={{
                          width: `${(task.planned ? (task.done / task.planned) * 100 : 0) * 0.999}%`,
                        }}
                      />
                    </div>
                  </li>
                );
              })}
              </ul>
            </details>
          )}
        </div>

        <p className="font-tech text-[0.72rem] text-ink-3">
          {cyclePct > 0
            ? `${cyclePct}% of the cycle banked — breaks arrive on their own.`
            : 'Pick a target, start the sprint, and the cycle builds itself.'}
        </p>
      </div>
    </div>
  );
}
