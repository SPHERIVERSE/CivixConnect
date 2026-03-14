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
  status: string;
  totalQuantity?: number;
  claimedCount: number;
  createdAt: string;
  business: {
    id: string;
    name: string;
    businessType?: string;
    avatarUrl?: string;
  };
  _count?: {
    claims: number;
  };
}

export default function CitizenVoucherMarketplacePage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [myClaims, setMyClaims] = useState<any[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vouchersRes, claimsRes, balanceRes] = await Promise.all([
        api.get('/cleancoin/vouchers', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get('/cleancoin/claims', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get('/cleancoin/balance', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setVouchers(vouchersRes.data);
      setMyClaims(claimsRes.data);
      setBalance(balanceRes.data.balance || 0);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to sync voucher database');
    } finally {
      setLoading(false);
    }
  };

  const claimVoucher = async (voucherId: string) => {
    setClaimingId(voucherId);
    setMessage(null);
    try {
      await api.post(`/cleancoin/vouchers/${voucherId}/claim`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('✅ Incentive protocol executed successfully!');
      await fetchData(); 
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.message || 'Transaction failed'}`);
    } finally {
      setClaimingId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const isClaimed = (voucherId: string) => {
    return myClaims.some(claim => claim.voucherId === voucherId);
  };

  const isAvailable = (voucher: Voucher) => {
    if (voucher.status !== 'ACTIVE') return false;
    if (voucher.expiryDate && new Date(voucher.expiryDate) < new Date()) return false;
    if (voucher.totalQuantity && voucher.claimedCount >= voucher.totalQuantity) return false;
    return true;
  };

  if (loading) {
    return (
      <RoleGuard role="CITIZEN">
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 bg-slate-950">
          <svg className="animate-spin h-10 w-10 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400 font-medium animate-pulse">Querying corporate incentives...</p>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard role="CITIZEN">
      <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
        
        {/* Ambient Tech Glow */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
          
          {/* Header Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-teal-900/30 border border-teal-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                  Corporate <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">Incentives</span>
                </h1>
                <p className="text-slate-400 text-sm">Convert earned CleanCoins into real-world corporate vouchers.</p>
              </div>
            </div>
            
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 min-w-[160px]">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Available Wallet</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-white">{balance}</span>
                <span className="text-emerald-400 mb-1 text-sm font-bold">CC</span>
              </div>
            </div>
          </div>

          {message && (
            <div className={`mb-8 p-4 rounded-xl border text-sm font-medium backdrop-blur-sm animate-fade-in-up ${
              message.includes('✅') 
                ? 'bg-emerald-900/30 border-emerald-800 text-emerald-300' 
                : 'bg-red-900/30 border-red-800 text-red-300'
            }`}>
              {message}
            </div>
          )}

          {/* My Claims Section */}
          {myClaims.length > 0 && (
            <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Acquired Assets
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myClaims.map((claim) => (
                  <div key={claim.id} className="bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-teal-900/50 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-teal-600/5 rounded-bl-full pointer-events-none"></div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-white leading-tight">{claim.voucher.title}</h3>
                      <span className="px-2 py-1 bg-teal-900/30 text-teal-400 border border-teal-800 rounded text-[10px] font-bold uppercase tracking-wider">SECURED</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2">{claim.voucher.description}</p>
                    
                    <div className="space-y-3 pt-4 border-t border-slate-800/50">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-500">Corporate Entity:</span>
                        <span className="text-blue-400">{claim.voucher.business.name}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-500">Timestamp:</span>
                        <span className="text-slate-300">{new Date(claim.claimedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Authorization Code</span>
                        <span className="text-sm font-bold text-teal-400 font-mono tracking-widest">{claim.id.substring(0, 12).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Vouchers */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
               Active Exchange Market
            </h2>
            
            {vouchers.length === 0 ? (
              <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-16 text-center border border-slate-800 shadow-xl">
                <svg className="w-16 h-16 mx-auto text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                <p className="text-slate-400 font-mono">No corporate incentives currently available in the network.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vouchers.map((voucher) => {
                  const claimed = isClaimed(voucher.id);
                  const available = isAvailable(voucher);
                  const canAfford = balance >= voucher.cleanCoinCost;

                  return (
                    <div
                      key={voucher.id}
                      className={`bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border transition-all duration-300 flex flex-col ${
                        claimed
                          ? 'border-teal-900/30 opacity-70'
                          : available && canAfford
                          ? 'border-slate-700 hover:border-teal-500/50 shadow-lg hover:shadow-[0_0_30px_rgba(20,184,166,0.15)]'
                          : 'border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 pr-4">
                          <h3 className="text-lg font-bold text-white mb-2 leading-tight">{voucher.title}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] bg-blue-900/30 text-blue-400 border border-blue-800 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                              {voucher.business.name}
                            </span>
                            {voucher.business.businessType && (
                              <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded uppercase tracking-wider">
                                {voucher.business.businessType}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right bg-slate-950 p-2 rounded-xl border border-slate-800 min-w-[70px]">
                          <div className="text-xl font-bold text-emerald-400">{voucher.cleanCoinCost}</div>
                          <div className="text-[10px] font-bold text-emerald-500/70 uppercase">CC</div>
                        </div>
                      </div>

                      <p className="text-slate-400 text-sm mb-6 flex-grow">{voucher.description}</p>

                      {(voucher.discountAmount || voucher.discountPercent) && (
                        <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-3 mb-5">
                          <div className="text-amber-400 font-bold text-sm tracking-wide">
                            {voucher.discountPercent
                              ? `${voucher.discountPercent}% ALGORITHM DISCOUNT`
                              : `₹${voucher.discountAmount} FLAT DISCOUNT`}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 mb-6 font-mono text-xs text-slate-500 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                        {voucher.terms && (
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-600 uppercase tracking-wider text-[10px] font-bold">Protocol Terms</span>
                            <span className="text-slate-400 line-clamp-2">{voucher.terms}</span>
                          </div>
                        )}
                        <div className="flex justify-between mt-2 pt-2 border-t border-slate-800/50">
                          <span>Expires:</span>
                          <span className={voucher.expiryDate ? "text-slate-300" : "text-slate-600"}>
                            {voucher.expiryDate ? new Date(voucher.expiryDate).toLocaleDateString() : 'NO EXPIRY'}
                          </span>
                        </div>
                        {voucher.totalQuantity && (
                          <div className="flex justify-between">
                            <span>Inventory:</span>
                            <span className="text-cyan-400">{voucher.totalQuantity - voucher.claimedCount} units</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => claimVoucher(voucher.id)}
                        disabled={claimed || !available || !canAfford || claimingId === voucher.id}
                        className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex justify-center items-center gap-2 ${
                          claimed
                            ? 'bg-slate-900 border border-teal-900/50 text-teal-500 cursor-not-allowed'
                            : !available
                            ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
                            : !canAfford
                            ? 'bg-slate-900 border border-red-900/30 text-red-400 cursor-not-allowed'
                            : 'bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                        }`}
                      >
                        {claimed ? (
                          <>✓ Asset Secured</>
                        ) : !available ? (
                          <>Unavailable</>
                        ) : !canAfford ? (
                          <>Insufficient Funds (-{voucher.cleanCoinCost - balance} CC)</>
                        ) : claimingId === voucher.id ? (
                          <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Executing...</>
                        ) : (
                          <>Execute Claim</>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
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
      </div>
    </RoleGuard>
  );
}