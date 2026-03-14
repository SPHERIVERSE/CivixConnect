'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/10 to-slate-950"></div>
        
        {/* Tech/AI Floating Nodes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-24 h-24 bg-blue-600 rounded-full opacity-[0.07] blur-3xl float-animation"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-indigo-600 rounded-full opacity-[0.05] blur-3xl float-animation" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-cyan-600 rounded-full opacity-[0.08] blur-2xl float-animation" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 right-10 w-28 h-28 bg-blue-800 rounded-full opacity-[0.06] blur-3xl float-animation" style={{animationDelay: '0.5s'}}></div>
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]"></div>
        </div>

        <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-950/50 border border-indigo-500/30 rounded-full text-cyan-400 text-sm font-medium backdrop-blur-sm shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <span className="flex h-2 w-2 relative mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Powered by Swavi AI
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
              CivixConnect
            </span>
            <br />
            <span className="text-slate-200 text-4xl md:text-6xl">Smart City Infrastructure</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            The next-generation civic platform. Report infrastructure issues, leverage AI for instant triage, and track city-wide repairs in real-time while earning rewards for community action.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16">
            <Link 
              href="/auth/register" 
              className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-blue-600 rounded-xl overflow-hidden transition-all hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
            >
              <span className="relative z-10 flex items-center">
                Launch Platform
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link 
              href="/auth/login" 
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-300 bg-slate-900/50 border border-slate-700 rounded-xl hover:bg-slate-800 hover:text-white transition-all backdrop-blur-sm"
            >
              Authority Login
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
              <div className="text-3xl font-bold text-blue-400 mb-1">AI-Driven</div>
              <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Automated Triage</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
              <div className="text-3xl font-bold text-indigo-400 mb-1">Real-Time</div>
              <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Geospatial Mapping</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
              <div className="text-3xl font-bold text-cyan-400 mb-1">100%</div>
              <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Transparent Resolution</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-950 relative border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Next-Generation Civic Intelligence
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Equipping citizens and authorities with enterprise-grade tools to maintain, repair, and optimize urban infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.1)] transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-950 border border-blue-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 22V12h6v10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">Smart Issue Reporting</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Instantly report potholes, broken streetlights, and water leaks. Snap a photo, and let our system automatically tag the exact GPS coordinates.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] transition-all duration-300 group">
              <div className="w-14 h-14 bg-indigo-950 border border-indigo-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">Swavi AI Triage</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Our embedded Gemini AI agent analyzes uploaded photos to filter spam, verify the issue type, and assign a 1-10 severity score before admins even see it.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-300 group">
              <div className="w-14 h-14 bg-cyan-950 border border-cyan-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">Geospatial Clustering</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Multiple reports for the same broken pipe? Our algorithm clusters identical issues based on proximity and AI image similarity to prevent duplicate work orders.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-300 group">
              <div className="w-14 h-14 bg-emerald-950 border border-emerald-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">Evidence-Based Resolution</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Watch the status change from 'Pending' to 'Working on it'. Workers upload photographic evidence of repairs for admin confirmation before closure.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all duration-300 group">
              <div className="w-14 h-14 bg-amber-950 border border-amber-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">Gamified Civic Action</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Earn CleanCoins and XP for verifying issues and reporting hazards. Level up on the community leaderboard and redeem coins for local business vouchers.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-950 border border-purple-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">Authority Command Center</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                A unified dashboard for city administrators to filter reports by severity, track SLA compliance, dispatch workers, and monitor structural health.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 to-slate-950"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to Build a Smarter City?
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join the network of citizens and authorities proactively managing urban infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link 
              href="/auth/register" 
              className="px-8 py-4 bg-white text-slate-900 hover:bg-slate-200 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Create Citizen Account
            </Link>
            <Link 
              href="/auth/login" 
              className="px-8 py-4 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-semibold rounded-xl transition-all"
            >
              Access Command Center
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .float-animation {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}