import { useState } from 'react';
import {
  Cloud,
  Dumbbell,
  House,
  ListPlus,
  Plus,
  Salad,
  Settings2,
  StretchVertical,
  Target,
  UtensilsCrossed,
} from 'lucide-react';
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
}

const MODULES: NavEntry[] = [
  { id: 'home', label: 'Today', icon: House },
  { id: 'move', label: 'Movement', icon: Dumbbell },
  { id: 'focus', label: 'Focus', icon: Target },
  { id: 'fuel', label: 'Fuel', icon: Salad },
];

/**
 * Desktop navigation rail in the Remix style: brand, four destinations, then
 * Cloud Synced + Settings pinned at the bottom. Compact rows, green selection.
 */
export function SideNav({ active, onChange, onOpenSettings }: SideNavProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col justify-between border-r border-line bg-canvas px-4 py-6 lg:flex">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2.5 px-1">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-nourish text-nourish-ink">
            <StretchVertical size={16} strokeWidth={2.2} />
          </span>
          <span className="font-display text-[1.25rem] font-semibold tracking-tight text-ink">
            Life
          </span>
        </div>

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
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? 'bg-surface-3 text-ink ring-1 ring-inset ring-nourish/30'
                    : 'text-ink-2 hover:bg-surface-2'
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.1 : 1.7}
                  className={isActive ? 'text-nourish' : 'text-ink-3'}
                  aria-hidden
                />
                <span className="text-[0.875rem] font-medium">{entry.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-1">
        <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-ink-2">
          <Cloud size={18} strokeWidth={1.7} className="text-nourish" aria-hidden />
          <span className="text-[0.875rem] font-medium">Cloud Synced</span>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-ink-2 transition-colors hover:bg-surface-2"
        >
          <Settings2 size={18} strokeWidth={1.7} className="text-ink-3" aria-hidden />
          <span className="text-[0.875rem] font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}

interface MobileNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

/** Phone keeps the thumb dock, relabelled for the new vocabulary. */
export function BottomNav({ active, onChange }: MobileNavProps) {
  const items: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
    { id: 'home', label: 'Today', icon: House },
    { id: 'move', label: 'Move', icon: Dumbbell },
    { id: 'focus', label: 'Focus', icon: Target },
    { id: 'fuel', label: 'Fuel', icon: Salad },
  ];

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-safe lg:hidden"
    >
      <div className="pointer-events-auto mx-4 mb-3 rounded-[1.6rem] border border-line bg-surface/90 shadow-[0_12px_40px_-12px_var(--shadow-color)] backdrop-blur-xl">
        <ul className="flex items-stretch">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <li key={item.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => onChange(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className="thumb-zone relative flex w-full flex-col items-center gap-1 rounded-[1.6rem] px-2 py-2.5 transition-opacity active:opacity-70"
                >
                  <Icon
                    size={21}
                    strokeWidth={isActive ? 2.2 : 1.7}
                    className={isActive ? 'text-nourish' : 'text-ink-3'}
                    aria-hidden
                  />
                  <span
                    className={`text-[0.625rem] font-medium leading-none ${
                      isActive ? 'text-nourish' : 'text-ink-3'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

interface HeaderActionsProps {
  onNewTask: () => void;
  onLogMeal: () => void;
  onPlanWorkout: () => void;
  onOpenSettings: () => void;
}

/**
 * The app-wide top bar right side: a green "+ Add" split-button with a small
 * menu of create actions. Every item does the thing it names — it opens the
 * composer sheet or builder directly instead of merely switching tabs.
 * Kept minimal — settings gear beside it.
 */
export function HeaderActions({ onNewTask, onLogMeal, onPlanWorkout, onOpenSettings }: HeaderActionsProps) {
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);

  const actions: Array<{ label: string; icon: LucideIcon; run: () => void }> = [
    { label: 'New task', icon: ListPlus, run: onNewTask },
    { label: 'Log meal', icon: UtensilsCrossed, run: onLogMeal },
    { label: 'Plan workout', icon: Dumbbell, run: onPlanWorkout },
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-nourish/50 bg-nourish/10 px-3 text-[0.8125rem] font-semibold text-nourish transition-colors hover:bg-nourish/20 active:opacity-85"
        >
          <Plus size={15} strokeWidth={2.4} />
          Add
        </button>
        {open && (
          <>
            {/* Click-away layer */}
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setOpen(false)}
            />
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-44 animate-rise overflow-hidden rounded-xl border border-line bg-surface-2 shadow-[0_16px_48px_-12px_var(--shadow-color)]"
              key={tick}
            >
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpen(false);
                      setTick((t) => t + 1);
                      action.run();
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[0.8125rem] text-ink-2 transition-colors first:pt-3 last:pb-3 hover:bg-surface-3 hover:text-ink"
                  >
                    <Icon size={15} className="text-ink-3" aria-hidden />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        aria-label="Settings"
        onClick={onOpenSettings}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface-2"
      >
        <Settings2 size={18} />
      </button>
    </div>
  );
}
