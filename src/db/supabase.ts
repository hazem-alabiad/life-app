import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase project credentials for Life App
export const DEFAULT_SUPABASE_URL = 'https://ptbhhytyadpobozurxsk.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_NVwQ6CYVuoNa0spnu25eMQ_ocPAVr7s';

// Read from client environment, localStorage settings override, or project defaults
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('supabase_project_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('supabase_anon_key') : null;

  const url = localUrl || envUrl || DEFAULT_SUPABASE_URL;
  const key = localKey || envKey || DEFAULT_SUPABASE_KEY;

  return { url, key, isConfigured: Boolean(url && key) };
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!clientInstance) {
    try {
      clientInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return clientInstance;
};

export const resetSupabaseClient = () => {
  clientInstance = null;
};

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseConfig().isConfigured;
};

// SQL Setup script for users to copy/paste directly into Supabase SQL Editor
export const SUPABASE_SETUP_SQL = `-- 1. Life App PostgreSQL Database Schema
CREATE TABLE IF NOT EXISTS public.user_sync (
  id TEXT PRIMARY KEY,
  user_key TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Meals Log Table
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

-- 5. Open Public Publishable Access Policies (or bind with Supabase Auth)
CREATE POLICY "Allow public read/write sync" ON public.user_sync FOR ALL USING (true);
CREATE POLICY "Allow public read/write meals" ON public.meals FOR ALL USING (true);
CREATE POLICY "Allow public read/write pomodoro_groups" ON public.pomodoro_groups FOR ALL USING (true);
`;

// Direct sync helpers with Supabase
export async function syncUserDataToSupabase(userKey: string, payload: any): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client not configured' };
  }

  try {
    const { error } = await client
      .from('user_sync')
      .upsert({
        id: userKey,
        user_key: userKey,
        data: payload,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.warn('Supabase sync error (table may need to be created):', err);
    return { success: false, error: err.message || 'Sync failed' };
  }
}

export async function fetchUserDataFromSupabase(userKey: string): Promise<any | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('user_sync')
      .select('data')
      .eq('id', userKey)
      .single();

    if (error || !data) return null;
    return data.data;
  } catch (err) {
    console.warn('Supabase fetch error:', err);
    return null;
  }
}
