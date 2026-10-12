# 🌊 Life App — Bio-Rhythm Operating System & Habit Tracker

> **Harmonizing movement, deep focus sprints, mindful chrononutrition, and serverless PostgreSQL into an unshakeable daily rhythm.**

Life App is a full-stack, desktop & mobile Progressive Web App (PWA) designed for knowledge workers, developers, and high-performance individuals. It interleaves 25-minute ultradian focus intervals, 5-minute desk posture resets, zero-equipment home calisthenics, and mindful chrononutrition into a unified bio-rhythm — backed by **Supabase PostgreSQL** cloud storage.

---

## ⚡ Core Features & Modules

### 1. 🗄️ Supabase PostgreSQL Cloud Database
- **Serverless PostgreSQL Engine**: Native integration with Supabase (`@supabase/supabase-js`) storing meals, workouts, and pomodoro task hierarchies.
- **Client-Safe Authentication**: Protected by Row Level Security (RLS) using modern Supabase Publishable Keys (`sb_publishable_...`).
- **Zero-Friction Fallback**: Offline-first architecture seamlessly falls back to `localStorage` and local server stores if network connectivity changes.
- **In-App Connection Manager**: Configure project URL, test pings, and access 1-click SQL table creation scripts right from **Settings** or `⌘K`.

### 2. 🎯 Ultradian Focus Cockpit with Grouped Lists & Subtasks
- **Context Task Lists**: Organize sprints into structured project lists (e.g. `📅 Daily Routines`, `⚡ Tech & Architecture`, `✍️ Deep Writing & Research`).
- **Nested Subtasks & Progress Tracking**: Check off subtasks with real-time completion percentages (`3/5 subtasks • 60%`).
- **Active Focus Target Binding**: Click the **🎯 Target** icon on any task or subtask to lock it as your live Pomodoro sprint objective. The active dial banner displays:  
  `🎯 CURRENT TIMER FOCUS TARGET: Tech & Architecture > API Security > Apply strict CSP headers`
- **🍅 Pomodoro Counters**: Tracks estimated vs. completed Pomodoros per task.
- **Synthesized Ambient Bio-Acoustics**: Native Web Audio API generators for **Binaural Beats (144 Hz)** and **Pink Flow / Rain** to deepen theta-wave focus.

### 3. 🤸 Movement & Home Workout Studio
- **Questionnaire-Based Routine Builder (100% Home, Zero Equipment)**:
  - Generates custom routines based on objective, time available (10m, 15m, 25m, 35m), desk fatigue area (tech neck, tight hips, lumbar spine), and intensity level.
  - Generates bespoke zero-equipment calisthenics circuits (*Air Squats, Thoracic Twists, Hollow Holds, Plank Rotations, Tricep Dips, Neck Decompressions*).
- **Movement Tutorial Visual Guides**: Every stretch and exercise includes instructional demonstration photos, breathing cadences (`Inhale 4s • Exhale 6s`), and physical therapy form cues.
- **5-Minute Desk Mobility Breaks**: Micro-recovery decompression to undo hours of sedentary posture.

### 4. 🥗 Mindful Chrononutrition & Macros
- **Daily Metabolic Energy Budget**: Target vs. logged caloric progress bar with real-time percentage indicators.
- **Macro Split Monitoring**: Precise gram counters and progress tracks for Protein, Complex Carbs, and Healthy Fats.
- **Snap Meal & Manual Logging**: Photo-assisted meal logging with mindful bio-feedback insights.
- **Hydration Tracking**: 3.0L daily hydration goal with 250ml/500ml quick logging buttons.

### 5. 📱 Progressive Web App (PWA) Certified
- **Installable Native Experience**: Add to home screen on iOS (Safari) and Android (Chrome) without browser navigation bars.
- **Offline Precaching**: Workbox service worker precaches application assets for instant offline execution.
- **Responsive Adaptive Layout**: Smooth transition from mobile navigation bar to full-bleed desktop sidebar.

---

## 🗄️ Supabase PostgreSQL Setup Guide

### 1. Environment Configuration
Add your Supabase credentials to `.env` or set them in the app's **Settings > Supabase PostgreSQL Cloud DB**:

```env
# Supabase Project URL
VITE_SUPABASE_URL="https://ptbhhytyadpobozurxsk.supabase.co"

# Supabase Publishable / Anon Public Key (safe for client use with RLS)
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_NVwQ6CYVuoNa0spnu25eMQ_ocPAVr7s"
```

### 2. SQL Schema Setup
In your [Supabase Dashboard](https://supabase.com/dashboard) > **SQL Editor**, run the following script to create the tables:

```sql
-- 1. User Sync Persistence Table
CREATE TABLE IF NOT EXISTS public.user_sync (
  id TEXT PRIMARY KEY,
  user_key TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Meals Table
CREATE TABLE IF NOT EXISTS public.meals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  calories INTEGER DEFAULT 0,
  protein INTEGER DEFAULT 0,
  carbs INTEGER DEFAULT 0,
  fat INTEGER DEFAULT 0,
  mindful_insight TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Pomodoro Task Groups Table
CREATE TABLE IF NOT EXISTS public.pomodoro_groups (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT 'cyan',
  tasks JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.user_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_groups ENABLE ROW LEVEL SECURITY;

-- 5. Open Public Policies
CREATE POLICY "Allow public read/write sync" ON public.user_sync FOR ALL USING (true);
CREATE POLICY "Allow public read/write meals" ON public.meals FOR ALL USING (true);
CREATE POLICY "Allow public read/write pomodoro_groups" ON public.pomodoro_groups FOR ALL USING (true);
```

---

## 🚀 Getting Started & Local Development

### 1. Clone & Install
```bash
git clone https://github.com/hazem-alabiad/life-app.git
cd life-app
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 3. Build & Test Production Static Bundle
```bash
npm run build
npm run preview
```

---

## 🌐 Deployments & Links
- **GitHub Repository**: [https://github.com/hazem-alabiad/life-app](https://github.com/hazem-alabiad/life-app)
- **Live GitHub Pages URL**: [https://hazem-alabiad.github.io/life-app/](https://hazem-alabiad.github.io/life-app/)
