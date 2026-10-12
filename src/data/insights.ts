/**
 * Curated daily insights.
 *
 * Deliberately a fixed, written set rather than anything generated on the fly:
 * the spec asks for one calm, trustworthy line per day, drawn from reputable
 * general-health guidance. Rotated by day of year so it changes daily but is
 * stable within a day.
 */
export interface Insight {
  title: string;
  body: string;
  source: string;
  module: 'move' | 'focus' | 'nourish';
}

export const INSIGHTS: Insight[] = [
  {
    title: 'Walking is the quiet multiplier',
    body: 'A 10-minute walk after a meal blunts the blood-sugar spike noticeably more than the same walk at another time. It also counts toward your weekly minutes.',
    source: 'General physical-activity guidance',
    module: 'move',
  },
  {
    title: 'Grip strength tracks with more than grip',
    body: 'Carrying something heavy for 30 metres loads your trunk, shoulders, and grip at once. It is one of the highest return movements for the time it takes.',
    source: 'Resistance-training literature',
    module: 'move',
  },
  {
    title: 'Attention has a recovery curve',
    body: 'Focus drops sharply after roughly 50 minutes of unbroken work and recovers faster with a real break than with a screen break. Stand up, look far away.',
    source: 'Attention-restoration research',
    module: 'focus',
  },
  {
    title: 'Rest is part of the set',
    body: 'Between hard sets, untrained rest of 90 seconds is enough for most people. Under two minutes keeps the session moving without flattening quality.',
    source: 'Strength-training guidance',
    module: 'move',
  },
  {
    title: 'Protein is a per-meal decision',
    body: 'Muscle protein synthesis responds to per-meal doses, not daily totals alone. Getting 25–40 g at each main meal beats one large hit at night.',
    source: 'Nutrition research',
    module: 'nourish',
  },
  {
    title: 'Sleep is the load-bearing habit',
    body: 'Almost every other metric — appetite, mood, training quality, focus span — moves with your sleep. Protecting the last hour before bed pays out everywhere.',
    source: 'Sleep research',
    module: 'focus',
  },
  {
    title: 'Fibre is the unglamorous one',
    body: 'Most adults get roughly half the fibre they need. Beans, lentils, oats, and berries close the gap with food rather than supplements.',
    source: 'Dietary guidance',
    module: 'nourish',
  },
  {
    title: 'Mobility is a practice, not a warm-up',
    body: 'Two minutes of hip and thoracic work daily will outperform one long session a week. Small and boring wins here.',
    source: 'Movement practice',
    module: 'move',
  },
  {
    title: 'Light in the morning sets the day',
    body: 'Ten minutes of outdoor light early makes it easier to fall asleep at night and steadies daytime alertness. It costs nothing but a walk.',
    source: 'Circadian research',
    module: 'focus',
  },
  {
    title: 'Volume builds, intensity proves',
    body: 'Adding reps builds the capacity; adding weight proves it. Progress one at a time, and only when the last set felt truly controlled.',
    source: 'Training principles',
    module: 'move',
  },
  {
    title: 'Hydration changes how effort feels',
    body: 'Mild dehydration reliably makes the same workload feel harder. A glass of water before a session is the cheapest performance aid there is.',
    source: 'Exercise physiology',
    module: 'move',
  },
  {
    title: 'One hard thing at a time',
    body: 'Trying to change training, diet, and sleep in the same week usually ends with none of them. Pick the one with the most leverage and hold it for a month.',
    source: 'Behaviour-change practice',
    module: 'nourish',
  },
  {
    title: 'Your back likes movement, not stillness',
    body: 'For ordinary back stiffness, gentle movement repeatedly through the day helps more than resting flat. Walk, hinge, and rotate a little, often.',
    source: 'Back-care guidance',
    module: 'move',
  },
  {
    title: 'Savour the first three bites',
    body: 'Slowing the first three bites increases how much you notice and how full you feel by the end. It is a small habit with a long tail.',
    source: 'Mindful-eating research',
    module: 'nourish',
  },
];

/** Short prompts shown during a break, chosen from the user's stretch goal. */
export interface BreakStretch {
  exerciseId: string;
  line: string;
}

export const BREAK_STRETCHES: Record<string, BreakStretch[]> = {
  flexibility: [
    { exerciseId: 'standing-quad-stretch', line: 'Stand tall, draw the heel toward your glute, keep knees together.' },
    { exerciseId: 'seated-forward-fold', line: 'Sit long, hinge from the hips, breathe out and soften.' },
    { exerciseId: 'downward-dog', line: 'Hips up and back, press the floor away, pedal the heels.' },
  ],
  back: [
    { exerciseId: 'cat-cow', line: 'On all fours, round and arch slowly with your breath.' },
    { exerciseId: 'childs-pose', line: 'Knees wide, sit back to your heels, forehead down.' },
    { exerciseId: 'supine-twist', line: 'On your back, drop one knee across, turn your head away.' },
  ],
  shoulder: [
    { exerciseId: 'cross-body-shoulder', line: 'Draw one arm across your chest, keep the shoulder down.' },
    { exerciseId: 'doorway-chest-opener', line: 'Forearm on the doorframe, step through, chest lifted.' },
    { exerciseId: 'neck-side-stretch', line: 'Tilt one ear to the shoulder, add only the weight of your hand.' },
  ],
  mobility: [
    { exerciseId: 'worlds-greatest-stretch', line: 'Deep lunge, hands down, rotate the inside arm to the ceiling.' },
    { exerciseId: '90-90-hip-switch', line: 'Sit tall, knees pressing down, switch sides through the hips.' },
    { exerciseId: 'thoracic-rotation', line: 'On your side, open the top arm like a book, knees still.' },
  ],
};

/* ---------------------------------------------------------------- recipes */

export interface RecipeCard {
  id: string;
  name: string;
  prepMin: number;
  kcal: number;
  tag: string;
  summary: string;
  ingredients: string[];
  steps: string[];
}

export const RECIPES: RecipeCard[] = [
  {
    id: 'recipe-lentil-bowl',
    name: 'Lemon Lentil Bowl',
    prepMin: 15,
    kcal: 480,
    tag: 'High fibre',
    summary: 'Warm lentils, roasted vegetables, and a sharp lemon dressing. Keeps well for two days.',
    ingredients: [
      '1 cup cooked green lentils',
      '1 roasted red pepper',
      'Handful of spinach',
      '1 tbsp olive oil, juice of half a lemon',
      'Cumin, salt, black pepper',
    ],
    steps: [
      'Warm the lentils with a splash of water in a pan.',
      'Add the pepper and spinach; stir until the spinach wilts.',
      'Take off the heat and dress with oil, lemon, and cumin.',
      'Season and eat warm, or chill for tomorrow.',
    ],
  },
  {
    id: 'recipe-yoghurt-bowl',
    name: 'Greek Yoghurt & Seed Bowl',
    prepMin: 5,
    kcal: 320,
    tag: 'Protein',
    summary: 'A five-minute breakfast with enough protein to hold until lunch.',
    ingredients: [
      '200 g Greek yoghurt',
      '1 tbsp pumpkin seeds',
      'Handful of frozen berries',
      'Cinnamon',
    ],
    steps: [
      'Spoon the yoghurt into a bowl.',
      'Top with berries and seeds.',
      'Dust with cinnamon and eat immediately.',
    ],
  },
  {
    id: 'recipe-salmon-tray',
    name: 'One-Tray Salmon & Greens',
    prepMin: 25,
    kcal: 560,
    tag: 'Omega-3',
    summary: 'One tray, one wash-up. Salmon, broccoli, and new potatoes.',
    ingredients: [
      '1 salmon fillet',
      '1 head of broccoli, in florets',
      '250 g new potatoes, halved',
      '1 tbsp olive oil, lemon, garlic',
    ],
    steps: [
      'Heat the oven to 200°C.',
      'Toss potatoes and broccoli in oil, garlic, and salt.',
      'Roast for 15 minutes, then add the salmon on top.',
      'Roast 10 more minutes and finish with lemon.',
    ],
  },
  {
    id: 'recipe-chickpea-shakshuka',
    name: 'Chickpea Shakshuka',
    prepMin: 20,
    kcal: 410,
    tag: 'Plant protein',
    summary: 'Tomato, chickpeas, and eggs poached in the pan. Good for dinner or a slow breakfast.',
    ingredients: [
      '1 tin chopped tomatoes',
      '1 tin chickpeas, drained',
      '2 eggs',
      'Onion, garlic, cumin, paprika',
      'Fresh parsley',
    ],
    steps: [
      'Soften onion and garlic, then add the spices.',
      'Add tomatoes and chickpeas; simmer 10 minutes.',
      'Make two wells and crack in the eggs.',
      'Cover until the whites set, then scatter parsley.',
    ],
  },
  {
    id: 'recipe-overnight-oats',
    name: 'Overnight Oats',
    prepMin: 4,
    kcal: 380,
    tag: 'Slow carbs',
    summary: 'Assemble the night before; breakfast is waiting when you wake.',
    ingredients: ['50 g oats', '150 ml milk or oat milk', '1 tbsp chia', 'Half a grated apple', 'Cinnamon'],
    steps: [
      'Stir everything together in a jar.',
      'Cover and refrigerate overnight.',
      'Thin with a splash of milk in the morning.',
    ],
  },
];
