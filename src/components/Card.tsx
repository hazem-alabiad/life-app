import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Cards are tappable surfaces often enough that this is worth a prop. */
  onClick?: () => void;
  as?: 'div' | 'button' | 'section' | 'article' | 'li';
  ariaLabel?: string;
  /** Slightly lighter surface, for sheets and elevated panels. */
  elevated?: boolean;
  /** A soft accent edge, used to mark a suggested item. */
  accentBorder?: boolean;
  /** Padding scale; list rows need a tighter box than content cards. */
  pad?: 'md' | 'sm' | 'none';
}

export function Card({
  children,
  className = '',
  onClick,
  as: Tag = 'div',
  ariaLabel,
  elevated = false,
  accentBorder = false,
  pad = 'md',
}: CardProps) {
  const padding = pad === 'md' ? 'p-5' : pad === 'sm' ? 'p-3' : 'p-0';
  const base = `rounded-[var(--radius-card)] border ${
    elevated ? 'bg-surface-2' : 'bg-surface'
  } ${accentBorder ? 'border-line-strong' : 'border-line'} ${padding} ${className}`;

  if (Tag === 'button' || onClick) {
    return (
      <Tag
        type={Tag === 'button' ? 'button' : undefined}
        aria-label={ariaLabel}
        onClick={onClick}
        className={`${base} block w-full text-left transition-opacity active:opacity-90`}
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag aria-label={ariaLabel} className={base}>
      {children}
    </Tag>
  );
}

/** Small uppercase label that opens a card or section. */
export function SectionLabel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-3 ${className}`}
    >
      {children}
    </span>
  );
}

export function CardHeader({
  label,
  action,
  className = '',
}: {
  label: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-3 flex items-center justify-between gap-3 ${className}`}>
      <SectionLabel>{label}</SectionLabel>
      {action}
    </div>
  );
}
