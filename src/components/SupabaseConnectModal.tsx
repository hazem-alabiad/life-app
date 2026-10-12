import React, { useState, useEffect } from 'react';
import { X, Database, Check, Copy, ExternalLink, RefreshCw, AlertCircle, ShieldCheck, CheckCircle2, Terminal } from 'lucide-react';
import { isSupabaseConfigured, resetSupabaseClient, SUPABASE_SETUP_SQL, getSupabaseClient } from '../db/supabase';
import { useApp } from '../context/AppContext';

export const SupabaseConnectModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { syncDataToCloud } = useApp();

  const [projectUrl, setProjectUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [status, setStatus] = useState<'connected' | 'not_configured'>('not_configured');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'credentials' | 'sql'>('credentials');

  useEffect(() => {
    if (isOpen) {
      const storedUrl = localStorage.getItem('supabase_project_url') || import.meta.env.VITE_SUPABASE_URL || '';
      const storedKey = localStorage.getItem('supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      setProjectUrl(storedUrl);
      setAnonKey(storedKey);
      setStatus(isSupabaseConfigured() ? 'connected' : 'not_configured');
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const cleanUrl = projectUrl.trim().replace(/\/+$/, '');
    const cleanKey = anonKey.trim();

    localStorage.setItem('supabase_project_url', cleanUrl);
    localStorage.setItem('supabase_anon_key', cleanKey);
    resetSupabaseClient();

    try {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Please provide both Project URL and Public Anon Key');
      }

      // Quick test query to check connection
      const { data, error } = await client.from('user_sync').select('id').limit(1);

      if (error && error.code !== 'PGRST116') {
        // Table might not exist yet, but credentials could be valid
        if (error.message.includes('relation "public.user_sync" does not exist') || error.code === '42P01') {
          setStatus('connected');
          setTestResult({
            success: true,
            message: 'Connected to Supabase! Run the SQL schema script in the next tab to create tables.',
          });
          setActiveTab('sql');
        } else {
          throw error;
        }
      } else {
        setStatus('connected');
        setTestResult({
          success: true,
          message: 'Connected successfully to Supabase PostgreSQL database!',
        });
        // Auto sync data to cloud
        syncDataToCloud();
      }
    } catch (err: any) {
      setStatus('not_configured');
      setTestResult({
        success: false,
        message: err.message || 'Failed to connect. Check your URL and Key.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('supabase_project_url');
    localStorage.removeItem('supabase_anon_key');
    resetSupabaseClient();
    setProjectUrl('');
    setAnonKey('');
    setStatus('not_configured');
    setTestResult(null);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#11141c] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 text-white max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Supabase PostgreSQL Connection</h3>
              <p className="text-xs text-slate-400">Serverless relational database with real-time sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1b202a] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Pill */}
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
          status === 'connected'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-[#151924] border-white/5 text-slate-400'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="font-semibold">
              {status === 'connected' ? 'Supabase Live Connected' : 'Local Fallback Storage Active'}
            </span>
          </div>
          {status === 'connected' && (
            <button
              onClick={handleDisconnect}
              className="text-[11px] text-red-400 hover:text-red-300 transition-colors cursor-pointer underline"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-[#161a25] border border-white/5">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'credentials' ? 'bg-[#1e2536] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Connection Keys
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'sql' ? 'bg-[#1e2536] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>SQL Tables Setup</span>
          </button>
        </div>

        {activeTab === 'credentials' ? (
          <form onSubmit={handleSaveAndTest} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                required
                className="w-full px-3 py-2 bg-[#0d1017] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-400"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Found in your Supabase Dashboard &gt; Project Settings &gt; API
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Public Anon Key (`anon` `public`)
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                required
                className="w-full px-3 py-2 bg-[#0d1017] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-400"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Client-safe API key protected by PostgreSQL Row Level Security (RLS)
              </span>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                )}
                <span className="leading-relaxed">{testResult.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={testing}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {testing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>Connect &amp; Verify Supabase</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* SQL Script Tab */
          <div className="space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              Copy this SQL script and paste it in your <strong>Supabase Dashboard &gt; SQL Editor</strong> to create the tables for sync:
            </p>

            <div className="relative">
              <pre className="p-3.5 rounded-xl bg-[#090c12] border border-white/10 text-[11px] font-mono text-emerald-400 max-h-48 overflow-y-auto overflow-x-auto no-scrollbar">
                {SUPABASE_SETUP_SQL}
              </pre>
              <button
                type="button"
                onClick={handleCopySql}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-[#1b2230] hover:bg-[#232c3f] border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>

            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-[#171d29] hover:bg-[#202737] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Open Supabase Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
