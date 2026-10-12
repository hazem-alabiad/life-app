interface BarProps {
  /** 0 to 1. */
  value: number;
  color?: string;
  className?: string;
  height?: number;
  label?: string;
}

export function Bar({ value, color = 'var(--focus)', className = '', height = 6, label }: BarProps) {
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-track ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${clamped * 100}%`, background: color }}
      />
    </div>
  );
}

/**
 * Three coloured segments for protein / carbs / fat.
 *
 * These three colours are the one place module accents share a surface: on the
 * home card a monochrome bar would hide the whole point of the split.
 */
export function MacroBar({
  protein,
  carbs,
  fat,
  labels = false,
  className = '',
}: {
  protein: number;
  carbs: number;
  fat: number;
  labels?: boolean;
  className?: string;
}) {
  const total = Math.max(1, protein + carbs + fat);
  const segments = [
    { value: protein, color: '#FA6D53', label: 'Protein' },
    { value: carbs, color: '#2DD4BF', label: 'Carbs' },
    { value: fat, color: '#4ADE80', label: 'Fat' },
  ];

  return (
    <div className={className}>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-track">
        {segments.map((s) => (
          <div
            key={s.label}
            className="h-full transition-[width] duration-500"
            style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
            title={`${s.label}: ${Math.round(s.value)} g`}
          />
        ))}
      </div>
      {labels && (
        <div className="mt-2 flex items-center justify-between text-[0.6875rem] text-ink-3">
          {segments.map((s) => (
            <span key={s.label} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} aria-hidden />
              <span className="text-ink-2">{s.label}</span>
              <span className="tnum font-medium">
                {Math.round(s.value).toLocaleString()}g
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
