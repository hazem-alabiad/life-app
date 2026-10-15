import { useState } from 'react';
import { CONTAINER } from '../../components/TopBar';
import { ChipTabs } from '../../components/Chip';
import { ScheduleView } from './ScheduleView';
import { ExercisesView } from './ExercisesView';
import { HistoryView } from './HistoryView';
import type { MoveView, Workout } from '../../types';

interface MoveScreenProps {
  onStartWorkout: (workout: Workout) => void;
  onStartStretch: () => void;
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
  onOpenExercise,
  onAddWorkout,
}: MoveScreenProps) {
  const [view, setView] = useState<MoveView>('schedule');

  return (
    <>
      {/* App.tsx already renders the page header; this screen only layers
          its own view switcher beneath it. */}
      {/* View switcher in the shared tab style. */}
      <div className="sticky top-14 z-20 border-b border-line bg-canvas/85 backdrop-blur-xl">
        <div className={CONTAINER}>
          <ChipTabs<MoveView>
            items={VIEWS}
            value={view}
            onChange={setView}
            accent="move"
            className="py-3"
          />
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
