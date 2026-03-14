'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import axios from '@/utils/axiosInstance';
import RoleGuard from '@/components/RoleGuard';
import api from '@/utils/axiosInstance';
import 'leaflet/dist/leaflet.css';
import ReportCard from '@/components/ReportCard';
import { jwtDecode } from 'jwt-decode';
import Image from 'next/image';

const Map = dynamic(() => import('@/components/CivicMap'), { ssr: false });

const ISSUE_TYPE_OPTIONS = [
  // Legacy cleanliness issues
  { value: 'illegal_dumping', label: 'Illegal Dumping' },
  { value: 'open_toilet', label: 'Open Toilet' },
  { value: 'dirty_toilet', label: 'Dirty Toilet' },
  { value: 'overflow_dustbin', label: 'Overflowing Dustbin' },
  { value: 'dead_animal', label: 'Dead Animal' },
  { value: 'fowl', label: 'Foul Smell' },
  { value: 'public_bin_request', label: 'Request for Public Bin' },
  { value: 'public_toilet_request', label: 'Request for Public Toilet' },
  // New smart civic infrastructure issues (from ReportType enum)
  { value: 'POTHOLE', label: 'Pothole / Road Damage Spot' },
  { value: 'BROKEN_STREETLIGHT', label: 'Broken Streetlight' },
  { value: 'ROAD_DAMAGE', label: 'Road Damage / Cracks' },
  { value: 'WATER_LEAK', label: 'Water Leak / Pipe Burst' },
  { value: 'FALLEN_TREE', label: 'Fallen Tree / Blockage' },
  { value: 'BROKEN_FOOTPATH', label: 'Broken Footpath / Sidewalk' },
] as const;

export interface CivicReport {
  id: string;
  title: string;
  description: string;
  type: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  supportCount: number;
  oppositionCount: number;
  status: 'pending' | 'escalated' | 'assigned' | 'working' | 'resolved';
  createdAt: string;
  createdById: string;
  createdBy?: { id: string; name: string; role: string };
  assignedToWorker?: { id: string; name: string } | null;
  resolvedImageUrl?: string | null;
  resolvedNotes?: string | null;
  isOwnReport: boolean;
  userVote: 'support' | 'oppose' | null;
  hasVoted: boolean;
  canVote: boolean;
  
  // NEW: AI Triage & Triage fields
  aiDetectedType?: string;
  aiSeverityScore?: number;
  aiPriority?: string;
  aiSummary?: string;
  aiFlaggedAsSpam?: boolean;
  duplicateCount?: number;
}

const CivicReportPage = () => {
  const [myReports, setMyReports] = useState<CivicReport[]>([]);
  const [otherReports, setOtherReports] = useState<CivicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'MINE' | 'OTHERS'>('MINE');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [votingStates, setVotingStates] = useState<Record<string, boolean>>({});
  const [locationMessage, setLocationMessage] = useState<string>('Acquiring geospatial coordinates...');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decodedToken: { sub: string } = jwtDecode(token);
        setCurrentUserId(decodedToken.sub);
      } catch (error) {
        console.error('Failed to decode JWT:', error);
        setCurrentUserId(null);
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationMessage('✅ Geospatial lock acquired.');
        },
        (err) => {
          console.error('Geolocation error:', err);
          setLocationMessage('⚠️ Location access denied. Defaulting to sector center.');
          setPosition({ lat: 28.6139, lng: 77.2090 });
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setLocationMessage('⚠️ Geolocation not supported by node terminal.');
      setPosition({ lat: 28.6139, lng: 77.2090 });
    }

    fetchReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      const { data } = await axios.get('/civic-report/my-reports');
      setMyReports(data);
    } catch (err) {
      console.error('Failed to fetch my reports:', err);
      setMessage('Failed to synchronize local reports');
    }
  };

  const fetchOtherReports = async () => {
    try {
      const { data } = await axios.get('/civic-report/other-reports');
      setOtherReports(data);
    } catch (err) {
      console.error('Failed to fetch other reports:', err);
      setMessage('Failed to synchronize network reports');
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchMyReports(), fetchOtherReports()]);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (reportId: string, type: 'support' | 'oppose') => {
    const updatedReports = otherReports.map(report => {
      if (report.id === reportId) {
        const updatedReport = {
          ...report,
          hasVoted: true,
          userVote: type,
          canVote: false,
          supportCount: type === 'support' ? report.supportCount + 1 : report.supportCount,
          oppositionCount: type === 'oppose' ? report.oppositionCount + 1 : report.oppositionCount,
        };
        return updatedReport;
      }
      return report;
    });
    setOtherReports(updatedReports);

    try {
      await axios.post(`/civic-report/${reportId}/${type}`);
      setMessage(`✅ Protocol ${type.toUpperCase()} registered successfully.`);
      setTimeout(() => setMessage(null), 3000);
      fetchOtherReports();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to process ${type}`;
      setMessage(`❌ ${errorMessage}`);
      setTimeout(() => setMessage(null), 4000);
      fetchOtherReports();
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(null);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const photo = formData.get('photo');
    if (!(photo instanceof File) || !photo || photo.size === 0) {
      setMessage('❌ Visual evidence is required for AI triage processing.');
      return;
    }

    if (!position) {
      setMessage('❌ Awaiting geospatial lock. Cannot submit structural anomaly.');
      return;
    }

    formData.append('latitude', position.lat.toString());
    formData.append('longitude', position.lng.toString());

    try {
      await axios.post('/civic-report', formData);
      setMessage('✅ Anomaly submitted. Swavi AI is analyzing your report...');
      formRef.current?.reset();
      setPhotoPreview(null);
      await fetchMyReports();
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Transmission failed';
      setMessage(`❌ ${errorMessage}`);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const renderReports = (reports: CivicReport[]) => {
    if (loading) return (
      <div className="flex justify-center items-center py-12">
        <svg className="animate-spin h-8 w-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    );
    if (reports.length === 0) return <p className="text-slate-500 text-center py-12 font-mono">No infrastructure anomalies detected in this sector.</p>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
        {reports.map(report => (
          <ReportCard
            key={report.id}
            report={report}
            handleVote={handleVote}
            votingStates={votingStates}
          />
        ))}
      </div>
    );
  };

  return (
    <RoleGuard role="CITIZEN">
      <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-50">
        
        {/* Animated Tech Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          
          {/* Header Card */}
          <div className="animate-fade-in-down">
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-900/30 border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)] flex-shrink-0">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
                  Infrastructure <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Reporting Node</span>
                </h1>
                <p className="text-slate-400 text-sm">
                  Submit structural anomalies. Swavi AI will analyze visual evidence, score severity, and route to appropriate city protocols.
                </p>
              </div>
            </div>
          </div>

          {/* Alert Message */}
          {message && (
            <div className={`animate-fade-in-up p-4 rounded-xl border text-sm font-medium backdrop-blur-sm ${
              message.includes('✅') 
                ? 'bg-emerald-900/30 border-emerald-800 text-emerald-300' 
                : 'bg-red-900/30 border-red-800 text-red-300'
            }`}>
              {message}
            </div>
          )}

          {/* Submission Form */}
          <div className="animate-fade-in-up">
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Log New Anomaly
              </h2>
              <div className="mb-6">
                <p className={`text-xs font-mono tracking-wider uppercase ${
                  locationMessage.includes('✅') ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {locationMessage}
                </p>
              </div>

              <form ref={formRef} onSubmit={handleSubmitReport} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject / Title</label>
                    <input
                      type="text"
                      name="title"
                      placeholder="e.g. Massive Pothole on Main St."
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Anomaly Classification</label>
                    <select
                      name="type"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none"
                      defaultValue=""
                    >
                      <option value="" disabled className="text-slate-500">Select Issue Type</option>
                      {ISSUE_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contextual Details</label>
                  <textarea
                    name="description"
                    placeholder="Provide additional context for the AI and dispatch units..."
                    required
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Visual Evidence (Required)</label>
                  {photoPreview && (
                    <div className="relative w-full md:w-1/2 lg:w-1/3 h-48 rounded-xl overflow-hidden border border-slate-700 mb-4 bg-slate-950">
                      <Image
                        src={photoPreview}
                        alt="Evidence Preview"
                        layout="fill"
                        objectFit="cover"
                        className="opacity-90 hover:opacity-100 transition-opacity"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    required
                    onChange={handlePhotoChange}
                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 file:transition-colors cursor-pointer"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!position}
                    className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(37,99,235,0.4)] flex justify-center items-center"
                  >
                    Transmit to City Network
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Database Viewer */}
          <div className="animate-fade-in-up">
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
              
              {/* Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-950/50">
                <button
                  className={`flex-1 py-5 px-6 text-center font-semibold text-sm tracking-wide uppercase transition-all duration-300 ${
                    activeTab === 'MINE'
                      ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                      : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                  }`}
                  onClick={() => setActiveTab('MINE')}
                >
                  My Nodes ({myReports.length})
                </button>
                <button
                  className={`flex-1 py-5 px-6 text-center font-semibold text-sm tracking-wide uppercase transition-all duration-300 ${
                    activeTab === 'OTHERS'
                      ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400'
                      : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                  }`}
                  onClick={() => setActiveTab('OTHERS')}
                >
                  Global Network ({otherReports.length})
                </button>
              </div>

              {/* View Toggles for 'Others' */}
              {activeTab === 'OTHERS' && (
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-center space-x-3">
                  <button
                    className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                      viewMode === 'LIST'
                        ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                    onClick={() => { setViewMode('LIST'); setIsMapFullscreen(false); }}
                  >
                    Data Grid
                  </button>
                  <button
                    className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                      viewMode === 'MAP'
                        ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                    onClick={() => setViewMode('MAP')}
                  >
                    Geospatial Map
                  </button>
                  {viewMode === 'MAP' && (
                    <button
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        isMapFullscreen
                          ? 'bg-red-600/20 text-red-400 border border-red-500/50'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                      onClick={() => setIsMapFullscreen(!isMapFullscreen)}
                    >
                      {isMapFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    </button>
                  )}
                </div>
              )}

              {/* Sub-Filters for 'Mine' */}
              {activeTab === 'MINE' && (
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                      statusFilter === 'ALL'
                        ? 'bg-slate-800 border-slate-600 text-white'
                        : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    All ({myReports.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('PENDING')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                      statusFilter === 'PENDING'
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                        : 'bg-transparent border-slate-800 text-slate-500 hover:border-amber-500/30 hover:text-amber-400/70'
                    }`}
                  >
                    Pending ({myReports.filter(r => r.status !== 'resolved').length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('RESOLVED')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                      statusFilter === 'RESOLVED'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                        : 'bg-transparent border-slate-800 text-slate-500 hover:border-emerald-500/30 hover:text-emerald-400/70'
                    }`}
                  >
                    Resolved ({myReports.filter(r => r.status === 'resolved').length})
                  </button>
                </div>
              )}

              {/* Content Area */}
              <div className="p-6 md:p-8 bg-slate-900/40">
                {activeTab === 'MINE' ? (
                  renderReports(
                    statusFilter === 'ALL'
                      ? myReports
                      : statusFilter === 'PENDING'
                      ? myReports.filter(r => r.status !== 'resolved')
                      : myReports.filter(r => r.status === 'resolved')
                  )
                ) : viewMode === 'LIST' ? (
                  renderReports(otherReports)
                ) : (
                  <div
                    className={`w-full rounded-2xl overflow-hidden transition-all duration-300 shadow-xl border border-slate-700 ${
                      isMapFullscreen
                        ? 'fixed inset-0 z-50 rounded-none border-none'
                        : 'h-[600px] relative'
                    }`}
                  >
                    <Map
                      reports={otherReports}
                      refreshReports={fetchOtherReports}
                      userPosition={position}
                      loggedInUserId={currentUserId}
                      onVote={handleVote}
                      votingStates={votingStates}
                    />
                  </div>
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
};

export default CivicReportPage;