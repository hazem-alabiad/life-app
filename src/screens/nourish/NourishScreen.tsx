import { useState } from 'react';
import { AppHeader } from '../../components/AppHeader';
import { CONTAINER } from '../../components/TopBar';
import { LogView } from './LogView';
import { InsightsView } from './InsightsView';
import type { NourishView, SheetKind, TabId } from '../../types';

export function NourishScreen({
  onOpenSheet,
  onOpenMeal,
}: {
  onOpenSheet: (sheet: SheetKind) => void;
  onOpenMeal: (mealId: string) => void;
}) {
  const [view, setView] = useState<NourishView>('log');

  return (
    <>
      <AppHeader
        title="Fuel"
        onNavigate={(_tab: TabId) => {
          /* navigation lives in the sidebar */
        }}
        onOpenSettings={() => onOpenSheet({ kind: 'settings' })}
      />
      <div className={`${CONTAINER} pb-40 pt-5 lg:pb-16`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={view === 'log'}
              onClick={() => setView('log')}
              className={`rounded-full px-4 py-2 text-[0.8125rem] font-medium transition-colors ${
                view === 'log'
                  ? 'bg-nourish-soft text-nourish ring-1 ring-nourish/40'
                  : 'border border-line bg-surface text-ink-2 hover:bg-surface-2'
              }`}
            >
              Meal History &amp; Macros
            </button>
            <button
              type="button"
              aria-pressed={view === 'insights'}
              onClick={() => setView('insights')}
              className={`rounded-full px-4 py-2 text-[0.8125rem] font-medium transition-colors ${
                view === 'insights'
                  ? 'bg-nourish-soft text-nourish ring-1 ring-nourish/40'
                  : 'border border-line bg-surface text-ink-2 hover:bg-surface-2'
              }`}
            >
              Circadian Nutrition Insights
            </button>
          </div>
        </div>

        <div className="mt-5">
          {view === 'log' ? <LogView onOpenMeal={onOpenMeal} /> : <InsightsView onOpenSheet={onOpenSheet} />}
        </div>
      </div>
    </>
  );
}
