import { useState } from 'react';
import { CONTAINER } from '../../components/TopBar';
import { ChipTabs } from '../../components/Chip';
import { TimerView } from './TimerView';
import { FocusHistoryView } from './FocusHistoryView';
import type { FocusView, SheetKind } from '../../types';

export function FocusScreen({ onOpenSheet }: { onOpenSheet: (sheet: SheetKind) => void }) {
  const [view, setView] = useState<FocusView>('timer');

  return (
    <>
      {/* App.tsx already renders the page header; this screen only layers
          its own view switcher beneath it (same pattern as MoveScreen). */}
      <div className={`${CONTAINER} pb-40 pt-5 lg:pb-16`}>
        <ChipTabs<FocusView>
          items={[
            { id: 'timer', label: 'Timer' },
            { id: 'history', label: 'Session Log' },
          ]}
          value={view}
          onChange={setView}
          accent="focus"
        />

        <div className="mt-5">
          {view === 'timer' ? <TimerView onOpenSheet={onOpenSheet} /> : <FocusHistoryView />}
        </div>
      </div>
    </>
  );
}
