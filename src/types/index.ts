export type TabType = 'home' | 'move' | 'focus' | 'nourish';

export interface ExerciseItem {
  id: string;
  name: string;
  sets: number;
  repsOrDuration: string;
  image: string;
  targetMuscles: string[];
  tips: string;
}

export interface WorkoutSession {
  id: string;
  title: string;
  durationMin: number;
  intensity: 'Light' | 'Moderate' | 'High';
  tags: string[];
  exercises: ExerciseItem[];
  suggestedBy?: string;
}

export interface MealItem {
  id: string;
  name: string;
  time: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image?: string;
  mindfulInsight: string;
}

export interface FocusSessionState {
  title: string;
  currentCycle: number;
  totalCycles: number;
  secondsRemaining: number;
  totalSeconds: number;
  isRunning: boolean;
  mode: 'focus' | 'posture_break' | 'deep_break';
  ambientSound: 'none' | 'rain' | 'binaural' | 'forest' | 'lofi';
}

export interface GitHubUser {
  id: string;
  login: string;
  name: string;
  avatar_url: string;
  email: string;
  bio?: string;
  public_repos?: number;
  connectedAt: string;
  isDemo?: boolean;
}

export type SyncStatus = 'idle' | 'syncing' | 'saved' | 'error';

export interface PomodoroSubTask {
  id: string;
  title: string;
  completed: boolean;
  estimatedPoms?: number;
  completedPoms?: number;
}

export interface PomodoroTask {
  id: string;
  title: string;
  completed: boolean;
  subTasks: PomodoroSubTask[];
  estimatedPoms?: number;
  completedPoms?: number;
}

export interface PomodoroTaskGroup {
  id: string;
  name: string;
  icon: string;
  color: 'emerald' | 'cyan' | 'purple' | 'amber' | 'rose';
  tasks: PomodoroTask[];
}
