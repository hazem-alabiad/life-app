import { ArrowRight, Clock, RefreshCw, Sparkles, Utensils } from 'lucide-react';
import { Card, CardHeader, SectionLabel } from '../../components/Card';
import { Button } from '../../components/Button';
import { TrendLine } from '../../components/TrendLine';
import { MacroBar } from '../../components/Bar';
import { ACCENT } from '../../components/accent';
import { useStore } from '../../state/store';
import type { SheetKind } from '../../types';
import { formatKcal } from '../../lib/format';
import { dayOfYear } from '../../lib/date';
import { averageCalories, calorieTrend, mealsForDay } from '../../lib/selectors';
import { INSIGHTS, RECIPES } from '../../data/insights';

interface InsightsViewProps {
  onOpenSheet: (sheet: SheetKind) => void;
}

export function InsightsView({ onOpenSheet }: InsightsViewProps) {
  const { state, dispatch, now } = useStore();
  const today = new Date(now);

  const trend = calorieTrend(state, 7, today);
  const average = averageCalories(trend);
  const goal = state.settings.dailyCalorieGoal;
  const insight = INSIGHTS[(dayOfYear(today) + 3) % INSIGHTS.length]!;

  const weekMeals = trend.reduce((sum, v) => sum + v, 0);
  const loggedDays = trend.filter((v) => v > 0).length;
  const weekMacros = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today);
    day.setDate(day.getDate() - (6 - i));
    return mealsForDay(state, day);
  })
    .flat()
    .reduce(
      (acc, meal) => ({
        protein: acc.protein + meal.macros.protein,
        carbs: acc.carbs + meal.macros.carbs,
        fat: acc.fat + meal.macros.fat,
      }),
      { protein: 0, carbs: 0, fat: 0 },
    );

  return (
    <div className="grid gap-4 lg:grid-flow-row-dense lg:grid-cols-12 lg:items-start lg:gap-6">
      <Card className="lg:col-span-8">
        <CardHeader
          label="Last 7 days"
          action={
            <span className="text-[0.6875rem] text-ink-3">
              {average > 0 ? `avg ${formatKcal(average)}` : 'no data'}
            </span>
          }
        />
        {/* A single-day average would be noise dressed up as a finding. */}
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="tnum text-[1.625rem] font-semibold leading-none text-ink">
              {average > 0 ? average.toLocaleString() : '—'}
            </p>
            <p className="mt-1.5 text-[0.75rem] text-ink-3">average daily calories</p>
          </div>
          <div className="text-right">
            <p className="tnum text-[0.875rem] font-medium text-ink">{formatKcal(weekMeals)}</p>
            <p className="mt-0.5 text-[0.6875rem] text-ink-3">logged this week</p>
          </div>
        </div>

        {/* Thinner and lighter than the workout chart, on purpose. */}
        <div className="mt-4">
          <TrendLine values={trend} color={ACCENT.nourish.hex} height={64} label="Calories" />
        </div>
        <p className="mt-2 text-[0.6875rem] text-ink-3">
          Days with nothing logged are left out rather than counted as zero.
        </p>

        <div className="mt-5 border-t border-line pt-4">
          <SectionLabel className="mb-3 block">Where the week came from</SectionLabel>
          <MacroBar
            protein={weekMacros.protein}
            carbs={weekMacros.carbs}
            fat={weekMacros.fat}
            labels
          />
        </div>

        {loggedDays >= 3 && (
          <p className="mt-4 text-[0.75rem] leading-5 text-ink-2">
            {average > goal * 1.15
              ? `Averaging about ${Math.round(average - goal)} kcal a day above your ${formatKcal(goal)} reference. Worth knowing, not worth policing.`
              : average < goal * 0.7
                ? `Averaging ${Math.round(average)} kcal against a ${formatKcal(goal)} reference. Under-eating is easy to miss when you are busy — worth a look if the week felt flat.`
                : `Comfortably inside your ${formatKcal(goal)} reference this week.`}
          </p>
        )}
        {loggedDays > 0 && loggedDays < 3 && (
          <p className="mt-4 text-[0.75rem] leading-5 text-ink-3">
            Only {loggedDays} day{loggedDays === 1 ? '' : 's'} logged so far. Patterns need a few days
            before they mean much.
          </p>
        )}
      </Card>

      <Card
        as="button"
        onClick={() => onOpenSheet({ kind: 'insight' })}
        ariaLabel="Daily insight"
        className="lg:col-span-4"
      >
        <div className="mb-2 flex items-center gap-2">
          <Sparkles size={14} className="text-ink-3" />
          <SectionLabel>Daily insight</SectionLabel>
        </div>
        <h3 className="text-[0.9375rem] font-medium leading-6 text-ink">{insight.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-5 text-ink-2">{insight.body}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-[0.75rem] font-medium text-ink-3">
          Read more <ArrowRight size={13} />
        </span>
      </Card>

      <div className="lg:col-span-8">
        <div className="mb-3 flex items-center justify-between">
          <SectionLabel>Worth cooking</SectionLabel>
          <span className="inline-flex items-center gap-1 text-[0.6875rem] text-ink-3">
            <Utensils size={12} /> curated
          </span>
        </div>
        <ul className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {RECIPES.slice(0, 3).map((recipe) => (
            <li key={recipe.id}>
              <Card as="button" onClick={() => onOpenSheet({ kind: 'recipe', recipeId: recipe.id })} pad="sm">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-nourish-soft">
                    <Utensils size={17} className="text-nourish" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.875rem] font-medium text-ink">
                      {recipe.name}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2 text-[0.6875rem] text-ink-3">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} /> {recipe.prepMin} min
                      </span>
                      <span className="tnum">{formatKcal(recipe.kcal)}</span>
                      <span className="rounded-full bg-surface-3 px-2 py-0.5">{recipe.tag}</span>
                    </span>
                  </span>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>

      {/* Sample data is disclosed rather than passed off as the user's own. */}
      {state.demoSeeded && (
        <Card pad="sm" className="border-line-strong lg:col-span-4">
          <div className="flex items-start gap-3">
            <RefreshCw size={15} className="mt-0.5 flex-shrink-0 text-ink-3" />
            <div className="min-w-0 flex-1">
              <p className="text-[0.75rem] font-medium text-ink">Includes sample history</p>
              <p className="mt-1 text-[0.6875rem] leading-5 text-ink-3">
                This week was seeded so the charts had something to draw. Clear it and the app
                starts from your own logs only.
              </p>
            </div>
          </div>
          <Button
            accent="nourish"
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => dispatch({ type: 'demo/clear' })}
          >
            Clear sample data
          </Button>
        </Card>
      )}
    </div>
  );
}
