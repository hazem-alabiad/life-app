const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** `yyyy-mm-dd` in the user's own timezone. Never use toISOString for this. */
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function isSameDay(a: Date, b: Date): boolean {
  return dateKey(a) === dateKey(b);
}

export function todayKey(now = new Date()): string {
  return dateKey(now);
}

/** Monday-first start of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const dow = (d.getDay() + 6) % 7; // Monday -> 0
  return addDays(d, -dow);
}

/** The Mon–Sun strip for the week containing `date`. */
export function weekStrip(date: Date): Date[] {
  const monday = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function weekdayShort(date: Date): string {
  return WEEKDAYS[date.getDay()];
}

export function formatFullDate(date: Date): string {
  return `${fullWeekday(date)}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export function formatShortDate(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export function fullWeekday(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'long' });
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function relativeDayLabel(date: Date, now = new Date()): string {
  if (isSameDay(date, now)) return 'Today';
  if (isSameDay(date, addDays(now, -1))) return 'Yesterday';
  if (isSameDay(date, addDays(now, 1))) return 'Tomorrow';
  return formatFullDate(date);
}

export function dayGreeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 5) return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Stable 0-based index for the day, used to rotate curated daily content. */
export function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

export function clampTime(date: Date, hour: number, minute = 0): Date {
  const next = startOfDay(date);
  next.setHours(hour, minute, 0, 0);
  return next;
}
