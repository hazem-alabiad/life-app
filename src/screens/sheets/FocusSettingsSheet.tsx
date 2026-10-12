import { Sheet } from '../../components/Sheet';
import { Segmented, SheetSection, Stepper, Toggle } from '../../components/Controls';
import { useStore } from '../../state/store';
import type { StretchGoal } from '../../types';
import { STRETCH_GOAL_LABELS } from '../../data/workouts';

export function FocusSettingsSheet({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const { settings } = state;
  const patch = (next: Partial<typeof settings>) =>
    dispatch({ type: 'settings/patch', patch: next });

  return (
    <Sheet open onClose={onClose} title="Timer settings" subtitle="Defaults are a reasonable place to start">
      <SheetSection title="Lengths">
        <Stepper
          label="Pomodoro"
          value={settings.pomodoroMin}
          unit="min"
          min={5}
          max={90}
          step={5}
          onChange={(pomodoroMin) => patch({ pomodoroMin })}
        />
        <Stepper
          label="Short break"
          value={settings.shortBreakMin}
          unit="min"
          min={2}
          max={20}
          onChange={(shortBreakMin) => patch({ shortBreakMin })}
        />
        <Stepper
          label="Long break"
          value={settings.longBreakMin}
          unit="min"
          min={5}
          max={45}
          step={5}
          onChange={(longBreakMin) => patch({ longBreakMin })}
        />
        <Stepper
          label="Sessions before a long break"
          value={settings.sessionsBeforeLong}
          min={2}
          max={8}
          onChange={(sessionsBeforeLong) => patch({ sessionsBeforeLong })}
        />
      </SheetSection>

      <SheetSection title="Breaks">
        <Toggle
          label="Stretch on break"
          description="Offer one short stretch instead of a scroll"
          checked={settings.stretchOnBreak}
          onChange={(stretchOnBreak) => patch({ stretchOnBreak })}
        />
        <Toggle
          label="Eye-rest reminder"
          description="Look 6 m away for 20 seconds"
          checked={settings.eyeRest}
          onChange={(eyeRest) => patch({ eyeRest })}
        />
        <Segmented<StretchGoal>
          label="Stretch focus"
          value={settings.stretchGoal}
          onChange={(stretchGoal) => patch({ stretchGoal })}
          options={(['flexibility', 'back', 'shoulder', 'mobility'] as StretchGoal[]).map((id) => ({
            id,
            label: STRETCH_GOAL_LABELS[id].label.split(' ')[0]!,
          }))}
        />
      </SheetSection>

      <p className="pt-3 text-[0.75rem] leading-5 text-ink-3">
        Breaks start on their own when a pomodoro ends; the next focus block waits for you. Change
        the lengths mid-session and they apply from the next phase.
      </p>
    </Sheet>
  );
}
