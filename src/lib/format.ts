/** `24:38`, or `1:04:12` past an hour. Used by the countdown ring. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** `1h 20m`, `48m` — the home chip and history summaries. */
export function formatFocusLength(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  return formatMinutes(minutes);
}

export function formatMinutes(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? `${h}h` : `${h}h ${rest}m`;
}

export function formatKcal(n: number): string {
  return `${Math.round(n).toLocaleString()} kcal`;
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString();
}

export function pct(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, value / total));
}

export function grams(n: number): string {
  return `${Math.round(n)} g`;
}

/** Trims a float to a friendly amount of decimal places. */
export function round(value: number, places = 1): number {
  const f = 10 ** places;
  return Math.round(value * f) / f;
}
