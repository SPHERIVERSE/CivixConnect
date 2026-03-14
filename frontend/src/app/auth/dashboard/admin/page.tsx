'use client';

import Link from 'next/link';
import RoleGuard from '@/components/RoleGuard';
import NotificationBell from '@/components/NotificationBell';
import NotificationPanel from '@/components/NotificationPanel';
import { useEffect, useState } from 'react';
import api from '@/utils/axiosInstance';

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
}

export default function AdminDashboard() {
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const userRes = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUserId(userRes.data.id);
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };

    fetchUserInfo();

    // Generate particles for animation
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 6,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <RoleGuard role="ADMIN">
      <div className="min-h-screen bg-slate-950 relative overflow-hidden">
        {/* Subtle glassy gradient backdrop */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#22c55e1f,_transparent_55%),_radial-gradient(circle_at_bottom,_#6366f11f,_transparent_55%)]" />

        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute w-2 h-2 bg-purple-400/30 rounded-full animate-pulse"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                animationDelay: `${p.delay}s`,
                animation: `float 8s ease-in-out infinite ${p.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-6 space-y-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="animate-fade-in-up">
            <div className="bg-slate-900/70 backdrop-blur-2xl rounded-3xl p-8 border border-slate-800/70 shadow-[0_18px_60px_rgba(15,23,42,0.95)]">
              <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-emerald-300/40">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-3xl font-semibold text-white">
                        Civic Operations{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400">
                          Command Center
                        </span>
                      </h1>
                      <p className="text-slate-300 text-sm mt-1">
                        Monitor AI‑triaged reports, public assets, and engagement across your city.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Notification Bell */}
                <div className="flex items-center space-x-4">
                  {currentUserId && <NotificationBell userId={currentUserId} />}
                </div>
              </div>
            </div>
          </div>

          {/* Management & AI cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* AI Operations Console */}
            <div className="bg-slate-900/75 backdrop-blur-2xl rounded-2xl p-6 border border-emerald-400/50 shadow-xl hover:shadow-[0_18px_50px_rgba(16,185,129,0.5)] transition-all duration-400 hover:-translate-y-1 cursor-default group">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-slate-950">AI</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white group-hover:text-emerald-100 transition-colors">
                    Swavi Civic Intelligence
                  </h2>
                  <p className="text-emerald-200/80 text-xs mt-1">
                    AI‑verified issues, severity scoring, and duplicate clustering – fully automated.
                  </p>
                </div>
              </div>
              <p className="text-slate-200 text-sm">
                Every new civic report is routed through Gemini to confirm the issue type, calculate a 1–10 severity score,
                and merge duplicate complaints into a single master work order before your team even sees it.
              </p>
            </div>

            <Link href="/auth/dashboard/admin/users">
              <div className="bg-slate-900/70 backdrop-blur-2xl rounded-2xl p-6 border border-slate-800/70 shadow-xl hover:shadow-2xl transition-all duration-400 hover:-translate-y-1 cursor-pointer group">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl text-slate-950">👥</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white group-hover:text-sky-100 transition-colors">
                    Users & Roles
                  </h2>
                </div>
                <p className="text-slate-200 text-sm">
                  Audit access, manage ADMIN / WORKER / CITIZEN / BUSINESS roles, and monitor participation.
                </p>
              </div>
            </Link>

            <Link href="/auth/dashboard/admin/reports">
              <div className="bg-slate-900/70 backdrop-blur-2xl rounded-2xl p-6 border border-slate-800/70 shadow-xl hover:shadow-2xl transition-all duration-400 hover:-translate-y-1 cursor-pointer group">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl text-slate-950">📊</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white group-hover:text-amber-100 transition-colors">
                    Civic Report Board
                  </h2>
                </div>
                <p className="text-slate-200 text-sm">
                  Filter by issue type, AI severity, and lifecycle status. Assign workers or mark infrastructure work as
                  in‑progress.
                </p>
              </div>
            </Link>

            <Link href="/auth/dashboard/admin/assets">
              <div className="bg-slate-900/70 backdrop-blur-2xl rounded-2xl p-6 border border-slate-800/70 shadow-xl hover:shadow-2xl transition-all duration-400 hover:-translate-y-1 cursor-pointer group">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl text-slate-950">📍</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white group-hover:text-fuchsia-100 transition-colors">
                    Public Assets
                  </h2>
                </div>
                <p className="text-slate-200 text-sm">
                  Manage toilets, bins and waste facilities that power the live civic map and citizen services.
                </p>
              </div>
            </Link>

            <Link href="/auth/dashboard/admin/csr-funds">
              <div className="bg-slate-900/70 backdrop-blur-2xl rounded-2xl p-6 border border-slate-800/70 shadow-xl hover:shadow-2xl transition-all duration-400 hover:-translate-y-1 cursor-pointer group">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl text-slate-950">₹</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white group-hover:text-emerald-100 transition-colors">
                    CSR & Incentives
                  </h2>
                </div>
                <p className="text-slate-200 text-sm">
                  Track CSR commitments, CleanCoin rewards and vouchers that keep citizens engaged over time.
                </p>
              </div>
            </Link>
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
            50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
          }
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
          }
        `}</style>
        {currentUserId && <NotificationPanel userId={currentUserId} />}
      </div>
    </RoleGuard>
  );
}
