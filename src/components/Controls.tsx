import type { ReactNode } from 'react';
import { Minus, Plus } from 'lucide-react';

/** Pill toggle. The track fills with the relevant accent when engaged. */
export function Toggle({
  label,
  description,
  checked,
  onChange,
  accent = 'focus',
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  accent?: 'move' | 'focus' | 'nourish';
}) {
  const on = accent === 'move' ? 'bg-move' : accent === 'nourish' ? 'bg-nourish' : 'bg-focus';
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-[0.875rem] text-ink">{label}</p>
        {description && <p className="mt-0.5 text-[0.75rem] leading-5 text-ink-3">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors ${
          checked ? on : 'bg-surface-4'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
          style={{ left: 0 }}
        />
      </button>
    </div>
  );
}

/** Numeric stepper used for timer lengths, goals, and portions. */
export function Stepper({
  label,
  description,
  value,
  unit,
  min = 1,
  max = 120,
  step = 1,
  onChange,
}: {
  label: string;
  description?: string;
  value: number;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (next: number) => void;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-[0.875rem] text-ink">{label}</p>
        {description && <p className="mt-0.5 text-[0.75rem] leading-5 text-ink-3">{description}</p>}
      </div>
      <div className="flex flex-shrink-0 items-center gap-1 rounded-full border border-line bg-field p-1">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(clamp(value - step))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-2 active:opacity-70"
        >
          <Minus size={15} />
        </button>
        <span className="tnum w-14 text-center text-[0.8125rem] font-medium text-ink">
          {value}
          {unit ? <span className="ml-0.5 text-[0.6875rem] text-ink-3">{unit}</span> : null}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(clamp(value + step))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-2 active:opacity-70"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

/** Small segmented picker for two or three options. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  accent = 'focus',
}: {
  label: string;
  value: T;
  options: Array<{ id: T; label: string; icon?: ReactNode }>;
  onChange: (next: T) => void;
  accent?: 'move' | 'focus' | 'nourish';
}) {
  const active =
    accent === 'move' ? 'bg-move text-move-ink' : accent === 'nourish' ? 'bg-nourish text-nourish-ink' : 'bg-focus text-focus-ink';
  return (
    <div className="py-3">
      <p className="mb-2 text-[0.875rem] text-ink">{label}</p>
      <div className="flex gap-1.5 rounded-full border border-line bg-field p-1">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[0.75rem] font-medium transition-colors ${
              value === option.id ? active : 'text-ink-2'
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SheetSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-line py-2 last:border-b-0">
      <p className="mb-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
        {title}
      </p>
      <div className="divide-y divide-line">{children}</div>
    </section>
  );
}
