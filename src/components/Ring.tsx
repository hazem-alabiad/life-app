import type { ReactNode } from 'react';

interface RingProps {
  /** 0 to 1. */
  progress: number;
  size?: number;
  stroke?: number;
  color: string;
  trackColor?: string;
  /** Soft ambient glow behind an active ring. */
  glow?: boolean;
  children?: ReactNode;
  label?: string;
}

/**
 * A single, quiet ring. Deliberately one stroke with a rounded cap and a muted
 * track — no filled multi-ring stacks, no gradient sweeps.
 */
export function Ring({
  progress,
  size = 88,
  stroke = 7,
  color,
  trackColor = 'var(--track)',
  glow = false,
  children,
  label,
}: RingProps) {
  const radius = (100 - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = circumference * (1 - clamped);

  return (
    <div
      className="relative flex flex-shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="-rotate-90"
        width={size}
        height={size}
        role="img"
        aria-label={label}
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 400ms cubic-bezier(0.22, 1, 0.36, 1)',
            filter: glow ? `drop-shadow(0 0 10px ${color}55)` : undefined,
          }}
        />
      </svg>
      {children != null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      )}
    </div>
  );
}
