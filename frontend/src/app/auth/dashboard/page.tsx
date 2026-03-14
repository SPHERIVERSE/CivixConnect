'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/axiosInstance';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No active session found. Please initialize a connection.');
        setLoading(false);
        return;
      }

      try {
        // Using your standard api instance to fetch the current user profile
        const res = await api.get('/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to retrieve node profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const getDashboardLink = (role: string) => {
    switch (role) {
      case 'CITIZEN': return '/auth/dashboard/citizen';
      case 'WORKER': return '/auth/dashboard/worker';
      case 'ADMIN': return '/auth/dashboard/admin';
      case 'BUSINESS': return '/auth/dashboard/business';
      default: return '/';
    }
  };

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-red-900/30 border border-red-800 text-red-300 p-6 rounded-xl max-w-md text-center backdrop-blur-sm">
          <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="font-medium">{error}</p>
          <Link href="/auth/login" className="mt-4 inline-block px-4 py-2 bg-red-800/50 hover:bg-red-800 rounded-lg transition-colors">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <svg className="animate-spin h-10 w-10 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-400 font-medium animate-pulse">Decrypting node profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 relative">
      
      {/* Ambient Tech Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-2xl w-full p-8 md:p-12 backdrop-blur-2xl bg-slate-900/70 rounded-3xl border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.4)] relative z-10 transition-all duration-300">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10 pb-10 border-b border-slate-800">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-900/80 to-blue-900/80 border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)] flex-shrink-0">
            <span className="text-3xl font-bold text-cyan-400">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">{user.name}</h1>
            <p className="text-slate-400 font-mono text-sm mb-3">{user.email}</p>
            <span className="inline-flex items-center px-3 py-1 bg-cyan-950/50 border border-cyan-800 text-cyan-400 text-xs font-bold tracking-widest uppercase rounded-full shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              {user.role} NODE
            </span>
          </div>
        </div>

        {/* CivixConnect Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl flex items-center justify-between group hover:border-blue-500/50 transition-colors">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Experience</p>
              <p className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{user.totalXp || 0} <span className="text-sm text-slate-500 font-normal">XP</span></p>
            </div>
            <div className="w-10 h-10 bg-blue-950 rounded-lg flex items-center justify-center text-blue-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
          </div>
          
          <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl flex items-center justify-between group hover:border-emerald-500/50 transition-colors">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">CleanCoin Balance</p>
              <p className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">{user.cleanCoinBalance || 0} <span className="text-sm text-slate-500 font-normal">CC</span></p>
            </div>
            <div className="w-10 h-10 bg-emerald-950 rounded-lg flex items-center justify-center text-emerald-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        </div>

        {/* Portal Action */}
        <Link 
          href={getDashboardLink(user.role)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-lg text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
        >
          Access Command Portal
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </Link>

      </div>
    </div>
  );
}