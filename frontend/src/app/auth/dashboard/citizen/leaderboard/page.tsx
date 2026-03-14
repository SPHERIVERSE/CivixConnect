'use client';

import RoleGuard from '@/components/RoleGuard';
import { useEffect, useState } from 'react';
import api from '@/utils/axiosInstance';

interface LeaderboardUser {
  id: string;
  name: string;
  xp: number;
  role: string;
  rank?: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const currentUserId =
    typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Assuming your backend route remains the same even after removing training modules
      const res = await api.get('/training/leaderboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const users: LeaderboardUser[] = res.data || [];

      // Only keep CITIZEN users
      const citizenUsers = users.filter((u) => u.role === 'CITIZEN');
      setLeaderboard(citizenUsers);

      if (currentUserId) {
        const me =
          citizenUsers.find((u) => u.id === currentUserId) ||
          (await fetchMyRank(currentUserId));
        setCurrentUser(me || null);
      }

      setError('');
    } catch (err) {
      setError('Failed to synchronize network rankings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRank = async (userId: string) => {
    try {
      const res = await api.get(`/training/my-rank`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const me: LeaderboardUser = res.data;
      return me.role === 'CITIZEN' ? me : null; // only return if citizen
    } catch {
      return null;
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <RoleGuard role="CITIZEN">
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400 font-medium animate-pulse">Aggregating node telemetry...</p>
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
            <button onClick={fetchLeaderboard} className="px-6 py-2 bg-red-800/50 hover:bg-red-800 rounded-lg transition-colors">
              Retry Connection
            </button>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard role="CITIZEN">
      <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-50">
        
        {/* Ambient Tech Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          
          {/* Header */}
          <div className="animate-fade-in-down">
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-indigo-900/30 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.2)] flex-shrink-0">
                <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
                  Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Node Rankings</span>
                </h1>
                <p className="text-slate-400 text-sm">
                  Monitor the highest contributing civilian nodes across the CivixConnect network infrastructure.
                </p>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="animate-fade-in-up">
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.3)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800">
                      <th className="py-5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Rank</th>
                      <th className="py-5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Node Identifier</th>
                      <th className="py-5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Experience (XP)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {leaderboard.map((user, idx) => {
                      const isCurrentUser = user.id === currentUserId;
                      const isFirst = idx === 0;
                      const isSecond = idx === 1;
                      const isThird = idx === 2;

                      return (
                        <tr
                          key={`${user.id}-${idx}`}
                          className={`transition-colors duration-200 hover:bg-slate-800/30 ${
                            isCurrentUser ? 'bg-blue-900/20 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                          } ${isFirst ? 'bg-amber-900/10' : ''}`}
                        >
                          <td className="py-4 px-6 text-lg font-mono">
                            {isFirst ? (
                              <span className="flex items-center text-amber-400 font-bold">
                                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 01.832.445l2.454 3.682 4.381.637a1 1 0 01.554 1.706l-3.17 3.09 .748 4.364a1 1 0 01-1.451 1.054L10 14.653l-3.918 2.06a1 1 0 01-1.451-1.054l.748-4.364-3.17-3.09a1 1 0 01.554-1.706l4.381-.637 2.454-3.682A1 1 0 0110 2z" clipRule="evenodd" /></svg>
                                01
                              </span>
                            ) : isSecond ? (
                              <span className="text-slate-300 font-bold">02</span>
                            ) : isThird ? (
                              <span className="text-orange-400 font-bold">03</span>
                            ) : (
                              <span className="text-slate-500">{(idx + 1).toString().padStart(2, '0')}</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                isFirst ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' :
                                isSecond ? 'bg-slate-500/20 text-slate-300 border border-slate-500/50' :
                                isThird ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' :
                                'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <span className={`font-semibold ${isCurrentUser ? 'text-blue-400' : 'text-slate-200'}`}>
                                {user.name} {isCurrentUser && <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded ml-2">YOU</span>}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className={`font-mono font-bold ${
                                isFirst ? 'text-amber-400' :
                                isSecond ? 'text-slate-300' :
                                isThird ? 'text-orange-400' :
                                'text-cyan-400'
                            }`}>
                              {user.xp.toLocaleString()}
                            </span>
                            <span className="text-slate-500 text-xs ml-1 font-sans">XP</span>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Current user row if not in top list */}
                    {currentUser && !leaderboard.some((u) => u.id === currentUser.id) && (
                      <>
                        <tr className="bg-slate-950/80">
                          <td colSpan={3} className="py-2 text-center text-slate-600 text-xs font-mono tracking-widest border-t border-slate-800">
                            •••
                          </td>
                        </tr>
                        <tr className="bg-blue-900/20 border-l-4 border-l-blue-500 border-t border-slate-800 transition-colors">
                          <td className="py-4 px-6 text-lg font-mono text-slate-500">
                            {(currentUser.rank || 0).toString().padStart(2, '0')}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-slate-800 text-slate-400 border border-slate-700">
                                {currentUser.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-blue-400">
                                {currentUser.name} <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded ml-2">YOU</span>
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="font-mono font-bold text-cyan-400">
                              {currentUser.xp.toLocaleString()}
                            </span>
                            <span className="text-slate-500 text-xs ml-1 font-sans">XP</span>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="animate-fade-in-up flex justify-center mt-8">
            <button
              className="group relative inline-flex items-center justify-center px-8 py-3 text-sm font-semibold text-white bg-slate-800 border border-slate-700 rounded-xl overflow-hidden transition-all hover:bg-slate-700 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]"
              onClick={fetchLeaderboard}
            >
              <svg className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh Telemetry
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fade-in-down {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out forwards;
          }
          .animate-fade-in-down {
            animation: fade-in-down 0.5s ease-out forwards;
          }
        `}</style>
      </div>
    </RoleGuard>
  );
}