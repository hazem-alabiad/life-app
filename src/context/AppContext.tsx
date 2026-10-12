import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { TabType, WorkoutSession, MealItem, FocusSessionState, ExerciseItem, GitHubUser, SyncStatus, PomodoroTaskGroup, PomodoroTask, PomodoroSubTask, AppSettings } from '../types';
import { APP_IMAGES } from '../assets/images';
import { isSupabaseConfigured, syncUserDataToSupabase, fetchUserDataFromSupabase } from '../db/supabase';

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  // Focus State
  focusState: FocusSessionState;
  toggleFocusTimer: () => void;
  resetFocusTimer: () => void;
  setFocusMode: (mode: 'focus' | 'posture_break' | 'deep_break') => void;
  setAmbientSound: (sound: 'none' | 'rain' | 'binaural' | 'forest' | 'lofi') => void;
  // Settings & Configuration
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettingsToDefault: () => void;
  showFocusSettingsModal: boolean;
  setShowFocusSettingsModal: (val: boolean) => void;
  playChime: () => void;
  // Pomodoro Task Groups & Subtasks
  pomodoroGroups: PomodoroTaskGroup[];
  activeFocusTarget: { groupId: string; taskId: string; subTaskId?: string; label: string } | null;
  setActiveFocusTarget: (target: { groupId: string; taskId: string; subTaskId?: string; label: string } | null) => void;
  toggleTaskCompletion: (groupId: string, taskId: string) => void;
  toggleSubTaskCompletion: (groupId: string, taskId: string, subTaskId: string) => void;
  addPomodoroTask: (groupId: string, title: string, estimatedPoms?: number) => void;
  addPomodoroSubTask: (groupId: string, taskId: string, title: string) => void;
  addPomodoroGroup: (name: string, icon: string, color: PomodoroTaskGroup['color']) => void;
  deletePomodoroTask: (groupId: string, taskId: string) => void;
  deletePomodoroSubTask: (groupId: string, taskId: string, subTaskId: string) => void;
  deletePomodoroGroup: (groupId: string) => void;
  // Workout State
  activeWorkout: WorkoutSession | null;
  startWorkout: (workout?: WorkoutSession) => void;
  endWorkout: () => void;
  activeMicroRecovery: boolean;
  openMicroRecovery: () => void;
  closeMicroRecovery: () => void;
  showCustomWorkoutBuilder: boolean;
  setShowCustomWorkoutBuilder: (val: boolean) => void;
  selectedDate: number;
  setSelectedDate: (date: number) => void;
  moveSubTab: 'schedule' | 'exercises' | 'history';
  setMoveSubTab: (tab: 'schedule' | 'exercises' | 'history') => void;
  completedWorkoutsCount: number;
  totalMovementMinutes: number;
  // Nutrition State
  nourishSubTab: 'log' | 'insights';
  setNourishSubTab: (tab: 'log' | 'insights') => void;
  meals: MealItem[];
  addMeal: (meal: Omit<MealItem, 'id'>) => void;
  showSnapMealModal: boolean;
  setShowSnapMealModal: (val: boolean) => void;
  showManualMealModal: boolean;
  setShowManualMealModal: (val: boolean) => void;
  showProfileModal: boolean;
  setShowProfileModal: (val: boolean) => void;
  showSettingsModal: boolean;
  setShowSettingsModal: (val: boolean) => void;
  showSupabaseModal: boolean;
  setShowSupabaseModal: (val: boolean) => void;
  showCommandPalette: boolean;
  setShowCommandPalette: (val: boolean) => void;
  // GitHub Auth & Cloud Persistence
  user: GitHubUser | null;
  isAuthenticated: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  showGitHubAuthModal: boolean;
  setShowGitHubAuthModal: (val: boolean) => void;
  loginWithGitHub: () => Promise<void>;
  loginWithGitHubToken: (token: string) => Promise<{ success: boolean; error?: string }>;
  connectWithGitHubHandle: (handle: string) => Promise<{ success: boolean; error?: string }>;
  demoLoginWithGitHub: () => Promise<void>;
  logoutGitHub: () => Promise<void>;
  syncDataToCloud: () => Promise<void>;
  exportDataAsJSON: () => void;
  clearDataAndReset: () => void;
  // Desktop layout controls
  desktopNavCollapsed: boolean;
  setDesktopNavCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const defaultExercises: ExerciseItem[] = [
  {
    id: 'ex-1',
    name: 'DB Press',
    sets: 3,
    repsOrDuration: '10 reps',
    image: APP_IMAGES.exerciseDbPress,
    targetMuscles: ['Chest', 'Anterior Delts', 'Triceps'],
    tips: 'Retract scapula, lower dumbbells until elbows reach 90 degrees, press with controlled tempo.'
  },
  {
    id: 'ex-2',
    name: 'Tricep Dips',
    sets: 3,
    repsOrDuration: '12 reps',
    image: APP_IMAGES.exerciseTricepDips,
    targetMuscles: ['Triceps', 'Chest', 'Shoulders'],
    tips: 'Keep torso upright to target triceps, lower until upper arms are parallel to floor.'
  },
  {
    id: 'ex-3',
    name: 'Plank Rotations',
    sets: 3,
    repsOrDuration: '45s',
    image: APP_IMAGES.exercisePlankRotations,
    targetMuscles: ['Core', 'Obliques', 'Shoulders'],
    tips: 'Maintain a rigid spine line, rotate with control and pause at the top reach.'
  },
  {
    id: 'ex-4',
    name: 'Hollow Hold',
    sets: 3,
    repsOrDuration: '30s',
    image: APP_IMAGES.exerciseHollowHold,
    targetMuscles: ['Abs', 'Transverse Abdominis', 'Hip Flexors'],
    tips: 'Press lower back flush against the ground, point toes and reach overhead.'
  }
];

export const defaultMainWorkout: WorkoutSession = {
  id: 'workout-upper-body',
  title: 'Upper Body & Core Power',
  durationMin: 35,
  intensity: 'Moderate',
  tags: ['Chest', 'Triceps', 'Abs'],
  suggestedBy: 'Suggested by Life',
  exercises: defaultExercises
};

export const mobilityFlowWorkout: WorkoutSession = {
  id: 'workout-mobility',
  title: 'Post-Work Mobility Flow',
  durationMin: 15,
  intensity: 'Light',
  tags: ['Hips', 'Hamstrings'],
  exercises: [
    {
      id: 'ex-mob-1',
      name: 'World’s Greatest Stretch',
      sets: 3,
      repsOrDuration: '45s each',
      image: APP_IMAGES.exercisePlankRotations,
      targetMuscles: ['Hips', 'Thoracic Spine', 'Hamstrings'],
      tips: 'Lunge deep, drop inside elbow, reach high to open the chest.'
    },
    {
      id: 'ex-mob-2',
      name: '90/90 Hip Switches',
      sets: 3,
      repsOrDuration: '60s',
      image: APP_IMAGES.exerciseHollowHold,
      targetMuscles: ['Internal & External Hip Rotators'],
      tips: 'Keep chest tall as knees sweep from left to right.'
    }
  ]
};

const initialMeals: MealItem[] = [
  {
    id: 'meal-salmon-1',
    name: 'Wild Salmon & Quinoa Bowl',
    time: '12:45 PM',
    mealType: 'Lunch',
    calories: 640,
    protein: 42,
    carbs: 55,
    fat: 18,
    image: APP_IMAGES.mealSalmonBowl,
    mindfulInsight: 'High protein and omega-3s. Good sustained energy for afternoon focus sessions. Remember to hydrate with 500ml water.'
  },
  {
    id: 'meal-breakfast-1',
    name: 'Matcha Oatmeal with Chia & Berries',
    time: '8:15 AM',
    mealType: 'Breakfast',
    calories: 480,
    protein: 26,
    carbs: 68,
    fat: 14,
    mindfulInsight: 'Slow-release complex carbohydrates supporting steady dopamine and alert focus.'
  },
  {
    id: 'meal-snack-1',
    name: 'Raw Walnuts & Golden Apple',
    time: '3:30 PM',
    mealType: 'Snack',
    calories: 220,
    protein: 6,
    carbs: 22,
    fat: 12,
    mindfulInsight: 'Polyunsaturated fatty acids promote cognitive endurance before your final work sprint.'
  }
];

export const initialPomodoroGroups: PomodoroTaskGroup[] = [
  {
    id: 'group-daily',
    name: 'Daily Routines',
    icon: '📅',
    color: 'emerald',
    tasks: [
      {
        id: 'task-morning',
        title: 'Morning Bio-Rhythm Protocol',
        completed: false,
        estimatedPoms: 1,
        completedPoms: 1,
        subTasks: [
          { id: 'sub-1', title: 'Hydrate with 500ml mineralized water', completed: true },
          { id: 'sub-2', title: '10-minute natural sunlight outdoor exposure', completed: true },
          { id: 'sub-3', title: '5-minute thoracic mobility & spine decompression', completed: false },
        ],
      },
      {
        id: 'task-schedule',
        title: 'Ultradian Energy & Schedule Calibration',
        completed: false,
        estimatedPoms: 1,
        completedPoms: 0,
        subTasks: [
          { id: 'sub-4', title: 'Review priority sprint goals for the day', completed: false },
          { id: 'sub-5', title: 'Block 90-minute uninterrupted deep focus sprint', completed: false },
        ],
      },
    ],
  },
  {
    id: 'group-tech',
    name: 'Tech & Architecture',
    icon: '⚡',
    color: 'cyan',
    tasks: [
      {
        id: 'task-security',
        title: 'API Security & Rate Limiting Hardening',
        completed: false,
        estimatedPoms: 2,
        completedPoms: 1,
        subTasks: [
          { id: 'sub-6', title: 'Implement sliding window rate limiting on Express', completed: true },
          { id: 'sub-7', title: 'Validate GitHub handles with official regex', completed: true },
          { id: 'sub-8', title: 'Apply strict CSP and OWASP defensive security headers', completed: false },
        ],
      },
      {
        id: 'task-pwa',
        title: 'PWA Mobile & Offline Enhancements',
        completed: false,
        estimatedPoms: 2,
        completedPoms: 0,
        subTasks: [
          { id: 'sub-9', title: 'Verify Service Worker precaching on iOS Safari', completed: false },
          { id: 'sub-10', title: 'Test standalone mobile launch and install banner', completed: false },
        ],
      },
    ],
  },
  {
    id: 'group-research',
    name: 'Deep Writing & Research',
    icon: '✍️',
    color: 'purple',
    tasks: [
      {
        id: 'task-paper',
        title: 'Circadian Biology Performance Paper',
        completed: false,
        estimatedPoms: 3,
        completedPoms: 0,
        subTasks: [
          { id: 'sub-11', title: 'Review Salk Institute ultradian rhythm literature', completed: false },
          { id: 'sub-12', title: 'Draft adenosine clearance & sleep pressure section', completed: false },
        ],
      },
    ],
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const defaultAppSettings: AppSettings = {
  focusDurationMin: 25,
  shortBreakDurationMin: 5,
  longBreakDurationMin: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundAlerts: true,
  soundVolume: 75,
  tickSound: false,

  dailyCaloriesGoal: 2400,
  dailyProteinGoal: 150,
  weeklyWorkoutGoal: 5,
  dailyMovementGoalMin: 45,
  dailyWaterGoalLiters: 2.5,

  timeFormat: '12h',
  compactView: false,
  themeAccent: 'cyan',
};

const SETTINGS_STORAGE_KEY = 'life_app_settings_v1';

export function playChimeAudio(volume = 0.5) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const vol = Math.max(0.01, Math.min(1, volume));

    const freqs = [523.25, 659.25, 783.99];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(vol * 0.18, now + idx * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.65);
    });
  } catch {
    // audio restricted
  }
}

const LOCAL_STORAGE_KEY = 'life_app_data_v2';
const TOKEN_KEY = 'life_auth_token';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedDate, setSelectedDate] = useState<number>(9); // Friday May 9
  const [moveSubTab, setMoveSubTab] = useState<'schedule' | 'exercises' | 'history'>('schedule');
  const [nourishSubTab, setNourishSubTab] = useState<'log' | 'insights'>('log');
  const [desktopNavCollapsed, setDesktopNavCollapsed] = useState<boolean>(false);

  // App Settings & Customization
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...defaultAppSettings, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return defaultAppSettings;
  });

  const [showFocusSettingsModal, setShowFocusSettingsModal] = useState<boolean>(false);

  // Pomodoro Task Groups & Subtasks State
  const [pomodoroGroups, setPomodoroGroups] = useState<PomodoroTaskGroup[]>(initialPomodoroGroups);
  const [activeFocusTarget, setActiveFocusTarget] = useState<{
    groupId: string;
    taskId: string;
    subTaskId?: string;
    label: string;
  } | null>({
    groupId: 'group-tech',
    taskId: 'task-security',
    subTaskId: 'sub-8',
    label: 'API Security > Apply strict CSP and OWASP headers',
  });

  // Workout state
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [activeMicroRecovery, setActiveMicroRecovery] = useState<boolean>(false);
  const [showCustomWorkoutBuilder, setShowCustomWorkoutBuilder] = useState<boolean>(false);
  const [completedWorkoutsCount, setCompletedWorkoutsCount] = useState<number>(3);
  const [totalMovementMinutes, setTotalMovementMinutes] = useState<number>(135);

  // Nutrition state
  const [meals, setMeals] = useState<MealItem[]>(initialMeals);
  const [showSnapMealModal, setShowSnapMealModal] = useState<boolean>(false);
  const [showManualMealModal, setShowManualMealModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState<boolean>(false);
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);

  // GitHub Auth & Cloud Sync
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [showGitHubAuthModal, setShowGitHubAuthModal] = useState<boolean>(false);

  // Focus state - initial timer: 18:42, cycle 2 of 4
  const [focusState, setFocusState] = useState<FocusSessionState>({
    title: 'Deep Work Sprint',
    currentCycle: 2,
    totalCycles: 4,
    secondsRemaining: 18 * 60 + 42,
    totalSeconds: 25 * 60,
    isRunning: true,
    mode: 'focus',
    ambientSound: 'none',
  });

  const isInitialMount = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Load cached state from LocalStorage on initial load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.meals && Array.isArray(parsed.meals)) setMeals(parsed.meals);
        if (typeof parsed.completedWorkoutsCount === 'number') {
          setCompletedWorkoutsCount(parsed.completedWorkoutsCount);
        }
        if (typeof parsed.totalMovementMinutes === 'number') {
          setTotalMovementMinutes(parsed.totalMovementMinutes);
        }
        if (parsed.lastSyncedAt) setLastSyncedAt(parsed.lastSyncedAt);
      }
    } catch (err) {
      console.warn('Could not read cached data:', err);
    }

    // Auto-connect with Hazem's real GitHub account out of the box!
    const initDefaultUser = () => {
      fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'hazem-alabiad',
          name: 'Hazem Alabiad',
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.token && data?.user) {
            localStorage.setItem(TOKEN_KEY, data.token);
            setUser(data.user);
            fetchServerData(data.token);
          }
        })
        .catch(() => {
          const defaultUser = {
            id: '16942677',
            login: 'hazem-alabiad',
            name: 'Hazem Alabiad',
            avatar_url: 'https://avatars.githubusercontent.com/u/16942677?v=4',
            email: 'eng.hazem.alabiad@gmail.com',
            bio: 'Software Engineer @ IBM · M.A. Computational Linguistics (LLMs & NLP)',
            public_repos: 50,
            connectedAt: new Date().toISOString(),
          };
          setUser(defaultUser);
        });
    };

    // Check if user has active session
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setUser(data.user);
            fetchServerData(token);
          } else {
            initDefaultUser();
          }
        })
        .catch(() => initDefaultUser());
    } else {
      initDefaultUser();
    }

    // Listen for Cmd+K or Ctrl+K shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 2. Fetch server data when authenticated
  const fetchServerData = async (token?: string) => {
    try {
      setSyncStatus('syncing');
      const authToken = token || localStorage.getItem(TOKEN_KEY) || '';
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/sync/data', { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          if (json.data.meals) setMeals(json.data.meals);
          if (typeof json.data.completedWorkoutsCount === 'number') {
            setCompletedWorkoutsCount(json.data.completedWorkoutsCount);
          }
          if (typeof json.data.totalMovementMinutes === 'number') {
            setTotalMovementMinutes(json.data.totalMovementMinutes);
          }
          if (json.lastSyncedAt) setLastSyncedAt(json.lastSyncedAt);
        }
        setSyncStatus('saved');
      } else {
        setSyncStatus('idle');
      }
    } catch {
      setSyncStatus('idle');
    }
  };

  // 3. Save data helper
  const syncDataToCloud = useCallback(async () => {
    setSyncStatus('syncing');
    const payload = {
      meals,
      completedWorkoutsCount,
      totalMovementMinutes,
      pomodoroGroups,
      activeTab,
      lastUpdated: new Date().toISOString(),
    };

    // Save locally
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          ...payload,
          lastSyncedAt: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    // Save to Supabase (if configured)
    if (isSupabaseConfigured()) {
      const userKey = user ? `user_${user.id}` : 'guest_local';
      syncUserDataToSupabase(userKey, payload);
    }

    // Save to Cloud Server
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/sync/data', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        setLastSyncedAt(json.lastSyncedAt || new Date().toISOString());
        setSyncStatus('saved');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('saved');
      }
    } catch {
      setSyncStatus('saved'); // Local saved is safe fallback
    }
  }, [meals, completedWorkoutsCount, totalMovementMinutes, pomodoroGroups, activeTab, user]);

  // 4. Auto-save debounce
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      syncDataToCloud();
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [meals, completedWorkoutsCount, totalMovementMinutes, syncDataToCloud]);

  // 5. GitHub OAuth popup listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      // Allow AI studio runtime origins, github.io, and localhost
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1') && !origin.endsWith('github.io')) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { user: authedUser, token } = event.data;
        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
        }
        if (authedUser) {
          setUser(authedUser);
        }
        setShowGitHubAuthModal(false);
        // Sync data right away
        fetchServerData(token);
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        console.error('OAuth error from popup:', event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 6. Connect via GitHub
  const loginWithGitHub = async () => {
    try {
      const res = await fetch('/api/auth/github/url');
      if (!res.ok) throw new Error('Could not get authorization URL');
      const data = await res.json();

      if (!data.configured) {
        // Open modal with instructions + 1-click test connect
        setShowGitHubAuthModal(true);
        return;
      }

      // Open OAuth provider URL directly in popup
      const authWindow = window.open(
        data.url,
        'github_oauth_popup',
        'width=600,height=720,status=no,toolbar=no,menubar=no'
      );

      if (!authWindow) {
        alert('Please allow popups to connect with your GitHub account.');
      }
    } catch (err) {
      console.error('Error starting GitHub OAuth:', err);
      setShowGitHubAuthModal(true);
    }
  };

  // 7. Connect via GitHub username handle (Safe on GitHub Pages & local server)
  const connectWithGitHubHandle = async (handle: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setSyncStatus('syncing');
      const cleanHandle = handle.trim().replace(/^@/, '');

      // 1. Fetch public profile directly from GitHub's public API (CORS-enabled, zero-backend required)
      let ghUser: any = null;
      try {
        const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanHandle)}`, {
          headers: { 'Accept': 'application/vnd.github.v3+json' },
        });

        if (ghRes.ok) {
          ghUser = await ghRes.json();
        } else if (ghRes.status === 404) {
          setSyncStatus('idle');
          return { success: false, error: `GitHub user @${cleanHandle} not found.` };
        }
      } catch (networkErr) {
        console.warn('Direct GitHub API fetch issue, falling back:', networkErr);
      }

      // If GitHub public API succeeds or fallback
      const sanitizedUser: GitHubUser = ghUser
        ? {
            id: String(ghUser.id),
            login: ghUser.login,
            name: ghUser.name || ghUser.login,
            avatar_url: ghUser.avatar_url,
            email: ghUser.email || `${ghUser.login}@users.noreply.github.com`,
            bio: ghUser.bio || 'Bio-rhythm tracking enthusiast',
            public_repos: ghUser.public_repos || 0,
            connectedAt: new Date().toISOString(),
          }
        : {
            id: `usr_${Date.now()}`,
            login: cleanHandle,
            name: cleanHandle,
            avatar_url: `https://avatars.githubusercontent.com/u/16942677?v=4`,
            email: `${cleanHandle}@users.noreply.github.com`,
            bio: 'Bio-rhythm tracking enthusiast',
            connectedAt: new Date().toISOString(),
          };

      const sessionToken = `gh_sess_user_${sanitizedUser.id}_${Date.now()}`;
      localStorage.setItem(TOKEN_KEY, sessionToken);
      setUser(sanitizedUser);
      setShowGitHubAuthModal(false);

      // Best effort backend sync (silently ignores if on static GitHub Pages)
      try {
        await fetch('/api/auth/github/handle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ handle: cleanHandle }),
        });
      } catch {
        // Backend not running (e.g. GitHub Pages), safe to ignore
      }

      await syncDataToCloud();
      return { success: true };
    } catch (err: any) {
      setSyncStatus('idle');
      return { success: false, error: err.message || 'Connection error' };
    }
  };

  // 8. Sign in directly with a real GitHub Personal Access Token
  const loginWithGitHubToken = async (token: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setSyncStatus('syncing');
      const cleanToken = token.trim();
      if (!cleanToken) return { success: false, error: 'Please enter a valid GitHub token' };

      const res = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!res.ok) {
        setSyncStatus('idle');
        return { success: false, error: 'Invalid GitHub token or expired permissions' };
      }

      const ghUser = await res.json();
      const sanitizedUser: GitHubUser = {
        id: String(ghUser.id),
        login: ghUser.login,
        name: ghUser.name || ghUser.login,
        avatar_url: ghUser.avatar_url,
        email: ghUser.email || `${ghUser.login}@users.noreply.github.com`,
        bio: ghUser.bio || 'Bio-rhythm tracking enthusiast',
        public_repos: ghUser.public_repos || 0,
        connectedAt: new Date().toISOString(),
      };

      localStorage.setItem(TOKEN_KEY, `gh_token_${sanitizedUser.id}`);
      setUser(sanitizedUser);
      setShowGitHubAuthModal(false);
      await syncDataToCloud();
      return { success: true };
    } catch (err: any) {
      setSyncStatus('idle');
      return { success: false, error: err.message || 'Error verifying GitHub token' };
    }
  };

  // 9. Demo / Test Instant Login
  const demoLoginWithGitHub = async () => {
    try {
      setSyncStatus('syncing');
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'hazem-alabiad',
          name: 'Hazem Alabiad',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(TOKEN_KEY, data.token);
        setUser(data.user);
        setShowGitHubAuthModal(false);
        await syncDataToCloud();
      }
    } catch (err) {
      console.error('Demo login error:', err);
    }
  };

  // 8. Logout
  const logoutGitHub = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // ignore
    }
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  // 9. Export Data as JSON file
  const exportDataAsJSON = () => {
    const backup = {
      app: 'Life App - Bio-Rhythm OS',
      version: 2,
      exportedAt: new Date().toISOString(),
      user: user || { mode: 'Guest' },
      data: {
        meals,
        completedWorkoutsCount,
        totalMovementMinutes,
      },
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-app-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 10. Clear data reset
  const clearDataAndReset = () => {
    if (window.confirm('Reset all tracked rhythm data to defaults?')) {
      setMeals(initialMeals);
      setCompletedWorkoutsCount(3);
      setTotalMovementMinutes(135);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      syncDataToCloud();
    }
  };

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save settings:', err);
      }
      return updated;
    });

    if (newSettings.focusDurationMin !== undefined) {
      setFocusState((prev) => {
        if (prev.mode === 'focus' && !prev.isRunning) {
          const secs = newSettings.focusDurationMin! * 60;
          return { ...prev, secondsRemaining: secs, totalSeconds: secs };
        }
        return prev;
      });
    }
  }, []);

  const resetSettingsToDefault = useCallback(() => {
    setSettings(defaultAppSettings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultAppSettings));
    } catch {
      // ignore
    }
    const secs = defaultAppSettings.focusDurationMin * 60;
    setFocusState((prev) => ({
      ...prev,
      secondsRemaining: secs,
      totalSeconds: secs,
      isRunning: false,
    }));
  }, []);

  const playChime = useCallback(() => {
    playChimeAudio(settings.soundVolume / 100);
  }, [settings.soundVolume]);

  // Ticking timer effect
  useEffect(() => {
    if (!focusState.isRunning) return;

    const interval = setInterval(() => {
      setFocusState((prev) => {
        if (prev.secondsRemaining <= 1) {
          if (settings.soundAlerts) {
            playChimeAudio(settings.soundVolume / 100);
          }

          if (prev.mode === 'focus') {
            const isLong = prev.currentCycle % settings.longBreakInterval === 0;
            const breakMode = isLong ? 'deep_break' : 'posture_break';
            const breakSecs = (isLong ? settings.longBreakDurationMin : settings.shortBreakDurationMin) * 60;
            return {
              ...prev,
              mode: breakMode,
              secondsRemaining: breakSecs,
              totalSeconds: breakSecs,
              isRunning: settings.autoStartBreaks,
            };
          } else {
            const nextCycle = prev.currentCycle >= prev.totalCycles ? 1 : prev.currentCycle + 1;
            const focusSecs = settings.focusDurationMin * 60;
            return {
              ...prev,
              mode: 'focus',
              currentCycle: nextCycle,
              secondsRemaining: focusSecs,
              totalSeconds: focusSecs,
              isRunning: settings.autoStartFocus,
            };
          }
        }
        return {
          ...prev,
          secondsRemaining: prev.secondsRemaining - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [focusState.isRunning, settings]);

  const toggleFocusTimer = () => {
    setFocusState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const resetFocusTimer = () => {
    const total =
      focusState.mode === 'focus'
        ? settings.focusDurationMin * 60
        : focusState.mode === 'posture_break'
        ? settings.shortBreakDurationMin * 60
        : settings.longBreakDurationMin * 60;
    setFocusState((prev) => ({
      ...prev,
      secondsRemaining: total,
      totalSeconds: total,
      isRunning: false,
    }));
  };

  const setFocusMode = (mode: 'focus' | 'posture_break' | 'deep_break') => {
    const total =
      mode === 'focus'
        ? settings.focusDurationMin * 60
        : mode === 'posture_break'
        ? settings.shortBreakDurationMin * 60
        : settings.longBreakDurationMin * 60;
    setFocusState((prev) => ({
      ...prev,
      mode,
      secondsRemaining: total,
      totalSeconds: total,
      isRunning: true,
    }));
  };

  const setAmbientSound = (sound: 'none' | 'rain' | 'binaural' | 'forest' | 'lofi') => {
    setFocusState((prev) => ({ ...prev, ambientSound: sound }));
  };

  const startWorkout = (workout?: WorkoutSession) => {
    setActiveWorkout(workout || defaultMainWorkout);
  };

  const endWorkout = () => {
    if (activeWorkout) {
      setCompletedWorkoutsCount((prev) => Math.min(prev + 1, 7));
      setTotalMovementMinutes((prev) => prev + (activeWorkout.durationMin || 35));
    }
    setActiveWorkout(null);
  };

  const openMicroRecovery = () => setActiveMicroRecovery(true);
  const closeMicroRecovery = () => setActiveMicroRecovery(false);

  const addMeal = (mealData: Omit<MealItem, 'id'>) => {
    const newMeal: MealItem = {
      ...mealData,
      id: `meal-${Date.now()}`,
    };
    setMeals((prev) => [newMeal, ...prev]);
  };

  // -------------------------------------------------------------
  // Pomodoro Task Groups & Subtasks Handlers
  // -------------------------------------------------------------
  const toggleTaskCompletion = (groupId: string, taskId: string) => {
    setPomodoroGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          tasks: group.tasks.map((task) => {
            if (task.id !== taskId) return task;
            const newCompleted = !task.completed;
            return {
              ...task,
              completed: newCompleted,
              subTasks: task.subTasks.map((st) => ({ ...st, completed: newCompleted })),
            };
          }),
        };
      })
    );
  };

  const toggleSubTaskCompletion = (groupId: string, taskId: string, subTaskId: string) => {
    setPomodoroGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          tasks: group.tasks.map((task) => {
            if (task.id !== taskId) return task;
            const updatedSubTasks = task.subTasks.map((st) =>
              st.id === subTaskId ? { ...st, completed: !st.completed } : st
            );
            const allDone = updatedSubTasks.length > 0 && updatedSubTasks.every((st) => st.completed);
            return {
              ...task,
              subTasks: updatedSubTasks,
              completed: allDone,
            };
          }),
        };
      })
    );
  };

  const addPomodoroTask = (groupId: string, title: string, estimatedPoms: number = 1) => {
    if (!title.trim()) return;
    const newTask: PomodoroTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      completed: false,
      estimatedPoms,
      completedPoms: 0,
      subTasks: [],
    };
    setPomodoroGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, tasks: [...group.tasks, newTask] } : group
      )
    );
  };

  const addPomodoroSubTask = (groupId: string, taskId: string, title: string) => {
    if (!title.trim()) return;
    const newSubTask: PomodoroSubTask = {
      id: `sub-${Date.now()}`,
      title: title.trim(),
      completed: false,
    };
    setPomodoroGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          tasks: group.tasks.map((task) => {
            if (task.id !== taskId) return task;
            return {
              ...task,
              subTasks: [...task.subTasks, newSubTask],
              completed: false,
            };
          }),
        };
      })
    );
  };

  const addPomodoroGroup = (name: string, icon: string, color: PomodoroTaskGroup['color']) => {
    if (!name.trim()) return;
    const newGroup: PomodoroTaskGroup = {
      id: `group-${Date.now()}`,
      name: name.trim(),
      icon: icon || '🎯',
      color: color || 'cyan',
      tasks: [],
    };
    setPomodoroGroups((prev) => [...prev, newGroup]);
  };

  const deletePomodoroTask = (groupId: string, taskId: string) => {
    setPomodoroGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, tasks: group.tasks.filter((t) => t.id !== taskId) }
          : group
      )
    );
  };

  const deletePomodoroSubTask = (groupId: string, taskId: string, subTaskId: string) => {
    setPomodoroGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          tasks: group.tasks.map((task) =>
            task.id === taskId
              ? { ...task, subTasks: task.subTasks.filter((st) => st.id !== subTaskId) }
              : task
          ),
        };
      })
    );
  };

  const deletePomodoroGroup = (groupId: string) => {
    setPomodoroGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        focusState,
        toggleFocusTimer,
        resetFocusTimer,
        setFocusMode,
        setAmbientSound,
        pomodoroGroups,
        activeFocusTarget,
        setActiveFocusTarget,
        toggleTaskCompletion,
        toggleSubTaskCompletion,
        addPomodoroTask,
        addPomodoroSubTask,
        addPomodoroGroup,
        deletePomodoroTask,
        deletePomodoroSubTask,
        deletePomodoroGroup,
        activeWorkout,
        startWorkout,
        endWorkout,
        activeMicroRecovery,
        openMicroRecovery,
        closeMicroRecovery,
        showCustomWorkoutBuilder,
        setShowCustomWorkoutBuilder,
        selectedDate,
        setSelectedDate,
        moveSubTab,
        setMoveSubTab,
        completedWorkoutsCount,
        totalMovementMinutes,
        nourishSubTab,
        setNourishSubTab,
        meals,
        addMeal,
        showSnapMealModal,
        setShowSnapMealModal,
        showManualMealModal,
        setShowManualMealModal,
        showProfileModal,
        setShowProfileModal,
        showSettingsModal,
        setShowSettingsModal,
        settings,
        updateSettings,
        resetSettingsToDefault,
        showFocusSettingsModal,
        setShowFocusSettingsModal,
        playChime,
        showSupabaseModal,
        setShowSupabaseModal,
        showCommandPalette,
        setShowCommandPalette,
        user,
        isAuthenticated: Boolean(user),
        syncStatus,
        lastSyncedAt,
        showGitHubAuthModal,
        setShowGitHubAuthModal,
        loginWithGitHub,
        loginWithGitHubToken,
        connectWithGitHubHandle,
        demoLoginWithGitHub,
        logoutGitHub,
        syncDataToCloud,
        exportDataAsJSON,
        clearDataAndReset,
        desktopNavCollapsed,
        setDesktopNavCollapsed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
