import type { StretchGoal, Workout, WorkoutItem } from '../types';
import { EXERCISES_BY_ID, STRETCH_EXERCISES, getExercise } from './exercises';
import { newId } from '../lib/id';

interface Template {
  name: string;
  items: Array<[string, number]>;
}

/** Hand-built plans the app offers when someone does not want to think. */
export const WORKOUT_TEMPLATES: Template[] = [
  {
    name: 'Upper Body & Core',
    items: [
      ['push-up', 3],
      ['one-arm-row', 3],
      ['db-overhead-press', 3],
      ['db-curl', 2],
      ['plank', 3],
    ],
  },
  {
    name: 'Lower Body Strength',
    items: [
      ['goblet-squat', 4],
      ['romanian-deadlift', 3],
      ['walking-lunge', 3],
      ['calf-raise', 3],
    ],
  },
  {
    name: 'Full Body Circuit',
    items: [
      ['kb-swing', 3],
      ['burpee', 3],
      ['mountain-climber', 3],
      ['farmers-carry', 3],
    ],
  },
  {
    name: 'Back & Shoulders',
    items: [
      ['bent-over-row', 4],
      ['lat-pulldown', 3],
      ['face-pull', 3],
      ['lateral-raise', 3],
      ['superman', 3],
    ],
  },
  {
    name: 'Core & Stability',
    items: [
      ['dead-bug', 3],
      ['side-plank', 3],
      ['bird-dog', 3],
      ['glute-bridge', 3],
    ],
  },
  {
    name: 'Desk Reset',
    items: [
      ['wall-slide', 2],
      ['bodyweight-squat', 2],
      ['bird-dog', 2],
      ['cat-cow', 2],
    ],
  },
];

/** Which muscles a set of items actually trains, for the card chips. */
export function musclesFor(items: WorkoutItem[]): string[] {
  const seen: string[] = [];
  for (const item of items) {
    const exercise = getExercise(item.exerciseId);
    if (!exercise) continue;
    const label = exercise.bodyPart === 'Full body' ? 'Full body' : exercise.bodyPart;
    if (!seen.includes(label)) seen.push(label);
  }
  return seen.slice(0, 4);
}

/** Rough duration estimate: ~1.5 min per set plus a little slack. */
export function estimateDuration(items: WorkoutItem[]): number {
  const sets = items.reduce((sum, item) => sum + item.sets, 0);
  return Math.max(10, Math.round((sets * 1.5 + 6) / 5) * 5);
}

export function buildWorkout(
  name: string,
  items: WorkoutItem[],
  source: Workout['source'] = 'manual',
): Workout {
  return {
    id: newId('wk'),
    name,
    durationMin: estimateDuration(items),
    muscles: musclesFor(items),
    items,
    source,
    kind: 'workout',
  };
}

export function templateToWorkout(index: number): Workout | null {
  const template = WORKOUT_TEMPLATES[index];
  if (!template) return null;
  return buildWorkout(
    template.name,
    template.items.map(([exerciseId, sets]) => ({ exerciseId, sets })),
    'suggested',
  );
}

/**
 * Suggests the next session by avoiding whatever was trained most recently.
 * Deterministic, so the same history always yields the same suggestion.
 */
export function suggestWorkout(recentMuscles: string[]): Workout {
  const recent = new Set(recentMuscles);
  let best = 0;
  let bestScore = -1;

  WORKOUT_TEMPLATES.forEach((template, index) => {
    const muscles = template.items
      .map(([id]) => getExercise(id)?.bodyPart)
      .filter((m): m is NonNullable<typeof m> => Boolean(m));
    const overlap = muscles.filter((m) => recent.has(m)).length;
    const score = muscles.length - overlap * 2;
    if (score > bestScore) {
      bestScore = score;
      best = index;
    }
  });

  const chosen = templateToWorkout(best);
  if (!chosen) throw new Error('No workout templates available');
  return { ...chosen, id: newId('sug'), source: 'suggested' };
}

/* --------------------------------------------------------------- stretch */

/** Curated sequences per goal, played as a guided flow. */
export const STRETCH_PROGRAMS: Record<StretchGoal, string[]> = {
  flexibility: [
    'cat-cow',
    'childs-pose',
    'hip-flexor-lunge',
    'standing-quad-stretch',
    'seated-forward-fold',
    'butterfly-groin',
    'downward-dog',
  ],
  back: [
    'cat-cow',
    'knees-to-chest',
    'childs-pose',
    'supine-twist',
    'thread-the-needle',
    'hip-flexor-lunge',
  ],
  shoulder: [
    'neck-side-stretch',
    'cross-body-shoulder',
    'eagle-arms',
    'doorway-chest-opener',
    'thread-the-needle',
    'thoracic-rotation',
  ],
  mobility: [
    'cat-cow',
    'worlds-greatest-stretch',
    '90-90-hip-switch',
    'ankle-rocks',
    'thoracic-rotation',
    'downward-dog',
  ],
};

export const STRETCH_GOAL_LABELS: Record<StretchGoal, { label: string; blurb: string }> = {
  flexibility: { label: 'Flexibility', blurb: 'Longer holds, hips and hamstrings' },
  back: { label: 'Back health', blurb: 'Unwind a desk-bound spine' },
  shoulder: { label: 'Shoulder relief', blurb: 'Open the chest and upper back' },
  mobility: { label: 'General mobility', blurb: 'Hips, ankles, and rotation' },
};

/** Picks a sequence that fits the time available, keeping every movement's order. */
export function stretchSequence(goal: StretchGoal, minutes: number): string[] {
  const full = STRETCH_PROGRAMS[goal];
  const holds = full.reduce((sum, id) => sum + (EXERCISES_BY_ID[id]?.holdSeconds ?? 30), 0);
  const budget = minutes * 60;
  if (holds <= budget) return full;

  // Keep the sequence shape but trim from the least essential end of each phase.
  const kept: string[] = [];
  let used = 0;
  for (const id of full) {
    const hold = EXERCISES_BY_ID[id]?.holdSeconds ?? 30;
    if (used + hold > budget) continue;
    kept.push(id);
    used += hold;
  }
  return kept.length > 0 ? kept : full.slice(0, 1);
}

export function stretchDuration(ids: string[]): number {
  return Math.round(
    ids.reduce((sum, id) => sum + (EXERCISES_BY_ID[id]?.holdSeconds ?? 30) / 60, 0) +
      ids.length * 0.25,
  );
}

export function stretchWorkout(ids: string[]): Workout {
  const items = ids.map((exerciseId) => ({ exerciseId, sets: 1 }));
  return {
    id: newId('st'),
    name: 'Guided Stretch',
    durationMin: Math.max(5, stretchDuration(ids)),
    muscles: musclesFor(items),
    items,
    source: 'manual',
    kind: 'stretch',
  };
}

export const STRETCH_COUNT = STRETCH_EXERCISES.length;
