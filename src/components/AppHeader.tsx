import type { TabId } from '../types';
import { HeaderActions } from './SideNav';

/**
 * App-wide header in the Remix style: the destination title on the left, the
 * + Add menu and settings on the right. One of these, always visible from
 * tablet up. The search field was removed: it promised ⌘K it could not keep.
 */
export function AppHeader({
  title,
  onNavigate,
  onOpenSettings,
}: {
  title: string;
  onNavigate: (tab: TabId) => void;
  onOpenSettings: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 pt-safe backdrop-blur-xl">
      <div className="flex h-14 items-center gap-4 px-4 md:px-10">
        <h1 className="min-w-0 flex-shrink-0 font-display text-[1.125rem] font-semibold tracking-tight text-ink">
          {title}
        </h1>

        <div className="ml-auto flex flex-shrink-0 items-center md:ml-0">
          <HeaderActions onNavigate={onNavigate} onOpenSettings={onOpenSettings} />
        </div>
      </div>
    </header>
  );
}
