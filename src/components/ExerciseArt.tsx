import { useState } from 'react';
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
import { EXERCISE_FRAMES } from '../data/exerciseMedia';

/**
 * Movement art: an animated form-demo GIF where the catalogue has one, the
 * drawn tile otherwise. A failed image falls back to the tile too, so every
 * row keeps a visual anchor offline or when the CDN is unreachable. The slow
 * orbit and breathing pulse keep the fallback tile alive without turning the
 * list into a fairground.
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
  const frames = EXERCISE_FRAMES[exercise.id];
  // Remembers per-exercise failures so a broken URL sticks to the tile.
  const [failedId, setFailedId] = useState<string | null>(null);
  const showFrames = frames != null && failedId !== exercise.id;

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
      {showFrames ? (
        <span className="relative block h-full w-full">
          <img
            src={frames[0]}
            alt=""
            loading="lazy"
            draggable={false}
            onError={() => setFailedId(exercise.id)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {animated ? (
            <img
              src={frames[1]}
              alt=""
              loading="lazy"
              draggable={false}
              onError={() => setFailedId(exercise.id)}
              className="absolute inset-0 h-full w-full animate-frame-swap object-cover"
            />
          ) : null}
        </span>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
