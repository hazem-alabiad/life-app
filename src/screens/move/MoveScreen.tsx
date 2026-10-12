import { useState } from 'react';
import { AppHeader } from '../../components/AppHeader';
import { CONTAINER } from '../../components/TopBar';
import { ScheduleView } from './ScheduleView';
import { ExercisesView } from './ExercisesView';
import { HistoryView } from './HistoryView';
import type { MoveView, SheetKind, TabId, Workout } from '../../types';

interface MoveScreenProps {
  onStartWorkout: (workout: Workout) => void;
  onStartStretch: () => void;
  onOpenSheet: (sheet: SheetKind) => void;
  onOpenExercise: (exerciseId: string) => void;
  onAddWorkout: (day: string) => void;
}

const VIEWS: Array<{ id: MoveView; label: string }> = [
  { id: 'schedule', label: 'Weekly Schedule' },
  { id: 'exercises', label: 'Exercise Library' },
  { id: 'history', label: 'Training Log' },
];

export function MoveScreen({
  onStartWorkout,
  onStartStretch,
  onOpenSheet,
  onOpenExercise,
  onAddWorkout,
}: MoveScreenProps) {
  const [view, setView] = useState<MoveView>('schedule');

  return (
    <>
      <AppHeader
        title="Movement"
        onNavigate={(tab: TabId) => tab === 'move' ? undefined : undefined as never}
        onOpenSettings={() => onOpenSheet({ kind: 'settings' })}
      />
      {/* View switcher in the Remix pill style. */}
      <div className="sticky top-14 z-20 border-b border-line bg-canvas/85 backdrop-blur-xl">
        <div className={`${CONTAINER} flex flex-wrap items-center gap-2 py-3`}>
          {VIEWS.map((v) => {
            const selected = view === v.id;
            return (
              <button
                key={v.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setView(v.id)}
                className={`rounded-full px-4 py-2 text-[0.8125rem] font-medium transition-colors ${
                  selected
                    ? 'bg-move text-move-ink'
                    : 'border border-line bg-surface text-ink-2 hover:bg-surface-2'
                }`}
              >
                {v.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className={`${CONTAINER} pb-40 pt-5 lg:pb-16`}>
        {view === 'schedule' && (
          <ScheduleView
            onStartWorkout={onStartWorkout}
            onStartStretch={onStartStretch}
            onAddWorkout={onAddWorkout}
            onOpenExercise={onOpenExercise}
          />
        )}
        {view === 'exercises' && <ExercisesView onOpenExercise={onOpenExercise} />}
        {view === 'history' && <HistoryView />}
      </div>
    </>
  );
}
