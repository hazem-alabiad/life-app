import type { ReactNode } from 'react';
import { ACCENT } from './accent';
import type { AccentName } from '../types';

/**
 * Module shortcut on the home dashboard.
 *
 * A compact pill on a phone, where horizontal space is the scarce thing; a
 * proper stat card from tablet up, where three pills in a row would leave most
 * of the width empty.
 */
export function StatPill({
  accent,
  label,
  value,
  hint,
  onClick,
}: {
  accent: AccentName;
  label: string;
  value: string;
  hint?: string;
  onClick?: () => void;
}) {
  const a = ACCENT[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 transition-colors active:opacity-80 md:flex-1 md:flex-col md:items-start md:gap-0 md:rounded-[var(--radius-card)] md:px-5 md:py-4 md:hover:bg-surface-2"
    >
      <span className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${a.bg}`} aria-hidden />
        <span className="text-[0.75rem] font-medium text-ink-2 md:text-[0.625rem] md:font-semibold md:uppercase md:tracking-[0.14em] md:text-ink-3">
          {label}
        </span>
      </span>
      <span className={`tnum text-[0.75rem] font-semibold ${a.text} md:mt-2 md:text-[1.5rem] md:font-semibold md:leading-none md:text-ink`}>
        {value}
      </span>
      {hint && <span className="mt-1.5 hidden text-[0.75rem] text-ink-3 md:block">{hint}</span>}
    </button>
  );
}

/** Small non-interactive tag, e.g. muscle groups on a workout card. */
export function Tag({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`rounded-full bg-surface-3 px-2.5 py-1 text-[0.6875rem] font-medium text-ink-2 ${className}`}
    >
      {children}
    </span>
  );
}

interface FilterChipProps {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
  accent?: AccentName;
}

export function FilterChip({ children, selected, onClick, accent = 'move' }: FilterChipProps) {
  const a = ACCENT[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-[44px] flex-shrink-0 items-center rounded-full border px-3.5 py-2 text-[0.75rem] font-medium transition-colors active:opacity-80 ${
        selected
          ? `${a.soft} ${a.text} ${a.border}`
          : 'border-line bg-surface text-ink-2'
      }`}
    >
      {children}
    </button>
  );
}

/** Top-of-module view switcher (Schedule · Exercises · History). */
export function ChipTabs<T extends string>({
  items,
  value,
  onChange,
  accent = 'move',
  className = '',
}: {
  items: Array<{ id: T; label: string }>;
  value: T;
  onChange: (id: T) => void;
  accent?: AccentName;
  className?: string;
}) {
  const a = ACCENT[accent];
  return (
    <div
      role="tablist"
      className={`no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 md:mx-0 md:px-0 ${className}`}
    >
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChange(item.id)}
            className={`flex min-h-[44px] flex-shrink-0 items-center rounded-full border px-4 py-2 text-[0.8125rem] font-medium transition-colors ${
              selected ? `${a.soft} ${a.text} ${a.border}` : 'border-transparent text-ink-3'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
