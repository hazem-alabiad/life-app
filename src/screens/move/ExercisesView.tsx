import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Card } from '../../components/Card';
import { FilterChip } from '../../components/Chip';
import { ExerciseArt } from '../../components/ExerciseArt';
import { EmptyState } from '../../components/States';
import type { BodyPart, Difficulty, Equipment } from '../../types';
import { STRENGTH_EXERCISES } from '../../data/exercises';

const BODY_PARTS: BodyPart[] = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Core',
  'Legs',
  'Glutes',
  'Full body',
];

const EQUIPMENT: Equipment[] = [
  'Bodyweight',
  'Dumbbell',
  'Barbell',
  'Kettlebell',
  'Band',
  'Bench',
  'Machine',
  'Mat',
];

const DIFFICULTIES: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

interface ExercisesViewProps {
  onOpenExercise: (exerciseId: string) => void;
}

export function ExercisesView({ onOpenExercise }: ExercisesViewProps) {
  const [query, setQuery] = useState('');
  const [bodyPart, setBodyPart] = useState<BodyPart | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STRENGTH_EXERCISES.filter((e) => {
      if (bodyPart && e.bodyPart !== bodyPart) return false;
      if (equipment && e.equipment !== equipment) return false;
      if (difficulty && e.difficulty !== difficulty) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.target.toLowerCase().includes(q) ||
        e.bodyPart.toLowerCase().includes(q)
      );
    });
  }, [query, bodyPart, equipment, difficulty]);

  const activeCount = [bodyPart, equipment, difficulty].filter(Boolean).length;

  return (
    /* Filters become a sticky rail on desktop instead of a panel you have to
       open, and the results fill two columns beside it. */
    <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-6">
      <div className="space-y-3 lg:sticky lg:top-24 lg:col-span-3">
      <div className="relative">
        <Search
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          enterKeyHint="search"
          placeholder="Search 40+ movements"
          aria-label="Search exercises"
          className="h-12 w-full rounded-full border border-line bg-field pl-11 pr-11 text-[0.875rem] text-ink placeholder:text-ink-3 focus:border-move/50"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-3"
          >
            <X size={16} />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Filters"
            onClick={() => setFiltersOpen((v) => !v)}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-3 lg:hidden"
          >
            <SlidersHorizontal size={16} />
          </button>
        )}
      </div>

      <div
        className={`space-y-2.5 rounded-[var(--radius-card)] border border-line bg-surface p-4 ${
          filtersOpen ? '' : 'hidden'
        } lg:block`}
      >
          <FilterRow label="Body part">
            {BODY_PARTS.map((part) => (
              <FilterChip
                key={part}
                selected={bodyPart === part}
                onClick={() => setBodyPart(bodyPart === part ? null : part)}
              >
                {part}
              </FilterChip>
            ))}
          </FilterRow>
          <FilterRow label="Equipment">
            {EQUIPMENT.map((item) => (
              <FilterChip
                key={item}
                selected={equipment === item}
                onClick={() => setEquipment(equipment === item ? null : item)}
              >
                {item}
              </FilterChip>
            ))}
          </FilterRow>
          <FilterRow label="Difficulty">
            {DIFFICULTIES.map((level) => (
              <FilterChip
                key={level}
                selected={difficulty === level}
                onClick={() => setDifficulty(difficulty === level ? null : level)}
              >
                {level}
              </FilterChip>
            ))}
          </FilterRow>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setBodyPart(null);
                setEquipment(null);
                setDifficulty(null);
              }}
              className="pt-1 text-[0.75rem] font-medium text-move"
            >
              Clear {activeCount} filter{activeCount > 1 ? 's' : ''}
            </button>
          )}
      </div>
      </div>

      <div className="mt-4 space-y-4 lg:col-span-9 lg:mt-0">
      <div className="flex items-center justify-between">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
          {results.length} movement{results.length === 1 ? '' : 's'}
        </span>
        {activeCount > 0 && !filtersOpen && (
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="text-[0.6875rem] font-medium text-move lg:hidden"
          >
            {activeCount} filter{activeCount > 1 ? 's' : ''} on
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <EmptyState
          title="Nothing matches yet"
          body="Try a broader search, or clear a filter or two."
        />
      ) : (
        <ul className="grid gap-2 md:grid-cols-2 lg:gap-3">
          {results.map((exercise) => (
            <li key={exercise.id}>
              <Card
                as="button"
                onClick={() => onOpenExercise(exercise.id)}
                ariaLabel={`${exercise.name}, ${exercise.target}`}
                pad="sm"
              >
                <div className="flex items-center gap-3.5">
                  <ExerciseArt exercise={exercise} size={54} rounded="rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.875rem] font-medium text-ink">{exercise.name}</p>
                    <p className="mt-0.5 truncate text-[0.75rem] text-ink-3">
                      {exercise.target} · {exercise.equipment}
                    </p>
                  </div>
                  <span className="flex-shrink-0 rounded-full bg-surface-3 px-2 py-0.5 text-[0.625rem] font-medium text-ink-3">
                    {exercise.difficulty}
                  </span>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1.5 block text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
        {label}
      </span>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">{children}</div>
    </div>
  );
}