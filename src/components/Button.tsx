import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ACCENT } from './accent';
import type { AccentName } from '../types';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  children: ReactNode;
  accent?: AccentName;
  variant?: 'primary' | 'ghost' | 'soft' | 'danger';
  size?: 'md' | 'lg' | 'sm';
  block?: boolean;
  className?: string;
  icon?: ReactNode;
}

const SIZES = {
  sm: 'h-9 px-3.5 text-[0.8125rem] gap-1.5',
  md: 'h-11 px-5 text-[0.875rem] gap-2',
  lg: 'h-12 px-6 text-[0.9375rem] gap-2',
} as const;

export function Button({
  children,
  accent = 'focus',
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
  icon,
  ...rest
}: ButtonProps) {
  const a = ACCENT[accent];
  const tone =
    variant === 'primary'
      ? `${a.bg} ${a.ink} font-semibold`
      : variant === 'soft'
        ? `${a.soft} ${a.text} font-semibold`
        : variant === 'danger'
          ? 'bg-surface-3 text-ink font-medium'
          : 'bg-surface-3 text-ink font-medium border border-line-strong';

  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center justify-center rounded-full transition-opacity active:opacity-85 disabled:opacity-40 ${SIZES[size]} ${tone} ${block ? 'w-full' : ''} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

/** A square icon-only control that still clears the 44pt tap target. */
export function IconButton({
  children,
  label,
  onClick,
  className = '',
  accent = 'focus',
  active = false,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
  accent?: AccentName;
  active?: boolean;
}) {
  const a = ACCENT[accent];
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`thumb-zone inline-flex items-center justify-center rounded-full bg-surface-2 border border-line transition-colors active:opacity-80 ${
        active ? a.text : 'text-ink-2'
      } ${className}`}
    >
      {children}
    </button>
  );
}
