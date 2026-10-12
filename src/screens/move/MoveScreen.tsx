import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { ChipTabs } from '../../components/Chip';
import { CONTAINER, TopBar } from '../../components/TopBar';
import { IconButton } from '../../components/Button';
import { ScheduleView } from './ScheduleView';
import { ExercisesView } from './ExercisesView';
import { HistoryView } from './HistoryView';
import type { MoveView, SheetKind, Workout } from '../../types';

interface MoveScreenProps {
  onStartWorkout: (workout: Workout) => void;
  onStartStretch: () => void;
  onOpenSheet: (sheet: SheetKind) => void;
  onOpenExercise: (exerciseId: string) => void;
  onAddWorkout: (day: string) => void;
}

const VIEWS: Array<{ id: MoveView; label: string }> = [
  { id: 'schedule', label: 'Schedule' },
  { id: 'exercises', label: 'Exercises' },
  { id: 'history', label: 'History' },
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
      <TopBar
        label="Move"
        title="Workouts & stretching"
        right={
          <IconButton label="Move settings" onClick={() => onOpenSheet({ kind: 'settings' })}>
            <Settings2 size={19} />
          </IconButton>
        }
      >
        <ChipTabs items={VIEWS} value={view} onChange={setView} accent="move" />
      </TopBar>
      <div className={`${CONTAINER} pb-40 pt-4 lg:pb-16 lg:pt-8`}>
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
