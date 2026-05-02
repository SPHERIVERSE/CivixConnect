'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axiosInstance';
import RoleGuard from '@/components/RoleGuard';

interface Voucher {
  id: string;
  title: string;
  description?: string;
  cleanCoinCost: number;
  discountAmount?: number;
  discountPercent?: number;
  terms?: string;
  expiryDate?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REDEEMED' | 'CANCELLED';
  totalQuantity?: number;
  claimedCount: number;
  createdAt: string;
  _count?: {
    claims: number;
  };
}

interface FormData {
    title: string;
    description: string;
    cleanCoinCost: number;
    discountAmount: string;
    discountPercent: string;
    terms: string;
    expiryDate: string;
    totalQuantity: string;
    status: 'ACTIVE' | 'CANCELLED';
}

const initialFormData: FormData = {
    title: '',
    description: '',
    cleanCoinCost: 0,
    discountAmount: '',
    discountPercent: '',
    terms: '',
    expiryDate: '',
    totalQuantity: '',
    status: 'ACTIVE',
};

export default function BusinessVouchersPage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  useEffect(() => {
    fetchVouchers();
  }, []);

  const resetForm = () => {
      setFormData(initialFormData);
  };

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cleancoin/vouchers/business', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVouchers(res.data);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to sync incentive database');
    } finally {
      setLoading(false);
    }
  };

  const parseFormData = (data: FormData) => {
    return {
        ...data,
        cleanCoinCost: Number(data.cleanCoinCost),
        discountAmount: data.discountAmount ? Number(data.discountAmount) : null,
        discountPercent: data.discountPercent ? Number(data.discountPercent) : null,
        totalQuantity: data.totalQuantity ? Number(data.totalQuantity) : null,
        expiryDate: data.expiryDate || null,
    };
  };

  const handleCreate = async () => {
    setMessage(null);
    try {
      await api.post('/cleancoin/vouchers', parseFormData(formData), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('✅ Incentive asset deployed successfully!');
      setShowCreateModal(false);
      resetForm();
      await fetchVouchers();
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.message || 'Deployment failed'}`);
    }
  };

  const handleUpdate = async () => {
    if (!editingVoucher) return;
    setMessage(null);
    try {
      await api.put(`/cleancoin/vouchers/${editingVoucher.id}`, parseFormData(formData), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('✅ Incentive architecture updated.');
      setShowCreateModal(false);
      setEditingVoucher(null);
      resetForm();
      await fetchVouchers();
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.message || 'Update failed'}`);
    }
  };

  const handleDelete = async (voucherId: string) => {
    if (!confirm('Abort incentive protocol? This will change status to CANCELLED.')) return;
    setMessage(null);
    try {
      await api.delete(`/cleancoin/vouchers/${voucherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('✅ Incentive successfully decommissioned.');
      await fetchVouchers();
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.message || 'Decommission failed'}`);
    }
  };
  
  const handleEditClick = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setFormData({
        title: voucher.title,
        description: voucher.description || '',
        cleanCoinCost: voucher.cleanCoinCost,
        discountAmount: voucher.discountAmount?.toString() || '',
        discountPercent: voucher.discountPercent?.toString() || '',
        terms: voucher.terms || '',
        expiryDate: voucher.expiryDate ? new Date(voucher.expiryDate).toISOString().split('T')[0] : '',
        totalQuantity: voucher.totalQuantity?.toString() || '',
        status: voucher.status as 'ACTIVE' | 'CANCELLED',
    });
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <RoleGuard role="BUSINESS">
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400 font-medium animate-pulse">Synchronizing incentive registry...</p>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard role="BUSINESS">
      <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
        
        {/* Ambient Tech Glow */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in-up">
          
          {/* Header Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-teal-900/30 border border-teal-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                  Incentive <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Deployment</span>
                </h1>
                <p className="text-slate-400 text-sm">Design and distribute discount vouchers to incentivize civilian civic engagement.</p>
              </div>
            </div>
            
            <button
              onClick={() => { resetForm(); setEditingVoucher(null); setShowCreateModal(true); }}
              className="w-full md:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(20,184,166,0.4)] hover:shadow-[0_0_25px_rgba(20,184,166,0.6)] flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Deploy New Incentive
            </button>
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

          {/* Vouchers List */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Market Inventory ({vouchers.length})
              </h2>
            </div>
            
            <div className="p-6 min-h-[400px]">
              {vouchers.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center">
                  <svg className="w-16 h-16 text-slate-800 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  <p className="text-slate-500 font-mono">No incentive assets currently deployed in the network.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {vouchers.map((voucher) => (
                    <div 
                      key={voucher.id} 
                      className={`group p-5 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                        voucher.status === 'ACTIVE' 
                        ? 'bg-slate-950/50 border-slate-800 hover:border-teal-500/30 shadow-lg' 
                        : 'bg-slate-900/30 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-white truncate tracking-tight">{voucher.title}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${
                            voucher.status === 'ACTIVE' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800' : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}>
                            {voucher.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                          <div>
                            <p className="text-slate-600 uppercase tracking-tighter mb-0.5">Exchange Cost</p>
                            <p className="text-emerald-400 font-bold">{voucher.cleanCoinCost} CC</p>
                          </div>
                          <div>
                            <p className="text-slate-600 uppercase tracking-tighter mb-0.5">Asset Claims</p>
                            <p className="text-slate-300">{voucher.claimedCount} {voucher.totalQuantity ? `/ ${voucher.totalQuantity}` : '(Unlimited)'}</p>
                          </div>
                          <div className="hidden sm:block">
                            <p className="text-slate-600 uppercase tracking-tighter mb-0.5">Initialized</p>
                            <p className="text-slate-500">{new Date(voucher.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="hidden sm:block">
                            <p className="text-slate-600 uppercase tracking-tighter mb-0.5">Expiration</p>
                            <p className={voucher.expiryDate ? "text-amber-500" : "text-slate-600"}>
                              {voucher.expiryDate ? new Date(voucher.expiryDate).toLocaleDateString() : 'PERPETUAL'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                        <button
                          onClick={() => handleEditClick(voucher)}
                          disabled={voucher.status !== 'ACTIVE'}
                          className="flex-1 md:flex-none px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Modify
                        </button>
                        <button
                          onClick={() => handleDelete(voucher.id)}
                          disabled={voucher.status !== 'ACTIVE'}
                          className="flex-1 md:flex-none px-5 py-2.5 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-400 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Abort
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Create/Edit Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    {editingVoucher ? 'Modify Incentive' : 'Design New Incentive'}
                  </h2>
                  <button onClick={() => { setShowCreateModal(false); setEditingVoucher(null); resetForm(); }} className="text-slate-500 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Voucher Nomenclature / Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none transition-colors"
                        placeholder="e.g., 20% Off Electronics"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Exchange Valuation (CC)</label>
                      <input
                        type="number"
                        value={formData.cleanCoinCost}
                        onChange={(e) => setFormData({ ...formData, cleanCoinCost: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-emerald-400 font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Material Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                      placeholder="Detailed offer intelligence..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Discount Amount (₹)</label>
                      <input
                        type="number"
                        value={formData.discountAmount}
                        onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Discount Logic (%)</label>
                      <input
                        type="number"
                        value={formData.discountPercent}
                        onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                        max="100"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Inventory Limit</label>
                      <input
                        type="number"
                        value={formData.totalQuantity}
                        onChange={(e) => setFormData({ ...formData, totalQuantity: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                        placeholder="Unlimited"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Expiration Protocol</label>
                      <input
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Terms and Protocols</label>
                    <textarea
                      value={formData.terms}
                      onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                      placeholder="e.g., 'One per civilian node. Not valid for corporate reuse.'"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex gap-4">
                  <button
                    onClick={() => { setShowCreateModal(false); setEditingVoucher(null); resetForm(); }}
                    className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-xl transition-all"
                  >
                    Abort
                  </button>
                  <button
                    onClick={editingVoucher ? handleUpdate : handleCreate}
                    className="flex-1 px-4 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                  >
                    {editingVoucher ? 'Execute Update' : 'Authorize Deployment'}
                  </button>
                </div>
              </div>
            </div>
          )}
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