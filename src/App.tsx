import { useCallback, useEffect, useState } from 'react';
import { BottomNav, SideNav } from './components/SideNav';
import { AppHeader } from './components/AppHeader';
import { HomeScreen } from './screens/HomeScreen';
import { MoveScreen } from './screens/move/MoveScreen';
import { FocusScreen } from './screens/focus/FocusScreen';
import { NourishScreen } from './screens/nourish/NourishScreen';
import { WorkoutSession } from './screens/move/WorkoutSession';
import { StretchFlow } from './screens/move/StretchFlow';
import { ExerciseSheet } from './screens/sheets/ExerciseSheet';
import { WorkoutBuilderSheet } from './screens/sheets/WorkoutBuilderSheet';
import { FocusSettingsSheet } from './screens/sheets/FocusSettingsSheet';
import { AddTaskSheet } from './screens/sheets/AddTaskSheet';
import { MealSheet } from './screens/sheets/MealSheet';
import { RecipeSheet } from './screens/sheets/RecipeSheet';
import { InsightSheet } from './screens/sheets/InsightSheet';
import { SettingsSheet } from './screens/sheets/SettingsSheet';
import { useStore } from './state/store';
import { getExercise } from './data/exercises';
import { RECIPES } from './data/insights';
import type { SheetKind, TabId, Workout } from './types';

const TITLES: Record<TabId, string> = {
  home: 'Today',
  move: 'Movement',
  focus: 'Focus',
  nourish: 'Fuel',
};

export function App() {
  const [tab, setTab] = useState<TabId>('home');
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [session, setSession] = useState<Workout | null>(null);
  const [stretchOpen, setStretchOpen] = useState(false);
  const [builderDay, setBuilderDay] = useState<string | null>(null);

  // A new tab always starts at the top; scrolling mid-list into another module
  // is disorienting on a phone.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [tab]);

  // Fullscreen sessions hide the machinery; Esc is always a door out.
  useEffect(() => {
    if (!session && !stretchOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSession(null);
        setStretchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [session, stretchOpen]);

  const go = useCallback((next: TabId) => {
    setSheet(null);
    setTab(next);
  }, []);

  const startWorkout = useCallback((workout: Workout) => {
    setSheet(null);
    setSession(workout);
  }, []);

  const openExercise = useCallback((exerciseId: string) => {
    setSheet({ kind: 'exercise', exerciseId });
  }, []);

  const openSettings = useCallback(() => {
    setSheet(tab === 'focus' ? { kind: 'focus-settings' } : { kind: 'settings' });
  }, [tab]);

  return (
    <div className="min-h-screen bg-canvas">
      <SideNav active={tab} onChange={go} onOpenSettings={openSettings} />

      <div className="lg:pl-64">
        <AppHeader title={TITLES[tab]} onNavigate={go} onOpenSettings={openSettings} />
        <main>
          {tab === 'home' && (
            <HomeScreenWrapper
              onNavigate={go}
              onOpenSheet={setSheet}
              onStartWorkout={startWorkout}
            />
          )}
          {tab === 'move' && (
            <MoveScreen
              onStartWorkout={startWorkout}
              onStartStretch={() => setStretchOpen(true)}
              onOpenSheet={setSheet}
              onOpenExercise={openExercise}
              onAddWorkout={setBuilderDay}
            />
          )}
          {tab === 'focus' && <FocusScreen onOpenSheet={setSheet} />}
          {tab === 'nourish' && (
            <NourishScreen
              onOpenSheet={setSheet}
              onOpenMeal={(mealId) => setSheet({ kind: 'meal', mealId })}
            />
          )}
        </main>

        {!session && !stretchOpen && <BottomNav active={tab} onChange={go} />}
      </div>

      <Sheets sheet={sheet} onClose={() => setSheet(null)} onOpenSheet={setSheet} />

      {builderDay && (
        <WorkoutBuilderSheet
          day={builderDay}
          onClose={() => setBuilderDay(null)}
          onStart={(workout) => {
            setBuilderDay(null);
            startWorkout(workout);
          }}
        />
      )}

      {session && <WorkoutSession workout={session} onClose={() => setSession(null)} />}
      {stretchOpen && <StretchFlow onClose={() => setStretchOpen(false)} />}
    </div>
  );
}

/* The dashboard needs the focus-tab props wired: the header can't reach
  in there itself, so pass the composite callbacks. */
function HomeScreenWrapper({
  onNavigate,
  onOpenSheet,
  onStartWorkout,
}: {
  onNavigate: (tab: TabId) => void;
  onOpenSheet: (sheet: SheetKind) => void;
  onStartWorkout: (workout: Workout) => void;
}) {
  return (
    <HomeScreen
      onNavigate={onNavigate}
      onOpenSheet={onOpenSheet}
      onStartWorkout={onStartWorkout}
    />
  );
}

/** One switch for every sheet, so no screen has to know how overlays stack. */
function Sheets({
  sheet,
  onClose,
  onOpenSheet,
}: {
  sheet: SheetKind;
  onClose: () => void;
  onOpenSheet: (sheet: SheetKind) => void;
}) {
  const { state } = useStore();
  if (!sheet) return null;

  switch (sheet.kind) {
    case 'exercise': {
      const exercise = getExercise(sheet.exerciseId);
      if (!exercise) return null;
      return <ExerciseSheet exercise={exercise} onClose={onClose} />;
    }
    case 'focus-settings':
      return <FocusSettingsSheet onClose={onClose} />;
    case 'add-task':
      return <AddTaskSheet onClose={onClose} />;
    case 'meal': {
      const meal = state.meals.find((m) => m.id === sheet.mealId);
      if (!meal) return null;
      return <MealSheet meal={meal} onClose={onClose} />;
    }
    case 'recipe': {
      const recipe = RECIPES.find((r) => r.id === sheet.recipeId) ?? RECIPES[0]!;
      return <RecipeSheet recipe={recipe} onClose={onClose} />;
    }
    case 'insight':
      return <InsightSheet onClose={onClose} />;
    case 'settings':
      return (
        <SettingsSheet
          onClose={onClose}
          onOpenFocusSettings={() => onOpenSheet({ kind: 'focus-settings' })}
        />
      );
    case 'stretch-onboarding':
      return <StretchFlow onClose={onClose} />;
    case 'workout-builder':
      return null;
    default:
      return null;
  }
}
