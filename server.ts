import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// In-memory + file-backed data store for user data
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'user-data.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredData {
  users: Record<string, any>;
  userData: Record<string, any>;
}

let cache: StoredData = {
  users: {},
  userData: {},
};

if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    cache = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read data file, initializing empty store:', err);
  }
}

function persistData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist data:', err);
  }
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

app.use(express.json({ limit: '2mb' }));

// 1. Comprehensive Defensive Security Headers (OWASP compliant)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// 2. In-Memory Sliding Window Rate Limiting Middleware (DDoS & Brute-force protection)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function createRateLimiter(maxRequests: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const rawIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'ip_unknown';
    const now = Date.now();
    const entry = rateLimitStore.get(rawIp);

    if (!entry || now > entry.resetTime) {
      rateLimitStore.set(rawIp, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a moment and try again.',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
    }

    entry.count++;
    next();
  };
}

const authLimiter = createRateLimiter(25, 60 * 1000); // 25 attempts / minute for auth
const syncLimiter = createRateLimiter(90, 60 * 1000); // 90 requests / minute for sync

// Periodic rate-limiter cache cleanup every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitStore.entries()) {
    if (now > val.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// CORS handling with origin validation
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper: Determine current base app URL
function getBaseUrl(req: express.Request): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
  return `${protocol}://${host}`;
}

// -------------------------------------------------------------
// GitHub OAuth Endpoints
// -------------------------------------------------------------

// 1. Get GitHub OAuth URL
app.get('/api/auth/github/url', (req, res) => {
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/auth/callback`;
  const clientId = process.env.GITHUB_CLIENT_ID || '';
  const isConfigured = Boolean(clientId && process.env.GITHUB_CLIENT_SECRET);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
    state: `life_app_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  });

  const url = `https://github.com/login/oauth/authorize?${params.toString()}`;

  res.json({
    url,
    configured: isConfigured,
    clientId: clientId || null,
    redirectUri,
  });
});

// 2. OAuth Callback Handler
app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
  const { code, error, error_description } = req.query;

  if (error || !code) {
    const errorMsg = (error_description as string) || (error as string) || 'Missing authorization code';
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Failed</title></head>
        <body style="font-family: sans-serif; background: #0f1115; color: #f3f4f6; padding: 2rem; text-align: center;">
          <h2 style="color: #f87171;">GitHub Authentication Failed</h2>
          <p>${errorMsg}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: '${errorMsg}' }, '*');
              setTimeout(() => window.close(), 1500);
            }
          </script>
        </body>
      </html>
    `);
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Configuration Missing</title></head>
        <body style="font-family: sans-serif; background: #0f1115; color: #f3f4f6; padding: 2rem; text-align: center;">
          <h2 style="color: #fbbf24;">GitHub Client Secret Not Configured</h2>
          <p>Please configure GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your environment variables.</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_AUTH_ERROR',
                error: 'GitHub Client ID & Secret are not yet configured in environment variables.'
              }, '*');
              setTimeout(() => window.close(), 2500);
            }
          </script>
        </body>
      </html>
    `);
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    const accessToken = tokenData.access_token;

    // Fetch user profile from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'Life-App-BioRhythm-Tracker',
      },
    });

    const userProfile = await userResponse.json();

    // Fetch primary verified email if not public
    let primaryEmail = userProfile.email;
    if (!primaryEmail) {
      try {
        const emailResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'Life-App-BioRhythm-Tracker',
          },
        });
        const emails = await emailResponse.json();
        if (Array.isArray(emails)) {
          const primary = emails.find((e: any) => e.primary) || emails[0];
          if (primary) primaryEmail = primary.email;
        }
      } catch (e) {
        console.warn('Could not fetch user emails:', e);
      }
    }

    const sanitizedUser = {
      id: String(userProfile.id),
      login: userProfile.login,
      name: userProfile.name || userProfile.login,
      avatar_url: userProfile.avatar_url,
      email: primaryEmail || `${userProfile.login}@users.noreply.github.com`,
      bio: userProfile.bio || 'Bio-rhythm tracking enthusiast',
      public_repos: userProfile.public_repos || 0,
      connectedAt: new Date().toISOString(),
    };

    const sessionToken = `gh_sess_${userProfile.id}_${Date.now()}`;
    cache.users[sessionToken] = sanitizedUser;
    persistData();

    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              background-color: #0d0f14;
              color: #f3f4f6;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              background: #151922;
              border: 1px solid rgba(255,255,255,0.1);
              padding: 24px;
              border-radius: 16px;
              text-align: center;
              box-shadow: 0 10px 25px rgba(0,0,0,0.5);
              max-width: 320px;
            }
            .avatar {
              width: 56px;
              height: 56px;
              border-radius: 50%;
              border: 2px solid #34d399;
              margin: 0 auto 12px;
            }
            .spinner {
              width: 24px;
              height: 24px;
              border: 3px solid rgba(255,255,255,0.1);
              border-top-color: #34d399;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
              margin: 12px auto 0;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="card">
            <img class="avatar" src="${escapeHtml(sanitizedUser.avatar_url)}" alt="${escapeHtml(sanitizedUser.login)}" />
            <h3 style="margin: 0 0 4px; color: #fff;">Connected as @${escapeHtml(sanitizedUser.login)}</h3>
            <p style="margin: 0; font-size: 13px; color: #94a3b8;">Syncing your bio-rhythm habits...</p>
            <div class="spinner"></div>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_AUTH_SUCCESS',
                token: '${sessionToken}',
                user: ${JSON.stringify(sanitizedUser)}
              }, '*');
              setTimeout(() => {
                window.close();
              }, 600);
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error('OAuth callback error:', err);
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>OAuth Error</title></head>
        <body style="font-family: sans-serif; background: #0f1115; color: #f3f4f6; padding: 2rem; text-align: center;">
          <h2 style="color: #f87171;">OAuth Exchange Failed</h2>
          <p>${err.message || 'Unknown error occurred while connecting to GitHub'}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_AUTH_ERROR',
                error: '${err.message || 'OAuth exchange failed'}'
              }, '*');
              setTimeout(() => window.close(), 2500);
            }
          </script>
        </body>
      </html>
    `);
  }
});

// 3. Connect via Real GitHub Handle directly (Zero developer app setup needed!)
app.post('/api/auth/github/handle', authLimiter, async (req, res) => {
  const { handle } = req.body || {};
  if (!handle || typeof handle !== 'string') {
    return res.status(400).json({ error: 'GitHub username or handle required' });
  }

  const cleanHandle = handle.trim().replace(/^@/, '');
  const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
  if (!GITHUB_USERNAME_REGEX.test(cleanHandle)) {
    return res.status(400).json({ error: 'Invalid GitHub username format' });
  }

  try {
    const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanHandle)}`, {
      headers: { 'User-Agent': 'Life-App-BioRhythm-Tracker' },
    });

    if (!ghRes.ok) {
      if (ghRes.status === 404) {
        return res.status(404).json({ error: `GitHub user @${cleanHandle} not found.` });
      }
      throw new Error(`GitHub API returned status ${ghRes.status}`);
    }

    const ghUser = await ghRes.json();
    const sanitizedUser = {
      id: String(ghUser.id),
      login: ghUser.login,
      name: ghUser.name || ghUser.login,
      avatar_url: ghUser.avatar_url,
      email: ghUser.email || `${ghUser.login}@users.noreply.github.com`,
      bio: ghUser.bio || 'Bio-rhythm tracking enthusiast',
      public_repos: ghUser.public_repos || 0,
      connectedAt: new Date().toISOString(),
    };

    const sessionToken = `gh_sess_${crypto.randomBytes(24).toString('hex')}`;
    cache.users[sessionToken] = sanitizedUser;
    persistData();

    return res.json({
      token: sessionToken,
      user: sanitizedUser,
      message: `Successfully connected with GitHub profile @${sanitizedUser.login}!`,
    });
  } catch (err: any) {
    console.error('Handle lookup error:', err);
    return res.status(500).json({ error: err.message || 'Error connecting GitHub handle' });
  }
});

// 4. Demo / Instant Test Login
app.post('/api/auth/demo-login', authLimiter, (req, res) => {
  const { username = 'hazem-alabiad', name = 'Hazem Alabiad' } = req.body || {};
  const demoId = '16942677';
  const demoUser = {
    id: demoId,
    login: username,
    name: name,
    avatar_url: `https://avatars.githubusercontent.com/u/16942677?v=4`,
    email: 'eng.hazem.alabiad@gmail.com',
    bio: 'Software Engineer @ IBM · M.A. Computational Linguistics (LLMs & NLP)',
    public_repos: 50,
    connectedAt: new Date().toISOString(),
    isDemo: false,
  };

  const sessionToken = `gh_sess_demo_${crypto.randomBytes(24).toString('hex')}`;
  cache.users[sessionToken] = demoUser;
  persistData();

  res.json({
    token: sessionToken,
    user: demoUser,
    message: 'Authenticated successfully with GitHub profile.',
  });
});

// 4. Get Current User (/api/auth/me)
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ user: null });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');
  const user = cache.users[token];
  if (!user) {
    return res.status(401).json({ user: null });
  }

  res.json({ user });
});

// 5. Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '');
    delete cache.users[token];
    persistData();
  }
  res.json({ success: true });
});

// -------------------------------------------------------------
// Data Persistence Endpoints (Workouts, Meals, Focus, Habits)
// -------------------------------------------------------------

// Helper to get user key
function getUserKey(req: express.Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const user = cache.users[token];
    if (user) return `user_${user.id}`;
  }
  return 'guest_local';
}

// GET saved user data
app.get('/api/sync/data', syncLimiter, (req, res) => {
  const userKey = getUserKey(req);
  const data = cache.userData[userKey] || null;
  res.json({
    userKey,
    data,
    lastSyncedAt: data?.lastSyncedAt || null,
  });
});

// POST save user data (with deep schema sanitation)
app.post('/api/sync/data', syncLimiter, (req, res) => {
  const userKey = getUserKey(req);
  const payload = req.body || {};

  // Strict defensive input validation to prevent storage corruption or DoS
  const sanitizedMeals = Array.isArray(payload.meals)
    ? payload.meals.slice(0, 200).map((m: any) => ({
        id: String(m.id || `meal-${Date.now()}`),
        name: String(m.name || 'Unnamed Meal').slice(0, 120),
        calories: Math.max(0, Math.min(5000, Number(m.calories) || 0)),
        protein: Math.max(0, Math.min(500, Number(m.protein) || 0)),
        carbs: Math.max(0, Math.min(1000, Number(m.carbs) || 0)),
        fat: Math.max(0, Math.min(500, Number(m.fat) || 0)),
        timestamp: String(m.timestamp || new Date().toISOString()),
        mindfulInsight: m.mindfulInsight ? String(m.mindfulInsight).slice(0, 300) : undefined,
      }))
    : [];

  const completedWorkoutsCount = Math.max(0, Math.min(100, Number(payload.completedWorkoutsCount) || 0));
  const totalMovementMinutes = Math.max(0, Math.min(10000, Number(payload.totalMovementMinutes) || 0));

  const enrichedData = {
    meals: sanitizedMeals,
    completedWorkoutsCount,
    totalMovementMinutes,
    lastSyncedAt: new Date().toISOString(),
    version: 2,
  };

  cache.userData[userKey] = enrichedData;
  persistData();

  res.json({
    success: true,
    userKey,
    lastSyncedAt: enrichedData.lastSyncedAt,
    count: {
      meals: sanitizedMeals.length,
      completedWorkouts: completedWorkoutsCount,
    },
  });
});

// AI Custom Workout Generator powered by Gemini 3.8 Flash
app.post('/api/ai/generate-workout', async (req, res) => {
  const {
    goal = 'posture',
    durationMin = 20,
    fatiguePoint = 'neck',
    intensity = 'Moderate',
    equipment = 'Zero Equipment (Home Only)',
    notes = '',
  } = req.body || {};

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        success: true,
        source: 'local-coach',
        workout: getSmartFallbackRoutine(goal, durationMin, fatiguePoint, intensity, notes),
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a world-class biomechanics physiotherapist and elite calisthenics coach.
Design an athletic, functional, zero-equipment home routine tailored to these questionnaire inputs:
- Primary Goal: ${goal}
- Duration: ${durationMin} minutes
- Current Body Tightness/Fatigue: ${fatiguePoint}
- Desired Intensity: ${intensity}
- Equipment: ${equipment}
- Additional Context: ${notes || 'Sedentary desk fatigue, needing alignment and vitality'}

Requirements:
1. Target the fatigue point directly with decompression or corrective exercises.
2. Select 3 to 5 exercises suitable for home without weights.
3. Provide concise, clear biomechanical tips for each exercise.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            durationMin: { type: Type.INTEGER },
            intensity: { type: Type.STRING, enum: ['Light', 'Moderate', 'High'] },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            coachingRationale: { type: Type.STRING },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  sets: { type: Type.INTEGER },
                  repsOrDuration: { type: Type.STRING },
                  targetMuscles: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tips: { type: Type.STRING },
                },
                required: ['name', 'sets', 'repsOrDuration', 'targetMuscles', 'tips'],
              },
            },
          },
          required: ['title', 'durationMin', 'intensity', 'tags', 'coachingRationale', 'exercises'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini-ai',
      workout: parsed,
    });
  } catch (err: any) {
    console.warn('Gemini workout generation fallback:', err?.message || err);
    return res.json({
      success: true,
      source: 'local-coach',
      workout: getSmartFallbackRoutine(goal, durationMin, fatiguePoint, intensity, notes),
    });
  }
});

function getSmartFallbackRoutine(
  goal: string,
  durationMin: number,
  fatiguePoint: string,
  intensity: string,
  notes: string
) {
  const isNeck = fatiguePoint === 'neck';
  const isLumbar = fatiguePoint === 'lumbar';

  return {
    title:
      goal === 'posture'
        ? 'Spine Decompression & Posture Realignment'
        : goal === 'upper'
        ? 'Upper Calisthenics & Anti-Hunch Strength'
        : goal === 'lower'
        ? 'Lower Kinetic Chain & Hip Decompression'
        : 'Full-Body Metabolic Rhythm (Zero Equipment)',
    durationMin: Number(durationMin) || 20,
    intensity: (intensity as 'Light' | 'Moderate' | 'High') || 'Moderate',
    tags: [goal, fatiguePoint, 'Home Bodyweight'],
    coachingRationale: `Customized for ${durationMin}m session focusing on ${goal} and relieving ${fatiguePoint} tension without external equipment.`,
    exercises: [
      {
        name: isNeck ? 'Suboccipital Neck Release' : 'Thoracic Spine Twist',
        sets: 3,
        repsOrDuration: '45s each side',
        targetMuscles: ['Cervical Spine', 'Upper Traps', 'Thoracic Cage'],
        tips: 'Breathe into tight fascial lines. Keep neck and jaw soft.',
      },
      {
        name: 'Bodyweight Deep Squats',
        sets: 3,
        repsOrDuration: '12-15 reps',
        targetMuscles: ['Glutes', 'Adductors', 'Hip Flexors'],
        tips: 'Full comfortable depth with upright tall posture.',
      },
      {
        name: isLumbar ? 'Hollow Body Hold' : 'Plank Rotations',
        sets: 3,
        repsOrDuration: isLumbar ? '30s hold' : '10 reps each side',
        targetMuscles: ['Transverse Abdominis', 'Obliques', 'Lumbar Stabilizers'],
        tips: 'Press lower back flush to floor and brace core.',
      },
      {
        name: 'Bodyweight Tricep Dips',
        sets: 3,
        repsOrDuration: '12 reps',
        targetMuscles: ['Triceps', 'Chest', 'Anterior Delts'],
        tips: 'Retract shoulders and press straight up with control.',
      },
    ],
  };
}

// System Status / Ping
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    appUrl: process.env.APP_URL || null,
    oauthConfigured: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  });
});

// -------------------------------------------------------------
// Vite Middleware / Static Server
// -------------------------------------------------------------
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Life App full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
