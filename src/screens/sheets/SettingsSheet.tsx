import { Cloud, CloudOff, Download, Github, LogOut, RefreshCw, Moon, Monitor, Sun } from 'lucide-react';
import { Sheet } from '../../components/Sheet';
import { Button } from '../../components/Button';
import { Segmented, SheetSection, Stepper } from '../../components/Controls';
import { FilterChip } from '../../components/Chip';
import { useStore } from '../../state/store';
import { useCloud } from '../../lib/cloud';
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

  // Portable local backup: the whole store as a dated JSON download.
  const exportArchive = () => {
    try {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `life-app-archive-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 5_000);
    } catch {
      // A failed download leaves the app untouched; nothing to roll back.
    }
  };

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
        <Stepper
          label="Daily water"
          description="Drives the hydration row in Fuel"
          value={settings.hydrationGoalMl}
          unit="ml"
          min={1000}
          max={5000}
          step={250}
          onChange={(hydrationGoalMl) => patch({ hydrationGoalMl })}
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

      <CloudSection />

      <SheetSection title="Data">
        <div className="py-3">
          <p className="text-[0.75rem] leading-5 text-ink-3">
            Everything lives in this browser, plus your cloud copy when signed in. Clearing
            site data clears the local app.
          </p>
          <Button
            accent="focus"
            variant="ghost"
            size="sm"
            className="mt-3"
            icon={<Download size={14} />}
            onClick={exportArchive}
          >
            Export data archive
          </Button>
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

/**
 * Cloud sync section. Rendered only when the deployment is configured with
 * Supabase env vars; GitHub is the sole identity provider. The local copy
 * stays authoritative — the cloud mirror is what survives clearing site data
 * or opening on another device.
 */
function CloudSection() {
  const cloud = useCloud();
  if (!cloud.available) return null;

  return (
    <SheetSection title="Cloud sync">
      <div className="py-3">
        {cloud.user ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <Cloud size={16} className="text-focus" />
              <div className="min-w-0">
                <p className="truncate text-[0.875rem] text-ink">@{cloud.user.name}</p>
                <p className="text-[0.75rem] text-ink-3">
                  {cloud.status === 'error'
                    ? 'Sync problem — will retry on next change'
                    : cloud.status === 'syncing'
                      ? 'Syncing…'
                      : 'Data synced to your account'}
                </p>
              </div>
            </div>
            <Button
              accent="focus"
              variant="ghost"
              size="sm"
              icon={<LogOut size={14} />}
              onClick={() => void cloud.signOut()}
            >
              Sign out
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <CloudOff size={16} className="text-ink-3" />
              <p className="text-[0.875rem] text-ink">Sign in to back up and sync</p>
            </div>
            <Button accent="focus" size="sm" icon={<Github size={14} />} onClick={cloud.signIn}>
              Continue with GitHub
            </Button>
            {cloud.status === 'error' && cloud.errorMessage && (
              <p className="text-[0.75rem] leading-5 text-red-400" role="alert">
                Sign-in failed: {cloud.errorMessage}
              </p>
            )}
            <p className="text-[0.75rem] leading-5 text-ink-3">
              GitHub is the only sign-in. Your data stays in this browser until you sign in; the
              cloud copy is then updated after each change.
            </p>
          </div>
        )}
      </div>
    </SheetSection>
  );
}
