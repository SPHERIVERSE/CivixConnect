'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/axiosInstance';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setMessage('Please enter email and password');
    
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('role', res.data.role);

      setMessage('Authentication successful. Initializing session...');

      // Redirect based on role
      setTimeout(() => {
        switch (res.data.role) {
          case 'CITIZEN':
            router.push('/auth/dashboard/citizen');
            break;
          case 'WORKER':
            router.push('/auth/dashboard/worker');
            break;
          case 'ADMIN':
            router.push('/auth/dashboard/admin');
            break;
          case 'BUSINESS':
            router.push('/auth/dashboard/business');
            break;
          default:
            router.push('/auth/dashboard');
        }
      }, 1000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-md w-full space-y-8 p-10 backdrop-blur-xl bg-slate-900/60 rounded-3xl border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative z-10 transition-all duration-300">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-900/30 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
             <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
             </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">System Access</h2>
          <p className="mt-2 text-slate-400 text-sm">Authenticate to enter the CivixConnect portal</p>
        </div>

        <form className="space-y-6" onSubmit={login}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                placeholder="admin@civixconnect.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Security Key</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Recover Access?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] flex justify-center items-center"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Authenticating...
              </span>
            ) : 'Initialize Session'}
          </button>

          {message && (
            <div className={`p-4 rounded-xl text-sm border backdrop-blur-sm ${
              message.includes('successful')
                ? 'bg-emerald-900/30 text-emerald-300 border-emerald-800'
                : 'bg-red-900/30 text-red-300 border-red-800'
            }`}>
              {message}
            </div>
          )}
        </form>

        <div className="text-center pt-4 border-t border-slate-800">
          <p className="text-sm text-slate-500">
            Unregistered node?{' '}
            <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Establish connection
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}