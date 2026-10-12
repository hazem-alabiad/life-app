import { useState } from 'react';
import { AppHeader } from '../../components/AppHeader';
import { CONTAINER } from '../../components/TopBar';
import { TimerView } from './TimerView';
import { FocusHistoryView } from './FocusHistoryView';
import type { FocusView, SheetKind, TabId } from '../../types';

export function FocusScreen({ onOpenSheet }: { onOpenSheet: (sheet: SheetKind) => void }) {
  const [view, setView] = useState<FocusView>('timer');

  return (
    <>
      <AppHeader
        title="Focus"
        onNavigate={(_tab: TabId) => {
          /* navigation lives in the sidebar */
        }}
        onOpenSettings={() => onOpenSheet({ kind: 'focus-settings' })}
      />
      <div className={`${CONTAINER} pb-40 pt-5 lg:pb-16`}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={view === 'timer'}
            onClick={() => setView('timer')}
            className={`rounded-full px-4 py-2 text-[0.8125rem] font-medium transition-colors ${
              view === 'timer'
                ? 'bg-focus-soft text-focus ring-1 ring-focus/40'
                : 'border border-line bg-surface text-ink-2 hover:bg-surface-2'
            }`}
          >
            Sprint
          </button>
          <button
            type="button"
            aria-pressed={view === 'history'}
            onClick={() => setView('history')}
            className={`rounded-full px-4 py-2 text-[0.8125rem] font-medium transition-colors ${
              view === 'history'
                ? 'bg-focus-soft text-focus ring-1 ring-focus/40'
                : 'border border-line bg-surface text-ink-2 hover:bg-surface-2'
            }`}
          >
            Session Log
          </button>
        </div>

        <div className="mt-5">
          {view === 'timer' ? <TimerView onOpenSheet={onOpenSheet} /> : <FocusHistoryView />}
        </div>
      </div>
    </>
  );
}
