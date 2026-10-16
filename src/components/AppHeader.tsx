import { HeaderActions } from './SideNav';
import { CONTAINER } from './TopBar';

/**
 * App-wide header in the Remix style: the destination title on the left, the
 * + Add menu and settings on the right. One of these, always visible from
 * tablet up. The search field was removed: it promised ⌘K it could not keep.
 */
export function AppHeader({
  title,
  onNewTask,
  onLogMeal,
  onPlanWorkout,
  onOpenSettings,
}: {
  title: string;
  onNewTask: () => void;
  onLogMeal: () => void;
  onPlanWorkout: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 pt-safe backdrop-blur-xl">
      <div className={`${CONTAINER} flex h-14 items-center gap-4`}>
        <h1 className="min-w-0 flex-shrink-0 font-display text-[1.125rem] font-semibold tracking-tight text-ink">
          {title}
        </h1>

        <div className="ml-auto flex flex-shrink-0 items-center md:ml-0">
          <HeaderActions
            onNewTask={onNewTask}
            onLogMeal={onLogMeal}
            onPlanWorkout={onPlanWorkout}
            onOpenSettings={onOpenSettings}
          />
        </div>
      </div>
    </header>
  );
}
