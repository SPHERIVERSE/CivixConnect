'use client';

import RoleGuard from '@/components/RoleGuard';
import NotificationBell from '@/components/NotificationBell';
import NotificationPanel from '@/components/NotificationPanel';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/utils/axiosInstance';

export default function BusinessDashboard() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await api.get('/users/me', { headers: { Authorization: `Bearer ${token}` } });
          setCurrentUserId(res.data.id);
          setUserName(res.data.name);
        } catch (error) {
          router.push('/auth/login');
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/auth/login');
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <RoleGuard role="BUSINESS">
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400 font-medium animate-pulse">Establishing secure corporate uplink...</p>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard role="BUSINESS">
      <div className="min-h-screen bg-slate-950 relative overflow-hidden text-slate-50">
        
        {/* Ambient Tech Glow - Emerald/Teal Theme for Business */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in-up">
          
          {/* Header Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-900/30 border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <span className="text-2xl font-bold text-emerald-400">{(userName || 'C').charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                  Corporate Entity: <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{userName}</span>
                </h1>
                <p className="text-slate-400 text-sm">Manage resource procurement, incentive deployment, and CSR allocations.</p>
              </div>
            </div>
            
            <div className="bg-slate-950/50 p-2 rounded-2xl border border-slate-800">
              {currentUserId && <NotificationBell userId={currentUserId} />}
            </div>
          </div>

          {/* Primary Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Resource Exchange */}
            <div
              onClick={() => router.push('/auth/dashboard/business/marketplace')}
              className="bg-slate-900/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-800 shadow-lg cursor-pointer group hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-300"
            >
              <div className="w-14 h-14 bg-emerald-900/30 border border-emerald-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Resource Procurement</h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">Browse and place bids on bulk material assets deployed by civilian nodes across the network.</p>
              <div className="flex items-center text-emerald-400 text-sm font-semibold">
                Access Exchange <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>

            {/* Incentive Deployment (Vouchers) */}
            <div
              onClick={() => router.push('/auth/dashboard/business/vouchers')}
              className="bg-slate-900/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-800 shadow-lg cursor-pointer group hover:border-teal-500/50 hover:shadow-[0_0_30px_rgba(20,184,166,0.15)] transition-all duration-300"
            >
              <div className="w-14 h-14 bg-teal-900/30 border border-teal-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">Incentive Deployment</h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">Generate and distribute discount vouchers to incentivize civic action within the CleanCoin economy.</p>
              <div className="flex items-center text-teal-400 text-sm font-semibold">
                Manage Incentives <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>

            {/* CSR Funds */}
            <div
              onClick={() => router.push('/auth/dashboard/business/csr')}
              className="bg-slate-900/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-800 shadow-lg cursor-pointer group hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300"
            >
              <div className="w-14 h-14 bg-cyan-900/30 border border-cyan-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">CSR Capital</h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">Allocate Corporate Social Responsibility budgets and track capital distribution impact across the network.</p>
              <div className="flex items-center text-cyan-400 text-sm font-semibold">
                Manage Capital <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>
            
          </div>

          {/* Quick Actions & Community Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="md:col-span-2 bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Action Protocols
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/auth/dashboard/business/csr')}
                  className="w-full bg-slate-950 border border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-900/20 text-slate-300 hover:text-emerald-400 py-4 px-6 rounded-xl font-semibold transition-all shadow-md flex flex-col items-start gap-1"
                >
                  <span className="text-sm font-bold uppercase tracking-wider text-emerald-500">Initiate</span>
                  <span>New CSR Fund</span>
                </button>
                <button
                  onClick={() => router.push('/auth/dashboard/business/vouchers')}
                  className="w-full bg-slate-950 border border-slate-700 hover:border-teal-500/50 hover:bg-teal-900/20 text-slate-300 hover:text-teal-400 py-4 px-6 rounded-xl font-semibold transition-all shadow-md flex flex-col items-start gap-1"
                >
                  <span className="text-sm font-bold uppercase tracking-wider text-teal-500">Deploy</span>
                  <span>Corporate Voucher</span>
                </button>
                <button
                  onClick={() => router.push('/auth/dashboard/business/marketplace')}
                  className="w-full bg-slate-950 border border-slate-700 hover:border-blue-500/50 hover:bg-blue-900/20 text-slate-300 hover:text-blue-400 py-4 px-6 rounded-xl font-semibold transition-all shadow-md flex flex-col items-start gap-1"
                >
                  <span className="text-sm font-bold uppercase tracking-wider text-blue-500">Scan</span>
                  <span>Active Resource Market</span>
                </button>
                {/* Knowledge Verification Quiz Button */}
                <button
                  onClick={() => router.push('/auth/dashboard/business/quizzes')}
                  className="w-full bg-slate-950 border border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-900/20 text-slate-300 hover:text-cyan-400 py-4 px-6 rounded-xl font-semibold transition-all shadow-md flex flex-col items-start gap-1"
                >
                  <span className="text-sm font-bold uppercase tracking-wider text-cyan-500">Engineer</span>
                  <span>Awareness Protocol</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-lg flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-3">CivixConnect Hub</h2>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Engage directly with civilian and worker nodes. Broadcast corporate sustainability updates to the global network feed.
                </p>
              </div>
              <button
                onClick={() => router.push('/auth/dashboard/citizen/community')}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2"
              >
                Enter Network Feed
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>

          </div>

        </div>
        
        <style jsx>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out forwards;
          }
        `}</style>
        
        {currentUserId && <NotificationPanel userId={currentUserId} />}
      </div>
    </RoleGuard>
  );
}