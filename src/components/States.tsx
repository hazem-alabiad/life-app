import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-line bg-surface px-6 py-10 text-center">
      {icon && <div className="mb-3 text-ink-3">{icon}</div>}
      <p className="text-[0.9375rem] font-medium text-ink">{title}</p>
      {body && <p className="mt-1.5 max-w-[26ch] text-[0.8125rem] leading-5 text-ink-3">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Skeleton block used while a meal photo is being analysed. */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-surface-3 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

/** The 3–5 second analysis state, kept short and quiet. */
export function AnalyzingCard({ step }: { step: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nourish opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-nourish" />
        </span>
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-nourish">
          Reading the plate
        </span>
      </div>
      <Skeleton className="mb-3 h-5 w-2/3" />
      <Skeleton className="mb-5 h-3 w-1/3" />
      <div className="flex gap-1.5">
        <Skeleton className="h-2 flex-1" />
        <Skeleton className="h-2 flex-1" />
        <Skeleton className="h-2 flex-1" />
      </div>
      <p className="mt-5 text-[0.75rem] text-ink-3">{step}</p>
    </div>
  );
}
