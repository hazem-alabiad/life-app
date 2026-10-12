import { Clock, Utensils } from 'lucide-react';
import { Sheet } from '../../components/Sheet';
import { SectionLabel } from '../../components/Card';
import { Tag } from '../../components/Chip';
import { formatKcal } from '../../lib/format';
import type { RecipeCard } from '../../data/insights';

export function RecipeSheet({ recipe, onClose }: { recipe: RecipeCard; onClose: () => void }) {
  return (
    <Sheet open onClose={onClose} title={recipe.name} subtitle={recipe.summary}>
      <div className="flex flex-wrap items-center gap-2">
        <Tag>{recipe.tag}</Tag>
        <span className="inline-flex items-center gap-1 text-[0.6875rem] text-ink-3">
          <Clock size={11} /> {recipe.prepMin} min
        </span>
        <span className="tnum text-[0.6875rem] text-ink-3">{formatKcal(recipe.kcal)}</span>
      </div>

      <div className="mt-5">
        <SectionLabel className="mb-2.5 block">You need</SectionLabel>
        <ul className="space-y-1.5">
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient} className="flex items-center gap-2.5 text-[0.8125rem] text-ink-2">
              <span className="h-1 w-1 flex-shrink-0 rounded-full bg-nourish" />
              {ingredient}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <SectionLabel className="mb-2.5 block">Method</SectionLabel>
        <ol className="space-y-3">
          {recipe.steps.map((step, i) => (
            <li key={step} className="flex gap-3 text-[0.8125rem] leading-5 text-ink-2">
              <span className="tnum flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-surface-3 text-[0.6875rem] font-semibold">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3.5">
        <Utensils size={15} className="mt-0.5 flex-shrink-0 text-nourish" />
        <p className="text-[0.75rem] leading-5 text-ink-2">
          Numbers are per serving and approximate. Cooking the same dish twice never gives you the
          same plate.
        </p>
      </div>
    </Sheet>
  );
}
