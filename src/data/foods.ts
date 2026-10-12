import type { MacroSet } from '../types';

export interface FoodTemplate {
  name: string;
  /** Serving description shown next to the name, e.g. "1 bowl". */
  serving: string;
  kcal: number;
  macros: MacroSet;
  /** Drives which swap-a-component tips get offered. */
  flags: Array<'high-sugar' | 'low-protein' | 'high-carb' | 'fried' | 'caffeine' | 'alcohol'>;
}

/**
 * Seeded food table.
 *
 * Stands in for a vision model: the meal estimator picks deterministically from
 * this list, then derives tips from the macro shape. Swap `estimateMeal` for a
 * real API call and this table becomes the offline fallback.
 */
export const FOODS: FoodTemplate[] = [
  {
    name: 'Salmon Quinoa Bowl',
    serving: '1 bowl',
    kcal: 640,
    macros: { protein: 42, carbs: 55, fat: 18, sugar: 6 },
    flags: [],
  },
  {
    name: 'Chicken Rice Plate',
    serving: '1 plate',
    kcal: 610,
    macros: { protein: 45, carbs: 62, fat: 14, sugar: 5 },
    flags: [],
  },
  {
    name: 'Greek Yoghurt with Berries',
    serving: '1 bowl',
    kcal: 240,
    macros: { protein: 18, carbs: 26, fat: 6, sugar: 14 },
    flags: [],
  },
  {
    name: 'Egg & Avocado Toast',
    serving: '2 slices',
    kcal: 420,
    macros: { protein: 18, carbs: 34, fat: 24, sugar: 4 },
    flags: [],
  },
  {
    name: 'Oatmeal with Banana',
    serving: '1 bowl',
    kcal: 350,
    macros: { protein: 11, carbs: 62, fat: 7, sugar: 18 },
    flags: ['high-carb'],
  },
  {
    name: 'Turkey Sandwich',
    serving: '1 sandwich',
    kcal: 480,
    macros: { protein: 28, carbs: 48, fat: 18, sugar: 8 },
    flags: [],
  },
  {
    name: 'Grilled Chicken Salad',
    serving: '1 bowl',
    kcal: 380,
    macros: { protein: 36, carbs: 18, fat: 18, sugar: 7 },
    flags: [],
  },
  {
    name: 'Pasta with Tomato Sauce',
    serving: '1 plate',
    kcal: 560,
    macros: { protein: 17, carbs: 88, fat: 13, sugar: 12 },
    flags: ['high-carb', 'low-protein'],
  },
  {
    name: 'Cheeseburger & Fries',
    serving: '1 meal',
    kcal: 980,
    macros: { protein: 34, carbs: 96, fat: 48, sugar: 12 },
    flags: ['fried', 'high-carb'],
  },
  {
    name: 'Margherita Pizza',
    serving: '3 slices',
    kcal: 720,
    macros: { protein: 28, carbs: 82, fat: 28, sugar: 9 },
    flags: ['high-carb'],
  },
  {
    name: 'Protein Shake',
    serving: '1 bottle',
    kcal: 180,
    macros: { protein: 30, carbs: 8, fat: 3, sugar: 3 },
    flags: [],
  },
  {
    name: 'Pad Thai',
    serving: '1 plate',
    kcal: 700,
    macros: { protein: 22, carbs: 84, fat: 28, sugar: 20 },
    flags: ['high-carb', 'high-sugar'],
  },
  {
    name: 'Sushi Set',
    serving: '8 pieces',
    kcal: 520,
    macros: { protein: 26, carbs: 78, fat: 10, sugar: 10 },
    flags: ['high-carb'],
  },
  {
    name: 'Scrambled Eggs on Sourdough',
    serving: '1 plate',
    kcal: 400,
    macros: { protein: 22, carbs: 32, fat: 20, sugar: 3 },
    flags: [],
  },
  {
    name: 'Beef Stir-fry with Rice',
    serving: '1 bowl',
    kcal: 640,
    macros: { protein: 38, carbs: 64, fat: 22, sugar: 11 },
    flags: [],
  },
  {
    name: 'Cereal with Milk',
    serving: '1 bowl',
    kcal: 310,
    macros: { protein: 9, carbs: 58, fat: 6, sugar: 24 },
    flags: ['high-sugar', 'low-protein'],
  },
  {
    name: 'Soda',
    serving: '1 can',
    kcal: 140,
    macros: { protein: 0, carbs: 39, fat: 0, sugar: 39 },
    flags: ['high-sugar'],
  },
  {
    name: 'Chicken Burrito Bowl',
    serving: '1 bowl',
    kcal: 700,
    macros: { protein: 42, carbs: 72, fat: 24, sugar: 8 },
    flags: [],
  },
  {
    name: 'Lentil Soup with Bread',
    serving: '1 bowl',
    kcal: 430,
    macros: { protein: 20, carbs: 62, fat: 9, sugar: 9 },
    flags: [],
  },
  {
    name: 'Chocolate Croissant',
    serving: '1 pastry',
    kcal: 380,
    macros: { protein: 6, carbs: 44, fat: 20, sugar: 22 },
    flags: ['high-sugar', 'low-protein'],
  },
];

/** Tips are chosen from the macro shape, not written per food. */
export function tipsFor(food: FoodTemplate): string[] {
  const tips: string[] = [];
  const { macros, flags } = food;

  if (flags.includes('high-sugar') || macros.sugar >= 25) {
    tips.push(
      `Sugar is doing a lot of the work here (${Math.round(macros.sugar)} g). Sparkling water or black coffee alongside it keeps the rest of the meal intact.`,
    );
  }
  if (flags.includes('low-protein') || macros.protein < 20) {
    tips.push(
      `Only ${Math.round(macros.protein)} g protein. Adding eggs, yoghurt, or beans would hold you steadier through the next few hours.`,
    );
  }
  if (flags.includes('fried')) {
    tips.push('Fried, so it lands heavy. Worth pairing with something raw and green rather than more starch.');
  }
  if (macros.protein >= 30 && macros.sugar < 15) {
    tips.push('Good protein-to-sugar balance — this is the shape of a meal that keeps you level.');
  }
  if (macros.carbs >= 70 && macros.protein >= 25) {
    tips.push('Carb-led but decent protein. A short walk after eating helps steady the curve.');
  }
  if (tips.length === 0) {
    tips.push('Balanced enough. Nothing here needs fixing — log it and move on.');
  }
  return tips.slice(0, 2);
}

export const MANUAL_FOOD_NAMES = FOODS.slice(0, 12).map((f) => f.name);
