import { Sparkles, Trash2 } from 'lucide-react';
import { Sheet } from '../../components/Sheet';
import { Button } from '../../components/Button';
import { MacroBar } from '../../components/Bar';
import { SectionLabel } from '../../components/Card';
import { useStore } from '../../state/store';
import type { MealEntry } from '../../types';
import { formatKcal } from '../../lib/format';
import { relativeDayLabel } from '../../lib/date';

export function MealSheet({ meal, onClose }: { meal: MealEntry; onClose: () => void }) {
  const { dispatch } = useStore();
  const at = new Date(meal.createdAt);

  return (
    <Sheet
      open
      onClose={onClose}
      title={meal.name}
      subtitle={`${relativeDayLabel(at)} · ${at.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      })}`}
      footer={
        <Button
          accent="nourish"
          variant="ghost"
          block
          icon={<Trash2 size={15} />}
          onClick={() => {
            dispatch({ type: 'meal/remove', id: meal.id });
            onClose();
          }}
        >
          Delete entry
        </Button>
      }
    >
      {meal.photo ? (
        <img
          src={meal.photo}
          alt={`Photo of ${meal.name}`}
          className="h-48 w-full rounded-2xl object-cover"
        />
      ) : (
        <div className="flex h-32 w-full items-center justify-center rounded-2xl bg-surface-3">
          <Sparkles size={22} className="text-ink-3" />
        </div>
      )}

      <div className="mt-5 flex items-baseline justify-between">
        <p className="tnum text-[1.375rem] font-semibold text-ink">{formatKcal(meal.kcal)}</p>
        <p className="text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3">
          {meal.source === 'photo' ? 'from a photo' : 'added by hand'}
        </p>
      </div>

      <MacroBar
        protein={meal.macros.protein}
        carbs={meal.macros.carbs}
        fat={meal.macros.fat}
        labels
        className="mt-4"
      />

      <div className="mt-3 grid grid-cols-4 gap-2">
        {[
          { label: 'Protein', value: meal.macros.protein },
          { label: 'Carbs', value: meal.macros.carbs },
          { label: 'Fat', value: meal.macros.fat },
          { label: 'Sugar', value: meal.macros.sugar },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-surface px-2 py-2.5 text-center">
            <p className="tnum text-[0.875rem] font-semibold text-ink">{Math.round(item.value)}</p>
            <p className="mt-0.5 text-[0.625rem] text-ink-3">{item.label}</p>
          </div>
        ))}
      </div>

      {meal.tips.length > 0 && (
        <div className="mt-6">
          <SectionLabel className="mb-3 block">Worth knowing</SectionLabel>
          <ul className="space-y-2.5">
            {meal.tips.map((tip) => (
              <li key={tip} className="flex gap-2.5 text-[0.75rem] leading-5 text-ink-2">
                <Sparkles size={13} className="mt-0.5 flex-shrink-0 text-nourish" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {meal.source === 'photo' && (
        <p className="mt-5 text-[0.6875rem] leading-5 text-ink-3">
          Estimated on-device from the photo, so the name and the numbers are approximations.
        </p>
      )}
    </Sheet>
  );
}
