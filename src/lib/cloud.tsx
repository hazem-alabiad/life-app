import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { AppState } from '../types';

/**
 * Cloud sync (GitHub sign-in only), kept as a thin mirror over the local-first
 * store: localStorage stays the source of truth, this module uploads and
 * downloads whole-state snapshots. If the project is not configured — i.e. the
 * env vars are missing — everything degrades to "signed out, sync off" and the
 * app behaves exactly as before.
 *
 * The Supabase SDK is loaded through a dynamic import: the main bundle must
 * stay under the 400 KiB CI budget, and cloud is an opt-in feature that most
 * loads never touch. The chunk is fetched on first cloud use, or never.
 *
 * Conflict policy: last writer wins per snapshot. The app is effectively
 * single-user, so mid-air collisions are rare and a snapshot merge would be
 * over-engineering; the local `savedAt` stamp vs the remote `updated_at`
 * makes "which copy is newer" unambiguous.
 */

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const cloudConfigured = Boolean(URL && ANON);

/** Lazily resolved singleton; null means cloud is not configured. */
let clientPromise: Promise<SupabaseClient | null> | null = null;

function getClient(): Promise<SupabaseClient | null> {
  if (!cloudConfigured) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(URL!, ANON!, {
        auth: {
          // The session outlives the tab; GitHub OAuth only re-prompts when it
          // truly expires. localStorage is the documented default in browsers.
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
        },
      }),
    );
  }
  return clientPromise;
}

export interface CloudUser {
  id: string;
  /** GitHub login shown in the UI; falls back to the email claim. */
  name: string;
}

export type SyncStatus =
  | 'off' // no cloud config or signed out
  | 'idle' // signed in, nothing pending
  | 'syncing'
  | 'error';

interface CloudValue {
  user: CloudUser | null;
  status: SyncStatus;
  errorMessage: string | null;
  /** When cloud is simply not configured in this deployment. */
  available: boolean;
  signIn: () => void;
  signOut: () => Promise<void>;
}

const CLOUD_DISABLED: CloudValue = {
  user: null,
  status: 'off',
  errorMessage: null,
  available: false,
  signIn: () => {},
  signOut: async () => {},
};

const CloudContext = createContext<CloudValue>(CLOUD_DISABLED);

/** Marker stored with the snapshot so we can distinguish "no account" from
 * "account exists but this device has never pulled". */
const SYNC_META_KEY = 'life-app/cloud-sync/v1';

function readLocalMeta(): { lastPulledAt: string | null } {
  try {
    const raw = localStorage.getItem(SYNC_META_KEY);
    return raw ? (JSON.parse(raw) as { lastPulledAt: string | null }) : { lastPulledAt: null };
  } catch {
    return { lastPulledAt: null };
  }
}

function writeLocalMeta(meta: { lastPulledAt: string | null }) {
  try {
    localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
  } catch {
    // Same guard as the main store: never crash over storage.
  }
}

export function CloudProvider({
  children,
  getLocalState,
  setLocalState,
}: {
  children: ReactNode;
  /** Current reducer state, read lazily only when an upload is needed. */
  getLocalState: () => AppState;
  /** Replaces the reducer state with a pulled snapshot. */
  setLocalState: (state: AppState) => void;
}) {
  return (
    <CloudProviderInner getLocalState={getLocalState} setLocalState={setLocalState}>
      {children}
    </CloudProviderInner>
  );
}

function CloudProviderInner({
  children,
  getLocalState,
  setLocalState,
}: {
  children: ReactNode;
  getLocalState: () => AppState;
  setLocalState: (state: AppState) => void;
}) {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pullDone, setPullDone] = useState(false);
  const suppressSaveRef = useRef(false);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  // Resolve the lazy SDK chunk once; never reached when cloud is off.
  useEffect(() => {
    let active = true;
    void getClient().then((c) => {
      if (active) setClient(c);
    });
    return () => {
      active = false;
    };
  }, []);

  // Track auth state. GitHub is the only provider, so a signed-in session is
  // always the GitHub identity.
  useEffect(() => {
    if (!client) return;
    let active = true;
    void client.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error != null) {
        // Surfaces a stranded OAuth return (e.g. `?code=` landed where the
        // code exchange failed) instead of leaving the user signed out with
        // no explanation.
        setErrorMessage(error.message);
        setStatus('error');
      }
      setSession(data.session);
      // The PKCE `?code=` (or `?error=`) params are single-use. Strip them
      // once the client has consumed the return URL so a reload never
      // replays a spent code.
      try {
        const url = new globalThis.URL(window.location.href);
        if (url.searchParams.has('code') || url.searchParams.has('error')) {
          url.searchParams.delete('code');
          url.searchParams.delete('error');
          url.searchParams.delete('error_description');
          window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
        }
      } catch {
        // Never crash over URL cleanup.
      }
    });
    const { data: sub } = client.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) setPullDone(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [client]);

  /**
   * Pull the remote snapshot if it is newer than the last one this device has
   * seen. Runs once per signed-in session, right after the session settles.
   */
  useEffect(() => {
    if (!client || !session || pullDone) return;
    let active = true;
    (async () => {
      setStatus('syncing');
      const meta = readLocalMeta();
      const { data, error } = await client
        .from('user_state')
        .select('data, updated_at')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (!active) return;
      if (error != null) {
        setErrorMessage(error.message);
        setStatus('error');
        setPullDone(true);
        return;
      }
      const remoteUpdatedAt = data?.updated_at as string | null;
      const localSavedAt = (getLocalState() as AppState & { savedAt?: string }).savedAt ?? '';
      // Take the remote copy only when the cloud moved after the last pull
      // AND this device has not edited since that same pull — i.e. the other
      // device owns the newest write. Otherwise this device wins.
      const remoteNewer = Boolean(data && remoteUpdatedAt && remoteUpdatedAt > (meta.lastPulledAt ?? ''));
      const localNewer = Boolean(localSavedAt && localSavedAt > (meta.lastPulledAt ?? ''));
      if (remoteNewer && !localNewer) {
        suppressSaveRef.current = true;
        setLocalState(data!.data as AppState);
        suppressSaveRef.current = false;
      }
      writeLocalMeta({ lastPulledAt: remoteUpdatedAt ?? new Date().toISOString() });
      setPullDone(true);
      setStatus('idle');
      setErrorMessage(null);
    })();
    return () => {
      active = false;
    };
  }, [client, session, pullDone, getLocalState, setLocalState]);

  /**
   * Push after every local save. Debounced: the timer effect saves every
   * 250 ms during a countdown, and the cloud must never absorb half-second
   * writes — the final write of each burst lands.
   */
  useEffect(() => {
    if (!client || !session || !pullDone) return;
    if (suppressSaveRef.current) return;
    const t = window.setTimeout(async () => {
      const local = getLocalState() as AppState & { savedAt?: string };
      const savedAt = new Date().toISOString();
      setStatus('syncing');
      const { error } = await client.from('user_state').upsert({
        user_id: session.user.id,
        data: { ...local, savedAt },
        updated_at: savedAt,
      });
      if (sessionRef.current !== session) return;
      if (error != null) {
        setErrorMessage(error.message);
        setStatus('error');
      } else {
        writeLocalMeta({ lastPulledAt: savedAt });
        setStatus('idle');
        setErrorMessage(null);
      }
    }, 2_000);
    return () => window.clearTimeout(t);
  }, [client, session, pullDone, getLocalState]);

  const user = useMemo<CloudUser | null>(() => {
    if (!session) return null;
    const meta = (session.user.user_metadata ?? {}) as Record<string, unknown>;
    const handle = typeof meta.user_name === 'string' ? meta.user_name : null;
    const preferred = typeof meta.preferred_username === 'string' ? meta.preferred_username : handle;
    return {
      id: session.user.id,
      name: preferred ?? session.user.email ?? 'GitHub user',
    };
  }, [session]);

  const signIn = useCallback(() => {
    // Every failure path lands in errorMessage: a click that silently does
    // nothing is the bug being fixed (unconfigured build, failed SDK chunk
    // load, disabled provider, or rejected redirect URL all used to vanish).
    setErrorMessage(null);
    void getClient()
      .then(async (c) => {
        if (!c) {
          throw new Error(
            'Cloud sync is not configured in this build — add VITE_SUPABASE_URL and ' +
              'VITE_SUPABASE_ANON_KEY, then restart the dev server.',
          );
        }
        // `origin` (not `href`): the callback must land on the app root where
        // the Supabase client is loaded so `detectSessionInUrl` can exchange
        // the PKCE code. A full href would replay a sheet route or query string
        // on return and risks missing the allowlist in Supabase → Auth → URL
        // Configuration → Redirect URLs.
        // The SDK navigates to GitHub itself (`location.assign`) unless this
        // call returns an error — e.g. GitHub provider disabled in Supabase
        // Auth, or this origin missing from Redirect URLs.
        const { error } = await c.auth.signInWithOAuth({
          provider: 'github',
          options: { redirectTo: window.location.origin },
        });
        if (error != null) throw error;
      })
      .catch((e: unknown) => {
        setErrorMessage(e instanceof Error ? e.message : String(e));
        setStatus('error');
      });
  }, []);

  const signOut = useCallback(async () => {
    void getClient().then((c) => c?.auth.signOut());
  }, []);

  const value = useMemo<CloudValue>(
    () => ({ user, status, errorMessage, available: true, signIn, signOut }),
    [user, status, errorMessage, signIn, signOut],
  );

  return <CloudContext.Provider value={value}>{children}</CloudContext.Provider>;
}

export function useCloud(): CloudValue {
  return useContext(CloudContext);
}
