import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { ChipTabs } from '../../components/Chip';
import { CONTAINER, TopBar } from '../../components/TopBar';
import { IconButton } from '../../components/Button';
import { TimerView } from './TimerView';
import { FocusHistoryView } from './FocusHistoryView';
import type { FocusView, SheetKind } from '../../types';

const VIEWS: Array<{ id: FocusView; label: string }> = [
  { id: 'timer', label: 'Timer' },
  { id: 'history', label: 'History' },
];

export function FocusScreen({ onOpenSheet }: { onOpenSheet: (sheet: SheetKind) => void }) {
  const [view, setView] = useState<FocusView>('timer');

  return (
    <>
      <TopBar
        label="Focus"
        title="Pomodoro & stretch breaks"
        right={
          <IconButton
            label="Timer settings"
            onClick={() => onOpenSheet({ kind: 'focus-settings' })}
          >
            <Settings2 size={19} />
          </IconButton>
        }
      >
        <ChipTabs items={VIEWS} value={view} onChange={setView} accent="focus" />
      </TopBar>
      <div className={`${CONTAINER} pb-40 pt-4 lg:pb-16 lg:pt-8`}>
        {view === 'timer' ? <TimerView onOpenSheet={onOpenSheet} /> : <FocusHistoryView />}
      </div>
    </>
  );
}
