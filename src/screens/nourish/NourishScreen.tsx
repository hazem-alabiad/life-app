import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { ChipTabs } from '../../components/Chip';
import { CONTAINER, TopBar } from '../../components/TopBar';
import { IconButton } from '../../components/Button';
import { LogView } from './LogView';
import { InsightsView } from './InsightsView';
import type { NourishView, SheetKind } from '../../types';

const VIEWS: Array<{ id: NourishView; label: string }> = [
  { id: 'log', label: 'Log' },
  { id: 'insights', label: 'Insights' },
];

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
      <TopBar
        label="Nourish"
        title="Food & health"
        right={
          <IconButton label="Nutrition settings" onClick={() => onOpenSheet({ kind: 'settings' })}>
            <Settings2 size={19} />
          </IconButton>
        }
      >
        <ChipTabs items={VIEWS} value={view} onChange={setView} accent="nourish" />
      </TopBar>
      <div className={`${CONTAINER} pb-40 pt-4 lg:pb-16 lg:pt-8`}>
        {view === 'log' ? <LogView onOpenMeal={onOpenMeal} /> : <InsightsView onOpenSheet={onOpenSheet} />}
      </div>
    </>
  );
}
