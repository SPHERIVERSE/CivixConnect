'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axiosInstance';
import RoleGuard from '@/components/RoleGuard';

interface CSRFund {
  id: string;
  title: string;
  description?: string;
  amount: number;
  allocatedAmount: number;
  createdAt: string;
  updatedAt: string;
  business: {
    id: string;
    name: string;
    email: string;
    businessType?: string;
  };
  allocations: Array<{
    id: string;
    amount: number;
    purpose: string;
    createdAt: string;
  }>;
}

export default function AdminCSRFundsPage() {
  const router = useRouter();
  const [funds, setFunds] = useState<CSRFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCSRFunds();
  }, []);

  const fetchCSRFunds = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/business/csr-funds/all');
      setFunds(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync corporate allocations');
      console.error('Error fetching CSR funds:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getUtilizationPercentage = (allocated: number, total: number) => {
    if (total === 0) return 0;
    return (allocated / total) * 100;
  };

  if (loading) {
    return (
      <RoleGuard role="ADMIN">
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400 font-medium animate-pulse">Querying financial registries...</p>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard role="ADMIN">
      <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
        
        {/* Ambient Tech Glow */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in-up">
          
          {/* Header Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-900/30 border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                  Corporate <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Resource Allocations</span>
                </h1>
                <p className="text-slate-400 text-sm">Monitor network economy and active Corporate Social Responsibility (CSR) funds.</p>
              </div>
            </div>
            
            <button
              onClick={() => router.back()}
              className="px-5 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Return
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-900/30 border border-red-800 text-red-300 rounded-xl font-medium backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Summary Stats */}
          {funds.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 flex flex-col justify-center shadow-lg">
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Committed Capital</div>
                <div className="text-3xl font-bold text-white font-mono tracking-tight">
                  {formatCurrency(funds.reduce((sum, fund) => sum + fund.amount, 0))}
                </div>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 flex flex-col justify-center shadow-lg">
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Dispersed</div>
                <div className="text-3xl font-bold text-cyan-400 font-mono tracking-tight">
                  {formatCurrency(funds.reduce((sum, fund) => sum + fund.allocatedAmount, 0))}
                </div>
              </div>
              <div className="bg-emerald-900/10 backdrop-blur-xl rounded-2xl p-6 border border-emerald-900/50 flex flex-col justify-center shadow-lg shadow-emerald-900/10">
                <div className="text-emerald-500/70 text-xs font-semibold uppercase tracking-wider mb-2">Available Liquidity</div>
                <div className="text-3xl font-bold text-emerald-400 font-mono tracking-tight">
                  {formatCurrency(
                    funds.reduce((sum, fund) => sum + (fund.amount - fund.allocatedAmount), 0)
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CSR Funds List */}
          {funds.length === 0 ? (
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-16 text-center border border-slate-800 shadow-xl">
              <svg className="w-16 h-16 mx-auto text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
              <p className="text-slate-400 font-mono text-lg">No corporate resource allocations detected in the network.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {funds.map((fund) => {
                const utilization = getUtilizationPercentage(fund.allocatedAmount, fund.amount);
                const available = fund.amount - fund.allocatedAmount;

                return (
                  <div
                    key={fund.id}
                    className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-slate-800 hover:border-emerald-900/50 transition-all shadow-lg group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
                    
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6 relative z-10">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{fund.title}</h3>
                        {fund.description && (
                          <p className="text-slate-400 text-sm mb-4 leading-relaxed">{fund.description}</p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="text-[10px] bg-blue-900/30 text-blue-400 border border-blue-800 px-3 py-1 rounded font-semibold uppercase tracking-wider flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            {fund.business.name}
                          </span>
                          {fund.business.businessType && (
                            <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-3 py-1 rounded font-semibold uppercase tracking-wider">
                              {fund.business.businessType}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right bg-slate-950/50 p-4 rounded-2xl border border-slate-800 min-w-[200px]">
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Fund Value</div>
                        <div className="text-3xl font-bold text-white font-mono tracking-tight">
                          {formatCurrency(fund.amount)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar Area */}
                    <div className="mb-6 relative z-10 bg-slate-950/40 p-5 rounded-2xl border border-slate-800/50">
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-slate-300 font-semibold text-sm">Capital Utilization</span>
                        <span className="text-emerald-400 font-mono text-sm font-bold">
                          {utilization.toFixed(1)}% 
                        </span>
                      </div>
                      <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden shadow-inner border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-1000 relative"
                          style={{ width: `${utilization}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs font-mono mt-3">
                        <span className="text-slate-500">Allocated: <span className="text-cyan-400 font-bold">{formatCurrency(fund.allocatedAmount)}</span></span>
                        <span className="text-slate-500">Available: <span className="text-emerald-400 font-bold">{formatCurrency(available)}</span></span>
                      </div>
                    </div>

                    {/* Allocations Breakdown */}
                    {fund.allocations.length > 0 && (
                      <div className="mt-6 relative z-10">
                        <h4 className="text-slate-300 font-semibold mb-4 flex items-center gap-2 text-sm">
                          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                          Disbursement Log
                        </h4>
                        <div className="space-y-3">
                          {fund.allocations.map((allocation) => (
                            <div
                              key={allocation.id}
                              className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="flex-1">
                                <p className="text-slate-200 font-medium text-sm">{allocation.purpose}</p>
                                <p className="text-slate-500 text-xs font-mono mt-1">
                                  {new Date(allocation.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <div className="text-emerald-400 font-semibold font-mono bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-900/50 whitespace-nowrap">
                                - {formatCurrency(allocation.amount)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-slate-800/50 flex flex-wrap gap-4 text-xs font-mono text-slate-600">
                      <span>ID: {fund.id.substring(0, 8)}</span>
                      <span>Initialized: {new Date(fund.createdAt).toLocaleDateString()}</span>
                      <span>Updated: {new Date(fund.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
      </div>
    </RoleGuard>
  );
}