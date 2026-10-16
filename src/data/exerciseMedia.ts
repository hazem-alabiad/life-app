/**
 * Two-frame form demos per exercise id.
 *
 * Frames come from the open Free Exercise DB catalogue
 * (github.com/yuhonas/free-exercise-db, MIT), pinned to a fixed commit and
 * served over the jsDelivr CDN so the URLs never rot. `ExerciseArt`
 * crossfades the two frames into a looping demo; ids missing here — and any
 * image that fails to load — fall back to the drawn tile.
 */
const CDN =
  'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/exercises';

function frames(folder: string): [string, string] {
  return [`${CDN}/${folder}/0.jpg`, `${CDN}/${folder}/1.jpg`];
}

export const EXERCISE_FRAMES: Record<string, [string, string]> = {
  'ankle-rocks': frames('Ankle_Circles'),
  'banded-lateral-walk': frames('Monster_Walk'),
  'bench-dip': frames('Bench_Dips'),
  'bench-press': frames('Wide-Grip_Barbell_Bench_Press'),
  'bent-over-row': frames('Bent_Over_Barbell_Row'),
  'bodyweight-squat': frames('Bodyweight_Squat'),
  'bulgarian-split-squat': frames('Split_Squats'),
  'calf-raise': frames('Standing_Calf_Raises'),
  'cross-body-shoulder': frames('Shoulder_Stretch'),
  'db-curl': frames('Dumbbell_Bicep_Curl'),
  'db-fly': frames('Dumbbell_Flyes'),
  'db-overhead-press': frames('Dumbbell_Shoulder_Press'),
  'dead-bug': frames('Dead_Bug'),
  'dip': frames('Parallel_Bar_Dip'),
  'doorway-chest-opener': frames('Dynamic_Chest_Stretch'),
  'face-pull': frames('Face_Pull'),
  'farmers-carry': frames('Farmers_Walk'),
  'glute-bridge': frames('Butt_Lift_Bridge'),
  'goblet-squat': frames('Goblet_Squat'),
  'hammer-curl': frames('Hammer_Curls'),
  'hanging-knee-raise': frames('Hanging_Leg_Raise'),
  'hip-flexor-lunge': frames('Kneeling_Hip_Flexor'),
  'hip-thrust': frames('Barbell_Hip_Thrust'),
  'incline-db-press': frames('Incline_Dumbbell_Press'),
  'kb-swing': frames('One-Arm_Kettlebell_Swings'),
  'knees-to-chest': frames('Hug_Knees_To_Chest'),
  'lat-pulldown': frames('Wide-Grip_Lat_Pulldown'),
  'mountain-climber': frames('Mountain_Climbers'),
  'neck-side-stretch': frames('Side_Neck_Stretch'),
  'one-arm-row': frames('One-Arm_Dumbbell_Row'),
  'overhead-triceps': frames('Overhead_Triceps'),
  'plank': frames('Plank'),
  'pull-up': frames('Pullups'),
  'push-up': frames('Pushups'),
  'rear-delt-fly': frames('Reverse_Flyes'),
  'romanian-deadlift': frames('Romanian_Deadlift'),
  'side-plank': frames('Push_Up_to_Side_Plank'),
  'standing-quad-stretch': frames('Quad_Stretch'),
  'superman': frames('Superman'),
  'triceps-pushdown': frames('Triceps_Pushdown'),
  'walking-lunge': frames('Bodyweight_Walking_Lunge'),
  'lateral-raise': frames('Side_Lateral_Raise'),
};
