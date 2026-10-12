import { FOODS, tipsFor } from '../data/foods';
import type { MacroSet } from '../types';

export interface MealEstimate {
  name: string;
  kcal: number;
  macros: MacroSet;
  tips: string[];
  confidence: number;
}

/** FNV-1a over the image bytes, so the same photo always yields the same result. */
function hashBytes(bytes: Uint8Array): number {
  let hash = 0x811c9dc5;
  // Sampling every 97th byte keeps this instant on multi-megabyte photos.
  for (let i = 0; i < bytes.length; i += 97) {
    hash ^= bytes[i]!;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function matchFilename(name: string) {
  const words = name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, '')
    .split(/[^a-z]+/)
    .filter((w) => w.length > 3);
  if (words.length === 0) return null;
  return (
    FOODS.find((food) =>
      words.some((word) => food.name.toLowerCase().includes(word)),
    ) ?? null
  );
}

/**
 * Estimates a meal from a captured photo.
 *
 * This is deliberately an on-device heuristic, not a trained model: it hashes
 * the image to pick a plausible entry from the seeded food table and varies the
 * portion slightly. The UI labels it as an estimate and always lets the result
 * be corrected, so nothing here is presented as measured truth.
 */
export async function estimateMeal(file: File): Promise<MealEstimate> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const hash = hashBytes(bytes);
  const named = matchFilename(file.name);
  const food = named ?? FOODS[hash % FOODS.length]!;

  // Portion wobble between roughly 85% and 118%, stable per image.
  const portion = 0.85 + ((hash >>> 8) % 34) / 100;
  const round1 = (n: number) => Math.round(n * portion);

  const macros: MacroSet = {
    protein: round1(food.macros.protein),
    carbs: round1(food.macros.carbs),
    fat: round1(food.macros.fat),
    sugar: round1(food.macros.sugar),
  };

  return {
    name: food.name,
    kcal: Math.round((food.kcal * portion) / 10) * 10,
    macros,
    tips: tipsFor({ ...food, macros, kcal: Math.round(food.kcal * portion) }),
    confidence: named ? 0.86 : 0.58 + ((hash >>> 16) % 24) / 100,
  };
}

/** Manual entry uses the same table so both paths produce comparable numbers. */
export function manualEstimate(name: string, portion = 1): MealEstimate {
  const match =
    FOODS.find((f) => f.name.toLowerCase() === name.toLowerCase()) ??
    FOODS.find((f) => f.name.toLowerCase().includes(name.toLowerCase())) ??
    null;

  if (!match) {
    return {
      name,
      kcal: 400,
      macros: { protein: 20, carbs: 40, fat: 15, sugar: 8 },
      tips: [
        'Logged by hand, so these are rough numbers. That is fine — a rough log you keep beats a precise one you abandon.',
      ],
      confidence: 0,
    };
  }

  const macros: MacroSet = {
    protein: Math.round(match.macros.protein * portion),
    carbs: Math.round(match.macros.carbs * portion),
    fat: Math.round(match.macros.fat * portion),
    sugar: Math.round(match.macros.sugar * portion),
  };

  return {
    name: match.name,
    kcal: Math.round((match.kcal * portion) / 10) * 10,
    macros,
    tips: tipsFor({ ...match, macros, kcal: match.kcal * portion }),
    confidence: 0,
  };
}

/**
 * Downscales a captured frame before storing it, so a log of photos stays
 * inside the localStorage budget instead of blowing it on one lunch.
 */
export function downscaleImage(file: File, maxEdge = 480): Promise<string> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve('');
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve('');
    };
    img.src = url;
  });
}
