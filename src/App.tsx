import { useCallback, useEffect, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { SideNav } from './components/SideNav';
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

const WEEK_MS = 7 * 86_400_000;

export function App() {
  const { state } = useStore();
  const [tab, setTab] = useState<TabId>('home');
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [session, setSession] = useState<Workout | null>(null);
  const [stretchOpen, setStretchOpen] = useState(false);
  const [builderDay, setBuilderDay] = useState<string | null>(null);

  // Labels are shown for the first week, then the icons carry it alone.
  const showLabels = Date.now() - state.settings.firstLaunchAt < WEEK_MS;

  // A new tab always starts at the top; scrolling mid-list into another module
  // is disorienting on a phone.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [tab]);

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

  return (
    <div className="min-h-screen bg-canvas">
      {/* Below lg the dock handles navigation; from lg the fixed rail takes
          over and the content column shifts clear of it. */}
      <SideNav active={tab} onChange={go} onOpenSettings={() => setSheet({ kind: 'settings' })} />

      <div className="lg:pl-72">
        <main>
          {tab === 'home' && (
            <HomeScreen
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

        {!session && !stretchOpen && (
          <BottomNav active={tab} onChange={go} showLabels={showLabels} />
        )}
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
