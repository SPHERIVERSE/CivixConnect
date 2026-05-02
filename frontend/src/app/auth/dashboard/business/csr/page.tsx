'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NotificationBell from '@/components/NotificationBell';
import RoleGuard from '@/components/RoleGuard';
import api from '@/utils/axiosInstance';

interface CSRFund {
  id: string;
  title: string;
  description?: string;
  amount: number;
  allocatedAmount: number;
  createdAt: string;
  allocations: any[];
}

export default function CorporateCSRPage() {
  const router = useRouter();
  const [funds, setFunds] = useState<CSRFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
  });

  const [allocateData, setAllocateData] = useState({
    amount: '',
    purpose: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    api
      .get('/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setCurrentUserId(res.data.id))
      .catch(() => router.push('/auth/login'));

    fetchFunds();
  }, [router]);

  const fetchFunds = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get('/business/csr-funds', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFunds(response.data);
    } catch (error) {
      console.error('Failed to fetch funds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Invalid capital amount');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      await api.post('/business/csr-funds', {
        title: formData.title,
        description: formData.description || undefined,
        amount: parseFloat(formData.amount),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Corporate capital fund initiated successfully!');
      setShowCreateModal(false);
      setFormData({ title: '', description: '', amount: '' });
      fetchFunds();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to initiate fund');
    }
  };

  const handleAllocate = async (fundId: string) => {
    if (!allocateData.amount || parseFloat(allocateData.amount) <= 0) {
      alert('Invalid disbursement amount');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');

      await api.post(`/business/csr-funds/${fundId}/allocate`, {
        amount: parseFloat(allocateData.amount),
        purpose: allocateData.purpose || undefined,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Capital disbursed successfully!');
      setShowAllocateModal(null);

      setAllocateData({
        amount: '',
        purpose: '',
      });

      fetchFunds();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to disburse capital');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <RoleGuard role="BUSINESS">
      <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
        
        {/* Ambient Tech Glow */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in-up">
          
          {/* Header Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.back()}
                className="p-3 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors text-slate-300 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                  Corporate <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Resource Allocations</span>
                </h1>
                <p className="text-slate-400 text-sm">Manage and disburse Corporate Social Responsibility (CSR) capital.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Initiate Capital Fund
              </button>
              <div className="bg-slate-950/50 p-2 rounded-2xl border border-slate-800 hidden sm:block">
                {currentUserId && <NotificationBell userId={currentUserId} />}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 flex flex-col items-center">
              <svg className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mb-4"></svg>
              <p className="text-slate-400 font-mono text-sm">Querying active allocations...</p>
            </div>
          ) : funds.length === 0 ? (
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-16 text-center border border-slate-800 shadow-xl">
              <svg className="w-16 h-16 mx-auto text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
              <h3 className="text-2xl font-bold text-white mb-2">No Capital Funds Initialized</h3>
              <p className="text-slate-400 mb-6 font-mono text-sm">Deploy your first CSR fund to begin capital distribution.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-slate-800 text-emerald-400 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                Initiate Fund
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {funds.map((fund) => {
                const utilization = (fund.allocatedAmount / fund.amount) * 100;
                const isExhausted = fund.allocatedAmount >= fund.amount;

                return (
                  <div
                    key={fund.id}
                    className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-slate-800 hover:border-emerald-500/30 transition-all shadow-lg flex flex-col"
                  >
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">{fund.title}</h3>
                    {fund.description && (
                      <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                        {fund.description}
                      </p>
                    )}
                    
                    <div className="space-y-4 mb-6 flex-grow">
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                        <div className="flex justify-between text-xs font-mono mb-2">
                          <span className="text-slate-500 uppercase tracking-wider">Total Capital:</span>
                          <span className="text-white font-bold">{formatCurrency(fund.amount)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono mb-2">
                          <span className="text-slate-500 uppercase tracking-wider">Disbursed:</span>
                          <span className="text-emerald-400 font-bold">{formatCurrency(fund.allocatedAmount)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono mb-4">
                          <span className="text-slate-500 uppercase tracking-wider">Available:</span>
                          <span className="text-cyan-400 font-bold">{formatCurrency(fund.amount - fund.allocatedAmount)}</span>
                        </div>

                        <div className="relative w-full h-2 bg-slate-900 rounded-full overflow-hidden shadow-inner border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-1000"
                            style={{ width: `${utilization}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowAllocateModal(fund.id)}
                      disabled={isExhausted}
                      className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                        isExhausted 
                          ? 'bg-slate-950 border border-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-slate-800 hover:bg-emerald-900/40 border border-slate-700 hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300'
                      }`}
                    >
                      {isExhausted ? 'Capital Exhausted' : 'Disburse Capital'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --------------------------- */}
        {/* CREATE MODAL */}
        {/* --------------------------- */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in-up overflow-hidden">
              <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Initiate CSR Fund
                </h2>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <form onSubmit={handleCreateFund} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Fund Classification / Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                    placeholder="e.g. Urban Cleanup Initiative Q3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Fund Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none transition-colors"
                    placeholder="Details regarding the allocation intent..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Capital Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors font-mono"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    Initiate Fund
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --------------------------- */}
        {/* ALLOCATION MODAL */}
        {/* --------------------------- */}
        {showAllocateModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in-up overflow-hidden">
              <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Disburse Capital
                </h2>
                <button onClick={() => setShowAllocateModal(null)} className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAllocate(showAllocateModal);
                }}
                className="p-6 space-y-5"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Disbursement Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={allocateData.amount}
                    onChange={(e) => setAllocateData({ ...allocateData, amount: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors font-mono"
                    required
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Purpose of Disbursement</label>
                  <textarea
                    value={allocateData.purpose}
                    onChange={(e) => setAllocateData({ ...allocateData, purpose: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none transition-colors"
                    rows={3}
                    placeholder="Log the destination/purpose of this capital..."
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAllocateModal(null)}
                    className="flex-1 px-4 py-3 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    Execute Transfer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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