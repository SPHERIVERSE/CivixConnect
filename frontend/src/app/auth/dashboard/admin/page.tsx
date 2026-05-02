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

    // Generate tech-grid nodes for background
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <RoleGuard role="ADMIN">
      <div className="min-h-screen bg-slate-950 relative overflow-hidden text-slate-50">
        
        {/* Ambient Tech Glow & Grid */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-900/20 blur-[120px] rounded-full"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]"></div>
        </div>

        {/* Animated Data Nodes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute w-1 h-1 bg-cyan-500/40 rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                animationDelay: `${p.delay}s`,
                animation: `pulse-node 4s ease-in-out infinite ${p.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
          
          {/* Main Header Card */}
          <div className="animate-fade-in-down">
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-900/30 border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                    <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
                      Authority <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Command Center</span>
                    </h1>
                    <p className="text-slate-400 text-sm">
                      Monitor network nodes, AI-triaged anomalies, and infrastructure deployments across the city.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center bg-slate-950/50 p-2 rounded-2xl border border-slate-800">
                  {currentUserId && <NotificationBell userId={currentUserId} />}
                </div>

              </div>
            </div>
          </div>

          {/* Module Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            
            {/* AI Operations Console (Spans 2 columns on large screens for emphasis) */}
            <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-blue-900/50 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-14 h-14 bg-blue-900/40 border border-blue-500/30 rounded-xl flex items-center justify-center shadow-inner">
                  <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Swavi Civic Intelligence</h2>
                  <p className="text-blue-400 text-xs font-mono uppercase tracking-wider mt-1">
                    System Status: Active & Monitoring
                  </p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed relative z-10 max-w-2xl">
                Every incoming infrastructure report is routed through the Gemini AI agent to confirm visual evidence, calculate a 1–10 severity score, flag spam, and instantly merge duplicate GPS clusters into a single master work order.
              </p>
            </div>

            {/* Network Nodes (Users) */}
            <Link href="/auth/dashboard/admin/users" className="block outline-none">
              <div className="h-full bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 hover:border-indigo-500/50 shadow-lg hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-300 group cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-indigo-900/30 border border-indigo-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                    Network Nodes
                  </h2>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Audit access levels, manage ADMIN / WORKER / CITIZEN roles, and monitor participation telemetry across the network.
                </p>
              </div>
            </Link>

            {/* Civic Report Board */}
            <Link href="/auth/dashboard/admin/reports" className="block outline-none">
              <div className="h-full bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 hover:border-cyan-500/50 shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300 group cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-cyan-900/30 border border-cyan-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    Triage Command
                  </h2>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Filter anomalies by AI severity and status. Dispatch field workers or authorize city-level infrastructure repairs.
                </p>
              </div>
            </Link>

            {/* Public Assets */}
            <Link href="/auth/dashboard/admin/assets" className="block outline-none">
              <div className="h-full bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 hover:border-teal-500/50 shadow-lg hover:shadow-[0_0_30px_rgba(20,184,166,0.15)] transition-all duration-300 group cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-teal-900/30 border border-teal-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">
                    Asset Radar
                  </h2>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Manage fixed geospatial installations (facilities, bins) that power the live tracking map for civilian nodes.
                </p>
              </div>
            </Link>

            {/* CSR & Economy */}
            <Link href="/auth/dashboard/admin/csr-funds" className="block outline-none">
              <div className="h-full bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 hover:border-emerald-500/50 shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-300 group cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-emerald-900/30 border border-emerald-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Network Economy
                  </h2>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Track corporate CSR commitments and the flow of CleanCoin incentives maintaining civilian engagement.
                </p>
              </div>
            </Link>

          </div>
        </div>

        <style jsx>{`
          @keyframes pulse-node {
            0%, 100% { transform: scale(1); opacity: 0.2; }
            50% { transform: scale(1.5); opacity: 0.8; }
          }
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
        
        {currentUserId && <NotificationPanel userId={currentUserId} />}
      </div>
    </RoleGuard>
  );
}