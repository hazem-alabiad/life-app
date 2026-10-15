import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Sheet } from '../../components/Sheet';
import { Button } from '../../components/Button';
import { Segmented, Stepper, Toggle } from '../../components/Controls';
import { useStore } from '../../state/store';
import type { MealKind } from '../../types';

const KINDS: MealKind[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export function MealSheet({ onClose, mealId }: { onClose: () => void; mealId?: string }) {
  const { dispatch, state } = useStore();
  const editing = mealId != null ? state.meals.find((m) => m.id === mealId) ?? null : null;
  const [name, setName] = useState(editing?.name ?? '');
  const [kind, setKind] = useState<MealKind>(editing?.kind ?? 'lunch');
  const [calories, setCalories] = useState(editing?.calories ?? 400);
  const [proteinG, setProteinG] = useState(editing?.proteinG ?? 20);
  const [carbsG, setCarbsG] = useState(editing?.carbsG ?? 40);
  const [fatG, setFatG] = useState(editing?.fatG ?? 15);
  const [planned, setPlanned] = useState(editing?.planned ?? false);

  // The meal may have been removed while the sheet was open.
  if (mealId != null && !editing) {
    onClose();
    return null;
  }

  const valid = name.trim().length >= 2;

  const submit = () => {
    if (!valid) return;
    if (editing) {
      dispatch({
        type: 'meal/edit',
        id: editing.id,
        name: name.trim(),
        kind,
        calories,
        proteinG,
        carbsG,
        fatG,
        planned,
      });
    } else {
      dispatch({
        type: 'meal/add',
        name: name.trim(),
        kind,
        loggedAt: Date.now(),
        calories,
        proteinG,
        carbsG,
        fatG,
        planned,
      });
    }
    onClose();
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title={editing ? 'Edit meal' : 'Log a meal'}
      subtitle="Honest numbers beat precise ones"
      footer={
        <Button
          accent="nourish"
          block
          disabled={!valid}
          icon={editing ? <Check size={16} /> : <Plus size={16} />}
          onClick={submit}
        >
          {editing ? 'Save changes' : planned ? 'Plan meal' : 'Log meal'}
        </Button>
      }
    >
      <label className="block">
        <span className="mb-2 block text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
          What did you eat?
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          enterKeyHint="done"
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="e.g. Salmon quinoa bowl"
          className="h-12 w-full rounded-2xl border border-line bg-field px-4 text-[0.875rem] text-ink placeholder:text-ink-3 focus:border-nourish/50"
        />
      </label>

      <Segmented<MealKind>
        label="Meal"
        value={kind}
        onChange={setKind}
        accent="nourish"
        options={KINDS.map((id) => ({ id, label: id[0]!.toUpperCase() + id.slice(1) }))}
      />

      <Stepper
        label="Calories"
        value={calories}
        unit="kcal"
        min={0}
        max={5000}
        step={50}
        onChange={setCalories}
      />
      <div className="grid grid-cols-3 gap-2">
        <Stepper label="Protein" value={proteinG} unit="g" min={0} max={500} step={5} onChange={setProteinG} />
        <Stepper label="Carbs" value={carbsG} unit="g" min={0} max={500} step={5} onChange={setCarbsG} />
        <Stepper label="Fat" value={fatG} unit="g" min={0} max={500} step={5} onChange={setFatG} />
      </div>

      <Toggle
        label="Planned, not eaten yet"
        description="Stays faint in the log until you mark it eaten"
        checked={planned}
        onChange={setPlanned}
        accent="nourish"
      />
    </Sheet>
  );
}
