'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, Key, Mail, Loader2, Info } from 'lucide-react';

export default function LoginPage() {
  const { user, login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Login failed');
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setLoading(true);
    setError(null);
    setEmail(demoEmail);
    setPassword('password');

    const res = await login(demoEmail, 'password');
    if (!res.success) {
      setError(res.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-background bg-gradient-mesh px-4 py-12 relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in z-10">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl mb-4 relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <svg
              className="w-10 h-10 text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Hotel Bell fused with modern S curve */}
              <path d="M6 19h12" />
              <path d="M18 19v-4a6 6 0 0 0-4-5.65V7a2 2 0 1 0-4 0v2.35A6 6 0 0 0 6 15v4" />
              <path d="M12 3v2" strokeWidth="2.5" />
              <path d="M10 14.5c1-1 3-1 4 0.5s-2 2-1 3.5c1 1.5 3 0.5 3 0.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-indigo-100 to-cyan-200 bg-clip-text text-transparent">
            StaySage AI
          </h1>
          <p className="mt-2 text-zinc-400 text-sm font-medium">
            Intelligent Guest Complaint Management Operations
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-card rounded-2xl p-8 border border-zinc-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-60" />

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-start gap-2 animate-pulse">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 tracking-wide uppercase">
                Staff Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. staff@staysage.ai"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-zinc-300 tracking-wide uppercase">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transform duration-150 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Secure Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <span className="relative px-3 bg-zinc-900 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Demo Credentials
            </span>
          </div>

          {/* Quick Logins */}
          <div className="space-y-2.5">
            <button
              onClick={() => handleQuickLogin('admin@staysage.ai')}
              disabled={loading}
              className="w-full p-2.5 bg-zinc-950/40 border border-zinc-800/70 hover:border-zinc-700 hover:bg-zinc-900/40 text-left rounded-xl transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <p className="text-xs font-semibold text-zinc-200 group-hover:text-white">Audrey Hepburn</p>
                <p className="text-[10px] text-zinc-500">General Manager (Admin)</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md font-semibold">
                Admin
              </span>
            </button>

            <button
              onClick={() => handleQuickLogin('manager@staysage.ai')}
              disabled={loading}
              className="w-full p-2.5 bg-zinc-950/40 border border-zinc-800/70 hover:border-zinc-700 hover:bg-zinc-900/40 text-left rounded-xl transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <p className="text-xs font-semibold text-zinc-200 group-hover:text-white">Gregory Peck</p>
                <p className="text-[10px] text-zinc-500">Operations Manager</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-md font-semibold">
                Manager
              </span>
            </button>

            <button
              onClick={() => handleQuickLogin('staff@staysage.ai')}
              disabled={loading}
              className="w-full p-2.5 bg-zinc-950/40 border border-zinc-800/70 hover:border-zinc-700 hover:bg-zinc-900/40 text-left rounded-xl transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <p className="text-xs font-semibold text-zinc-200 group-hover:text-white">Humphrey Bogart</p>
                <p className="text-[10px] text-zinc-500">Front Desk Agent</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-zinc-500/10 text-zinc-400 border border-zinc-700/50 rounded-md font-semibold">
                Staff
              </span>
            </button>
          </div>
        </div>
        
        <p className="text-center mt-6 text-xs text-zinc-600 font-medium">
          Protected by StaySage AI Operations Cryptography
        </p>
      </div>
    </main>
  );
}
