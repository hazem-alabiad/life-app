import {
  Activity,
  BicepsFlexed,
  Dumbbell,
  Flame,
  Footprints,
  HeartPulse,
  PersonStanding,
  Waves,
  Wind,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { BodyPart, Exercise } from '../types';

/**
 * Placeholder movement art.
 *
 * ExerciseDB serves animated GIFs; without a key the app draws its own tile so
 * every row still has a visual anchor. The slow orbit and breathing pulse keep
 * the tile alive without turning the list into a fairground.
 */
const BODY_ICON: Record<BodyPart, LucideIcon> = {
  Chest: HeartPulse,
  Back: PersonStanding,
  Shoulders: Waves,
  Arms: BicepsFlexed,
  Core: Activity,
  Legs: Footprints,
  Glutes: Flame,
  'Full body': Dumbbell,
  Neck: Wind,
};

export function ExerciseArt({
  exercise,
  size = 56,
  rounded = 'rounded-2xl',
  className = '',
  animated = true,
}: {
  exercise: Exercise;
  size?: number;
  rounded?: string;
  className?: string;
  animated?: boolean;
}) {
  const Icon = BODY_ICON[exercise.bodyPart] ?? Dumbbell;
  const isStretch = exercise.kind === 'stretch';

  return (
    <div
      className={`relative flex flex-shrink-0 items-center justify-center overflow-hidden border border-line bg-surface-2 ${rounded} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: isStretch
            ? 'radial-gradient(circle at 30% 20%, var(--focus-soft), transparent 70%)'
            : 'radial-gradient(circle at 30% 20%, var(--move-soft), transparent 70%)',
        }}
      />
      {animated && (
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full animate-orbit opacity-40"
          style={{ transformOrigin: '50% 50%' }}
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={isStretch ? 'var(--focus)' : 'var(--move)'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="30 220"
          />
        </svg>
      )}
      <Icon
        size={Math.round(size * 0.42)}
        strokeWidth={1.6}
        className={animated ? 'relative animate-breathe' : 'relative'}
        color={isStretch ? 'var(--focus)' : 'var(--move)'}
      />
    </div>
  );
}
