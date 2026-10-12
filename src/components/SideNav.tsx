import { Activity, Dumbbell, House, Leaf, Settings2, Timer } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TabId } from '../types';

interface SideNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
  onOpenSettings: () => void;
}

interface NavEntry {
  id: TabId;
  label: string;
  icon: LucideIcon;
  hint: string;
}

const MODULES: NavEntry[] = [
  { id: 'home', label: 'Dashboard', icon: House, hint: 'Today at a glance' },
  { id: 'move', label: 'Move', icon: Dumbbell, hint: 'Workouts & stretching' },
  { id: 'focus', label: 'Focus', icon: Timer, hint: 'Pomodoro & breaks' },
  { id: 'nourish', label: 'Nourish', icon: Leaf, hint: 'Food & health' },
];

/**
 * Desktop navigation.
 *
 * The bottom dock is a thumb-zone pattern; on a wide screen it would stretch
 * into a bar you have to travel to. The mock replaces it with a fixed rail, so
 * the same four destinations become a vertical list that stays in place while
 * the content column scrolls.
 */
export function SideNav({ active, onChange, onOpenSettings }: SideNavProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col justify-between border-r border-line bg-surface px-4 py-6 lg:flex">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-3 text-focus shadow-[0_0_24px_-4px_rgba(45,212,191,0.35)]">
            <Activity size={19} strokeWidth={2} />
          </span>
          <span className="flex flex-col">
            <span className="text-[1.0625rem] font-semibold leading-6 tracking-tight text-ink">
              Life App
            </span>
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-focus">
              Mindful rhythm
            </span>
          </span>
        </div>

        <div className="h-px w-full bg-line" />

        <div className="flex flex-col gap-1.5">
          <span className="px-2 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
            Modules
          </span>
          <nav aria-label="Modules" className="flex flex-col gap-1">
            {MODULES.map((entry) => {
              const Icon = entry.icon;
              const isActive = active === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onChange(entry.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors ${
                    isActive
                      ? 'bg-surface-3 text-ink shadow-[0_0_20px_-6px_var(--shadow-color)]'
                      : 'text-ink-2 hover:bg-surface-2'
                  }`}
                >
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.2 : 1.75}
                    className={isActive ? 'text-ink' : 'text-ink-3'}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.875rem] font-medium leading-5">
                      {entry.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.6875rem] text-ink-3">
                      {entry.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="px-2 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Preferences
        </span>
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-left text-ink-2 transition-colors hover:bg-surface-2"
        >
          <Settings2 size={19} strokeWidth={1.75} className="text-ink-3" aria-hidden />
          <span className="text-[0.875rem] font-medium">Settings</span>
        </button>

        <p className="mt-2 px-2 text-[0.6875rem] leading-5 text-ink-3">
          Everything stays on this device. No account, no server.
        </p>
      </div>
    </aside>
  );
}
