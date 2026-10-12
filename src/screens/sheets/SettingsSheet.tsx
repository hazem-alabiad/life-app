import { Moon, Monitor, RefreshCw, Sun } from 'lucide-react';
import { Sheet } from '../../components/Sheet';
import { Button } from '../../components/Button';
import { Segmented, SheetSection, Stepper } from '../../components/Controls';
import { FilterChip } from '../../components/Chip';
import { useStore } from '../../state/store';
import type { StretchGoal } from '../../types';
import { STRETCH_GOAL_LABELS } from '../../data/workouts';

export function SettingsSheet({
  onClose,
  onOpenFocusSettings,
}: {
  onClose: () => void;
  onOpenFocusSettings: () => void;
}) {
  const { state, dispatch } = useStore();
  const { settings } = state;
  const patch = (next: Partial<typeof settings>) => dispatch({ type: 'settings/patch', patch: next });

  return (
    <Sheet open onClose={onClose} title="Settings" subtitle="Small set of dials, nothing hidden">
      <SheetSection title="Appearance">
        <Segmented
          label="Theme"
          value={settings.theme}
          onChange={(theme) => patch({ theme })}
          options={[
            { id: 'dark', label: 'Dark', icon: <Moon size={13} /> },
            { id: 'light', label: 'Light', icon: <Sun size={13} /> },
            { id: 'system', label: 'System', icon: <Monitor size={13} /> },
          ]}
        />
        <p className="pb-3 text-[0.75rem] leading-5 text-ink-3">
          Dark is the default because it suits evening use. Light is fully designed, not an
          afterthought.
        </p>
      </SheetSection>

      <SheetSection title="Goals">
        <Stepper
          label="Workouts per week"
          description="Drives the ring on the home screen"
          value={settings.weeklyWorkoutGoal}
          min={1}
          max={14}
          onChange={(weeklyWorkoutGoal) => patch({ weeklyWorkoutGoal })}
        />
        <Stepper
          label="Daily calories"
          description="A reference line, not a target to hit"
          value={settings.dailyCalorieGoal}
          unit="kcal"
          min={1200}
          max={4000}
          step={50}
          onChange={(dailyCalorieGoal) => patch({ dailyCalorieGoal })}
        />
      </SheetSection>

      <SheetSection title="Stretching">
        <div className="py-3">
          <p className="mb-2.5 text-[0.875rem] text-ink">Main goal</p>
          <div className="flex flex-wrap gap-2">
            {(['flexibility', 'back', 'shoulder', 'mobility'] as StretchGoal[]).map((goal) => (
              <FilterChip
                key={goal}
                accent="focus"
                selected={settings.stretchGoal === goal}
                onClick={() => patch({ stretchGoal: goal })}
              >
                {STRETCH_GOAL_LABELS[goal].label}
              </FilterChip>
            ))}
          </div>
          <p className="mt-2.5 text-[0.75rem] leading-5 text-ink-3">
            Chooses which stretches appear in guided flows and break prompts.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenFocusSettings}
          className="flex w-full items-center justify-between py-3.5 text-left"
        >
          <span className="text-[0.875rem] text-ink">Timer lengths and breaks</span>
          <span className="text-[0.75rem] text-ink-3">Open</span>
        </button>
      </SheetSection>

      <SheetSection title="Data">
        <div className="py-3">
          <p className="text-[0.75rem] leading-5 text-ink-3">
            Everything lives in this browser only — no account, no server, nothing leaves the
            device. Clearing site data clears the app.
          </p>
          {state.demoSeeded ? (
            <Button
              accent="focus"
              variant="ghost"
              size="sm"
              className="mt-3"
              icon={<RefreshCw size={14} />}
              onClick={() => dispatch({ type: 'demo/clear' })}
            >
              Clear the sample week
            </Button>
          ) : (
            <p className="mt-3 text-[0.75rem] text-ink-3">Sample data has been cleared.</p>
          )}
        </div>
      </SheetSection>
    </Sheet>
  );
}
