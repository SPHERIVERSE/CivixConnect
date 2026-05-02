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

export default function WorkerDashboard() {
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
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const fetchWorkerData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const userRes = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setCurrentUserId(userRes.data.id);
      setUserName(userRes.data.name);

      const currentXp = userRes.data.totalXp || 0;
      const currentLevel = Math.floor(currentXp / 100) + 1;
      
      setUserStats({
        level: currentLevel,
        xp: currentXp,
        xpToNext: currentLevel * 100,
      });

      setError('');
    } catch (err: any) {
      setError('Failed to establish secure connection to the field terminal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerData();
  }, []);

  useEffect(() => {
    let watchId: number | null = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          setIsBroadcasting(true);
          try {
            const token = localStorage.getItem('access_token');
            await api.post('/maps/worker-location', {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch { /* Telemetry drop */ }
        },
        () => setIsBroadcasting(false),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const xpPercentage = (userStats.xp / userStats.xpToNext) * 100;

  if (loading) {
    return (
      <RoleGuard role="WORKER">
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400 font-medium animate-pulse">Initializing field terminal...</p>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard role="WORKER">
      <div className="w-full relative min-h-[80vh]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 space-y-8 animate-fade-in-up p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 bg-amber-900/40 border border-amber-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <span className="text-2xl font-bold text-amber-400">{(userName || 'W').charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                    Field Agent: <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">{userName}</span>
                  </h1>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-slate-400 text-sm">Active Terminal</span>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${isBroadcasting ? 'bg-emerald-950/50 border-emerald-800 text-emerald-400' : 'bg-red-950/50 border-red-800 text-red-400'} px-2 py-0.5 rounded uppercase tracking-wider border`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isBroadcasting ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                      {isBroadcasting ? 'Telemetry Live' : 'Telemetry Offline'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex-1 lg:flex-none min-w-[140px]">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Clearance Level</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-white">{userStats.level}</span>
                    <span className="text-amber-400 mb-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-300 font-semibold text-sm">Operational Experience (XP)</span>
                <span className="text-amber-400 font-mono text-sm">{userStats.xp.toLocaleString()} / {userStats.xpToNext.toLocaleString()} XP</span>
              </div>
              <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden shadow-inner border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-orange-400 rounded-full transition-all duration-1000 relative"
                  style={{ width: `${xpPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Dispatch Directives */}
            <div
              className="bg-slate-900/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-800 shadow-lg cursor-pointer group hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all duration-300"
              onClick={() => router.push('/auth/dashboard/worker/tasks')}
            >
              <div className="w-16 h-16 bg-amber-900/30 border border-amber-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">Dispatch Directives</h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">View AI-triaged infrastructure repairs and cleanup assignments.</p>
              <div className="flex items-center text-amber-400 text-sm font-semibold">
                Access Terminal <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>

            {/* 2. Knowledge Verification (Quiz) */}
            <div
              className="bg-slate-900/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-800 shadow-lg cursor-pointer group hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300"
              onClick={() => router.push('/auth/dashboard/worker/quizzes')}
            >
              <div className="w-16 h-16 bg-cyan-900/30 border border-cyan-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Verification Protocols</h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">Execute awareness protocols to maintain clearance and earn network incentives.</p>
              <div className="flex items-center text-cyan-400 text-sm font-semibold">
                Initialize Protocol <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>

            {/* 3. Global Leaderboard */}
            <div
              className="bg-slate-900/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-800 shadow-lg cursor-pointer group hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-all duration-300"
              onClick={() => router.push('/auth/dashboard/worker/quizzes')}
            >
              <div className="w-16 h-16 bg-orange-900/30 border border-orange-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">Global Quiz</h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">Participate in Quizzes to earn cleancoins and xps.</p>
              <div className="flex items-center text-orange-400 text-sm font-semibold">
                View Quizzes <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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