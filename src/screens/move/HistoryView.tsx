import { Dumbbell, Wind } from 'lucide-react';
import { Card, SectionLabel } from '../../components/Card';
import { Tag } from '../../components/Chip';
import { EmptyState } from '../../components/States';
import { useStore } from '../../state/store';
import { formatMinutes } from '../../lib/format';
import { addDays, parseDateKey, relativeDayLabel, startOfWeek } from '../../lib/date';
import { weekWorkoutStats } from '../../lib/selectors';
import { dateKey } from '../../lib/date';

export function HistoryView() {
  const { state, now } = useStore();
  const today = new Date(now);
  const stats = weekWorkoutStats(state, today);

  const groups = (() => {
    const map = new Map<string, typeof state.sessions>();
    for (const session of state.sessions) {
      const key = dateKey(new Date(session.completedAt));
      const list = map.get(key) ?? [];
      list.push(session);
      map.set(key, list);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  })();

  // The strip is only meaningful once there is something on it.
  const monday = startOfWeek(today);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-12 lg:items-start lg:gap-6 lg:space-y-0">
      <Card className="lg:col-span-4">
        <SectionLabel className="mb-2 block">This week</SectionLabel>
        <div className="flex items-baseline gap-2">
          <span className="tnum text-[1.625rem] font-semibold leading-none text-ink">{stats.done}</span>
          <span className="text-[0.8125rem] text-ink-2">sessions</span>
          <span className="text-ink-3">·</span>
          <span className="tnum text-[0.9375rem] font-medium text-ink">
            {formatMinutes(stats.minutes)}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-1.5 lg:mt-5">
          {days.map((day) => {
            const has = state.sessions.some(
              (s) => dateKey(new Date(s.completedAt)) === dateKey(day),
            );
            return (
              <span
                key={dateKey(day)}
                title={relativeDayLabel(day, today)}
                className={`h-1.5 flex-1 rounded-full ${has ? 'bg-move' : 'bg-track'}`}
              />
            );
          })}
        </div>
      </Card>

      <div className="lg:col-span-8">
      {groups.length === 0 ? (
        <EmptyState
          title="No sessions yet"
          body="Finish a workout or a stretch flow and it will appear here."
        />
      ) : (
        <div className="space-y-5">
          {groups.map(([day, sessions]) => (
            <section key={day}>
              <SectionLabel className="mb-2 block">
                {relativeDayLabel(parseDateKey(day), today)}
              </SectionLabel>
              <ul className="space-y-2">
                {sessions.map((session) => (
                  <li key={session.id}>
                    <Card pad="sm">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                            session.kind === 'stretch' ? 'bg-focus-soft' : 'bg-move-soft'
                          }`}
                        >
                          {session.kind === 'stretch' ? (
                            <Wind size={17} className="text-focus" />
                          ) : (
                            <Dumbbell size={17} className="text-move" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[0.875rem] font-medium text-ink">{session.name}</p>
                          <p className="mt-0.5 text-[0.75rem] text-ink-3">
                            {session.exerciseCount}{' '}
                            {session.exerciseCount === 1 ? 'movement' : 'movements'} ·{' '}
                            {formatMinutes(session.durationMin)}
                          </p>
                        </div>
                      </div>
                      {session.muscles.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {session.muscles.map((m) => (
                            <Tag key={m}>{m}</Tag>
                          ))}
                        </div>
                      )}
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
