import { Dumbbell, House, Timer } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TabId } from '../types';

interface NavItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
  /** Active colour and glow are driven by the module's own accent. */
  activeClass: string;
  glow: string;
}

const ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: House,
    activeClass: 'text-ink',
    glow: 'bg-ink',
  },
  {
    id: 'move',
    label: 'Move',
    icon: Dumbbell,
    activeClass: 'text-move',
    glow: 'bg-move',
  },
  {
    id: 'focus',
    label: 'Focus',
    icon: Timer,
    activeClass: 'text-focus',
    glow: 'bg-focus',
  },
];

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
  /** Labels show for the first week, then fade to icon-only. */
  showLabels: boolean;
}

export function BottomNav({ active, onChange, showLabels }: BottomNavProps) {
  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-safe lg:hidden"
    >
      <div className="mx-4 mb-3 rounded-[1.6rem] border border-line bg-surface/90 shadow-[0_12px_40px_-12px_var(--shadow-color)] backdrop-blur-xl pointer-events-auto">
        <ul className="flex items-stretch">
          {ITEMS.map((item) => {
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
                  <span className="relative flex h-6 items-center justify-center">
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.2 : 1.75}
                      className={isActive ? item.activeClass : 'text-ink-3'}
                      aria-hidden
                    />
                    {isActive && (
                      <span
                        className={`absolute -bottom-1.5 h-1 w-1 rounded-full ${item.glow}`}
                        aria-hidden
                      />
                    )}
                  </span>
                  <span
                    className={`text-[0.6875rem] font-medium leading-none tracking-[0.03em] transition-all duration-300 ${
                      isActive ? item.activeClass : 'text-ink-3'
                    } ${
                      showLabels
                        ? 'max-h-4 opacity-100'
                        : 'max-h-0 overflow-hidden opacity-0'
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
