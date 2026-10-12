import { Search } from 'lucide-react';
import type { TabId } from '../types';
import { HeaderActions } from './SideNav';

/**
 * App-wide header in the Remix style: the destination title on the left, a
 * command-search field in the middle (visual, with ⌘K hint), the + Add menu
 * and settings on the right. One of these, always visible from tablet up.
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

        <div className="mx-auto hidden w-full max-w-md items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2 text-ink-3 md:flex">
          <Search size={15} aria-hidden />
          <span className="flex-1 text-[0.8125rem]">Search or jump to...</span>
          <kbd className="font-tech rounded-md border border-line bg-surface-3 px-1.5 py-0.5 text-[0.625rem] text-ink-3">
            ⌘K
          </kbd>
        </div>

        <div className="ml-auto flex flex-shrink-0 items-center md:ml-0">
          <HeaderActions onNavigate={onNavigate} onOpenSettings={onOpenSettings} />
        </div>
      </div>
    </header>
  );
}
