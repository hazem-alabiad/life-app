import type { AccentName } from '../types';

/**
 * One accent per module. Every class is written out in full so Tailwind's
 * scanner can see it — dynamic class construction would silently drop styles.
 */
export const ACCENT: Record<
  AccentName,
  {
    text: string;
    bg: string;
    soft: string;
    border: string;
    ink: string;
    glow: string;
    hex: string;
  }
> = {
  move: {
    text: 'text-move',
    bg: 'bg-move',
    soft: 'bg-move-soft',
    border: 'border-move/40',
    ink: 'text-move-ink',
    glow: 'shadow-[0_0_40px_-10px_rgba(249,115,22,0.45)]',
    hex: '#F97316',
  },
  focus: {
    text: 'text-focus',
    bg: 'bg-focus',
    soft: 'bg-focus-soft',
    border: 'border-focus/40',
    ink: 'text-focus-ink',
    glow: 'shadow-[0_0_40px_-10px_rgba(34,211,238,0.45)]',
    hex: '#22D3EE',
  },
};
