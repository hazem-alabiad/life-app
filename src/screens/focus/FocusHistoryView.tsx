import { Card, SectionLabel } from '../../components/Card';
import { EmptyState } from '../../components/States';
import { useStore } from '../../state/store';
import { formatMinutes } from '../../lib/format';
import { parseDateKey, relativeDayLabel } from '../../lib/date';
import { focusRecordsByDay, focusWeekSummary } from '../../lib/selectors';

export function FocusHistoryView() {
  const { state, now } = useStore();
  const today = new Date(now);
  const summary = focusWeekSummary(state, today);
  const groups = focusRecordsByDay(state);

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-12 lg:items-start lg:gap-6 lg:space-y-0">
      <Card className="lg:col-span-4">
        <SectionLabel className="mb-2 block">This week</SectionLabel>
        <p className="tnum text-[0.9375rem] font-medium text-ink">
          {summary.pomodoros} pomodoro{summary.pomodoros === 1 ? '' : 's'} ·{' '}
          {formatMinutes(summary.minutes)} focus
        </p>
        <p className="mt-1.5 text-[0.75rem] text-ink-3">
          {summary.pomodoros === 0
            ? 'Nothing banked yet this week.'
            : `Averaging ${formatMinutes(Math.round(summary.minutes / 7))} a day.`}
        </p>
      </Card>

      <div className="space-y-5 lg:col-span-8">
      {groups.length === 0 ? (
        <EmptyState
          title="No sessions yet"
          body="Completed pomodoros land here — abandoned ones do not, and that is deliberate."
        />
      ) : (
        <div className="space-y-5">
          {groups.map(({ day, records }) => {
            const totalMinutes = records.reduce((sum, r) => sum + r.focusMinutes, 0);
            const taskNames = [...new Set(records.map((r) => r.taskName ?? 'Unassigned'))];
            return (
              <section key={day}>
                <div className="mb-2 flex items-baseline justify-between">
                  <SectionLabel>{relativeDayLabel(parseDateKey(day), today)}</SectionLabel>
                  <span className="tnum text-[0.6875rem] text-ink-3">
                    {records.length} · {formatMinutes(totalMinutes)}
                  </span>
                </div>
                <Card pad="sm">
                  <ul className="space-y-2.5">
                    {records.map((record) => (
                      <li key={record.id} className="flex items-center gap-3">
                        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-focus" />
                        <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-ink">
                          {record.taskName ?? 'Unassigned focus'}
                        </span>
                        <span className="tnum flex-shrink-0 text-[0.6875rem] text-ink-3">
                          {new Date(record.endedAt).toLocaleTimeString(undefined, {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {taskNames.length > 1 && (
                    <p className="mt-3 text-[0.6875rem] leading-5 text-ink-3">
                      Worked across {taskNames.length} tasks.
                    </p>
                  )}
                </Card>
              </section>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
