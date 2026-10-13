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
