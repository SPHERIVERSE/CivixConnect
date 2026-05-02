'use client';

import React, { useEffect, useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import axios from '@/utils/axiosInstance';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/CivicMap'), { ssr: false });

interface AssignedReport {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  resolvedImageUrl?: string | null;
  status: 'pending' | 'escalated' | 'assigned' | 'resolved';
  latitude?: number;
  longitude?: number;
}

export default function WorkerTasksPage() {
  const [reports, setReports] = useState<AssignedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);

  const fetchAssigned = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/civic-report/assigned/me');
      setReports(res.data);
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Failed to sync dispatch directives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();

    let watchId: number | null = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          try {
            await axios.post('/maps/worker-location', {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
            setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          } catch (e) {
            // Silently fail if telemetry drops
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const onUpload = async (reportId: string, file: File, notes?: string) => {
    setUploadingId(reportId);
    setMessage(null);
    try {
      const form = new FormData();
      form.append('photo', file);
      if (notes) form.append('notes', notes);
      await axios.post(`/civic-report/${reportId}/worker/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('✅ Visual evidence uploaded successfully.');
      await fetchAssigned();
    } catch (e: any) {
      setMessage(`❌ ${e.response?.data?.message || 'Evidence upload failed'}`);
    } finally {
      setUploadingId(null);
    }
  };

  const markResolved = async (reportId: string) => {
    setMessage(null);
    try {
      setReports((prev) => prev.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
      await axios.post(`/civic-report/${reportId}/worker/mark-resolved`);
      setMessage('✅ Resolution authorized. Awaiting Command verification.');
      await fetchAssigned();
    } catch (e: any) {
      setMessage(`❌ ${e.response?.data?.message || 'Failed to authorize resolution'}`);
      await fetchAssigned();
    }
  };

  const assigned = reports.filter(r => r.status !== 'resolved');
  const completed = reports.filter(r => r.status === 'resolved' || !!r.resolvedImageUrl);

  if (loading) {
    return (
      <RoleGuard role="WORKER">
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400 font-medium animate-pulse">Synchronizing active directives...</p>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard role="WORKER">
      <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
        
        {/* Ambient Tech Glow - Amber/Orange Theme */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in-up">
          
          {/* Header Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-amber-900/30 border border-amber-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                  Active Dispatch <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Directives</span>
                </h1>
                <p className="text-slate-400 text-sm">Manage AI-triaged infrastructure repairs assigned to your node.</p>
              </div>
            </div>
            
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 min-w-[160px] text-center">
              <div className="text-3xl font-bold text-amber-400 font-mono tracking-tight">{assigned.length}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Pending Orders</div>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl border text-sm font-medium backdrop-blur-sm animate-fade-in-up ${
              message.includes('✅') 
                ? 'bg-emerald-900/30 border-emerald-800 text-emerald-300' 
                : 'bg-red-900/30 border-red-800 text-red-300'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Active Directives Column */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Current Assignments
              </h2>
              
              {assigned.length === 0 ? (
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-12 text-center border border-slate-800 shadow-xl">
                  <svg className="w-12 h-12 mx-auto text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" /></svg>
                  <p className="text-slate-400 font-mono text-sm">No active directives. Maintain standby status.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {assigned.map((r) => (
                    <div key={r.id} className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-lg hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
                      
                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="flex-1 pr-4">
                          <h3 className="text-lg font-bold text-white mb-2 leading-tight">{r.title}</h3>
                          <p className="text-slate-400 text-sm mb-4 leading-relaxed">{r.description}</p>
                          <span className={`inline-block px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${
                            r.status === 'assigned' ? 'bg-amber-900/30 text-amber-400 border-amber-500/30' : 'bg-blue-900/30 text-blue-400 border-blue-500/30'
                          }`}>
                            STATUS: {r.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-5 relative z-10">
                        <textarea
                          placeholder="Input operational notes for Command (optional)..."
                          className="w-full bg-slate-950 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-sm placeholder-slate-600 transition-colors"
                          id={`notes-${r.id}`}
                          disabled={uploadingId === r.id}
                          rows={2}
                        />
                        <label className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all cursor-pointer border ${
                          uploadingId === r.id 
                            ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' 
                            : 'bg-amber-900/10 border-amber-500/30 text-amber-400 hover:bg-amber-900/30 hover:border-amber-500/50'
                        }`}>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              const notes = (document.getElementById(`notes-${r.id}`) as HTMLTextAreaElement)?.value;
                              if (f) onUpload(r.id, f, notes);
                            }}
                            disabled={uploadingId === r.id}
                          />
                          {uploadingId === r.id ? (
                            <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Transmitting...</>
                          ) : (
                            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Upload Visual Evidence</>
                          )}
                        </label>
                      </div>

                      {r.resolvedImageUrl && (
                        <div className="mb-4 p-3 rounded-lg bg-emerald-900/20 border border-emerald-500/30 relative z-10">
                          <p className="text-emerald-400 text-xs font-mono flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Evidence secured in database.
                          </p>
                        </div>
                      )}

                      <button
                        onClick={() => markResolved(r.id)}
                        className="relative z-10 w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2"
                      >
                        Authorize Resolution
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Column */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Pending Command Verification
              </h2>
              
              {completed.length === 0 ? (
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-12 text-center border border-slate-800 shadow-xl">
                  <p className="text-slate-500 font-mono text-sm">No recent resolutions awaiting authorization.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completed.map((r) => (
                    <div key={r.id} className="bg-slate-950/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 opacity-80 hover:opacity-100 transition-opacity">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-md font-bold text-white mb-1 line-clamp-1">{r.title}</h3>
                          <p className="text-slate-500 text-xs mb-3 line-clamp-1">{r.description}</p>
                          <span className="inline-block px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider bg-emerald-900/10 text-emerald-500 border-emerald-900/50">
                            Awaiting Command Approval
                          </span>
                        </div>
                      </div>
                      {r.resolvedImageUrl && (
                        <div className="mt-4 p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <p className="text-slate-400 text-xs font-mono flex items-center gap-2">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                            Resolution evidence attached
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Map Section */}
          <div className="animate-fade-in-up mt-8">
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                Geospatial Operations Map
              </h2>
              
              <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-slate-700 shadow-inner relative z-10">
                <Map
                  reports={reports as any}
                  refreshReports={fetchAssigned}
                  userPosition={userPosition}
                  votingStates={{}}
                  loggedInUserId=''
                  onVote={async () => { return; }}
                />
              </div>
              
              <div className="mt-5 p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                {userPosition ? (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <p className="text-slate-300 text-sm font-mono">
                      <strong className="text-emerald-400">Telemetry Active:</strong> Broadcasting live coordinates to Command Center.
                    </p>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <p className="text-slate-400 text-sm font-mono">
                      Acquiring GPS lock... Ensure location services are enabled on this terminal.
                    </p>
                  </>
                )}
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
            animation: fade-in-up 0.4s ease-out forwards;
          }
        `}</style>
      </div>
    </RoleGuard>
  );
}