'use client';

import RoleGuard from '@/components/RoleGuard';
import NotificationBell from '@/components/NotificationBell';
import NotificationPanel from '@/components/NotificationPanel';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/utils/axiosInstance';

interface UserStats {
  level: number;
  xp: number;
  xpToNext: number;
}

export default function CitizenDashboard() {
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    xp: 0,
    xpToNext: 100,
  });
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [cleanCoinBalance, setCleanCoinBalance] = useState<number>(0);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // 1. Fetch base user profile (which contains totalXp)
      const userRes = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setCurrentUserId(userRes.data.id);
      setUserName(userRes.data.name);

      // Calculate Level based on XP (e.g., 100 XP per level)
      const currentXp = userRes.data.totalXp || 0;
      const currentLevel = Math.floor(currentXp / 100) + 1;
      
      setUserStats({
        level: currentLevel,
        xp: currentXp,
        xpToNext: currentLevel * 100,
      });

      // 2. Fetch CleanCoin balance
      try {
        const coinRes = await api.get('/cleancoin/balance', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCleanCoinBalance(coinRes.data.balance || 0);
      } catch (err) {
        console.error('Failed to fetch CleanCoin balance:', err);
      }

      setError('');
    } catch (err: any) {
      setError('Failed to establish secure connection to the dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const xpPercentage = (userStats.xp / userStats.xpToNext) * 100;

  if (loading) {
    return (
      <RoleGuard role="CITIZEN">
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400 font-medium animate-pulse">Synchronizing node data...</p>
        </div>
      </RoleGuard>
    );
  }

  if (error) {
    return (
      <RoleGuard role="CITIZEN">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="bg-red-900/30 border border-red-800 text-red-300 p-8 rounded-2xl max-w-md text-center backdrop-blur-sm">
            <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            <p className="font-medium mb-6">{error}</p>
            <button onClick={fetchUserData} className="px-6 py-2 bg-red-800/50 hover:bg-red-800 rounded-lg transition-colors">
              Retry Connection
            </button>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard role="CITIZEN">
      <div className="w-full relative">
        
        {/* Ambient Tech Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 space-y-8 animate-fade-in-up">
          
          {/* Header & Stats Section */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              
              {/* Identity Block */}
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 bg-blue-900/40 border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                  {/* 👇 FIXED: Added a safe fallback (userName || 'U') */}
                  <span className="text-2xl font-bold text-cyan-400">
                    {(userName || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    Node Authenticated: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{userName}</span>
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">CivixConnect Citizen Terminal</p>
                </div>
              </div>
              
              {/* Telemetry/Stats */}
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex-1 lg:flex-none min-w-[140px]">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Clearance Level</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-white">{userStats.level}</span>
                    <span className="text-blue-400 mb-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </span>
                  </div>
                </div>
                
                <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex-1 lg:flex-none min-w-[140px]">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Wallet Balance</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-white">{cleanCoinBalance}</span>
                    <span className="text-emerald-400 mb-1 text-sm font-bold">CC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-8 pt-6 border-t border-slate-800/50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-300 font-semibold text-sm">Gamification Progress</span>
                <span className="text-cyan-400 font-mono text-sm">
                  {userStats.xp.toLocaleString()} / {userStats.xpToNext.toLocaleString()} XP
                </span>
              </div>
              <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden shadow-inner border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-1000 relative"
                  style={{ width: `${xpPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Civic Reporting (The AI Triage Core) */}
            <div
              className="bg-slate-900/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-800 shadow-lg cursor-pointer group hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] transition-all duration-300"
              onClick={() => router.push('/auth/dashboard/citizen/civic-report')}
            >
              <div className="w-16 h-16 bg-blue-900/30 border border-blue-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Infrastructure Reports</h2>
              <p className="text-slate-400 text-sm mb-6">Report potholes and hazards. Verified instantly by Swavi AI.</p>
              <div className="flex items-center text-blue-400 text-sm font-semibold">
                Access Terminal <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>

            {/* 2. Live Asset Tracker */}
            <div
              className="bg-slate-900/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-800 shadow-lg cursor-pointer group hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300"
              onClick={() => router.push('/auth/dashboard/citizen/track-assets')}
            >
              <div className="w-16 h-16 bg-cyan-900/30 border border-cyan-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Live Asset Radar</h2>
              <p className="text-slate-400 text-sm mb-6">Track real-time geospatial locations of city service vehicles.</p>
              <div className="flex items-center text-cyan-400 text-sm font-semibold">
                View Radar <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>

            {/* 3. Community Hub */}
            <div
              className="bg-slate-900/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-800 shadow-lg cursor-pointer group hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-300"
              onClick={() => router.push('/auth/dashboard/citizen/community')}
            >
              <div className="w-16 h-16 bg-indigo-900/30 border border-indigo-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">CivixConnect Hub</h2>
              <p className="text-slate-400 text-sm mb-6">Engage with other citizen nodes and share community updates.</p>
              <div className="flex items-center text-indigo-400 text-sm font-semibold">
                Open Channel <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>

            {/* 4. Waste Marketplace */}
            <div
              className="bg-slate-900/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-800 shadow-lg cursor-pointer group hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-300"
              onClick={() => router.push('/auth/dashboard/citizen/marketplace')}
            >
              <div className="w-16 h-16 bg-emerald-900/30 border border-emerald-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                 <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Resource Exchange</h2>
              <p className="text-slate-400 text-sm mb-6">List bulk materials and recyclable resources to corporate entities.</p>
              <div className="flex items-center text-emerald-400 text-sm font-semibold">
                Access Market <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>

            {/* 5. Vouchers */}
            <div
              className="bg-slate-900/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-800 shadow-lg cursor-pointer group hover:border-teal-500/50 hover:shadow-[0_0_30px_rgba(20,184,166,0.15)] transition-all duration-300"
              onClick={() => router.push('/auth/dashboard/citizen/vouchers')}
            >
              <div className="w-16 h-16 bg-teal-900/30 border border-teal-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">Reward Vouchers</h2>
              <p className="text-slate-400 text-sm mb-6">Convert earned CleanCoins into real-world corporate incentives.</p>
              <div className="flex items-center text-teal-400 text-sm font-semibold">
                View Claims <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>

            {/* 6. Quizzes / Knowledge */}
            <div
              className="bg-slate-900/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-800 shadow-lg cursor-pointer group hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300"
              onClick={() => router.push('/auth/dashboard/citizen/quizzes')}
            >
              <div className="w-16 h-16 bg-purple-900/30 border border-purple-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Knowledge Verification</h2>
              <p className="text-slate-400 text-sm mb-6">Participate in awareness protocols to earn additional XP.</p>
              <div className="flex items-center text-purple-400 text-sm font-semibold">
                Start Protocol <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
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