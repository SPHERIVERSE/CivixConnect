'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NotificationBell from '@/components/NotificationBell';
import api from '@/utils/axiosInstance';
import RoleGuard from '@/components/RoleGuard';

interface WasteBid {
  id: string;
  amount: number;
  message?: string;
  status: string;
  createdAt: string;
  bidder: { id: string; name: string; businessType?: string };
}

interface WasteListing {
  id: string;
  wasteType: string;
  title: string;
  description?: string;
  imageUrl?: string;
  weight: number;
  price?: number;
  latitude: number;
  longitude: number;
  status: string;
  createdAt: string;
  soldAt?: string;
  seller: { id: string; name: string; avatarUrl?: string };
  buyer?: { id: string; name: string; businessType?: string };
  bids?: WasteBid[];
}

const WASTE_TYPES = [
  'PLASTIC', 'PAPER', 'METAL', 'GLASS', 'ORGANIC', 'ELECTRONIC', 'TEXTILE', 'OTHER',
];

export default function BusinessMarketplacePage() {
  const router = useRouter();
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [pastDeals, setPastDeals] = useState<WasteListing[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    wasteType: '',
    minWeight: '',
    maxWeight: '',
    radiusKm: '50',
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Modal & Bid States
  const [showBidModal, setShowBidModal] = useState<string | null>(null);
  const [showBidsModal, setShowBidsModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<WasteListing | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    api.get('/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCurrentUserId(res.data.id))
      .catch(() => router.push('/auth/login'));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => console.error('Location access denied')
      );
    }
    fetchPastDeals();
    fetchListings();
  }, [router]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const params: any = {};
      if (filters.wasteType) params.wasteType = filters.wasteType;
      if (filters.minWeight) params.minWeight = filters.minWeight;
      if (filters.maxWeight) params.maxWeight = filters.maxWeight;
      if (location && filters.radiusKm) {
        params.latitude = location.lat;
        params.longitude = location.lng;
        params.radiusKm = filters.radiusKm;
      }

      const response = await api.get('/marketplace/listings', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setListings(response.data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location || filters.wasteType) fetchListings();
  }, [filters, location]);

  const fetchPastDeals = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get('/marketplace/past-deals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPastDeals(response.data);
    } catch (error) {
      console.error('Failed to fetch past deals:', error);
    }
  };

  const handlePlaceBid = async (listingId: string) => {
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      alert('Invalid bid valuation');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      await api.post(`/marketplace/listings/${listingId}/bid`, {
        amount: parseFloat(bidAmount),
        message: bidMessage || undefined,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Bid protocol executed. Seller has been notified.');
      setShowBidModal(null);
      setBidAmount('');
      setBidMessage('');
      fetchListings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to place bid');
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  return (
    <RoleGuard role="BUSINESS">
      <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
        
        {/* Tech Background Effects */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in-up">
          
          {/* Header */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <button onClick={() => router.back()} className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Resource <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Exchange Marketplace</span></h1>
                <p className="text-slate-400 text-sm">Corporate procurement terminal for bulk material assets.</p>
              </div>
            </div>
            {currentUserId && <NotificationBell userId={currentUserId} />}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 p-1 bg-slate-900/50 border border-slate-800 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Active Assets ({listings.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'past' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Executed Contracts ({pastDeals.length})
            </button>
          </div>

          {/* Filtering Logic */}
          {activeTab === 'active' && (
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Procurement Filters</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Asset Classification</label>
                  <select
                    value={filters.wasteType}
                    onChange={(e) => setFilters({ ...filters, wasteType: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="">All Materials</option>
                    {WASTE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Min Mass (kg)</label>
                  <input
                    type="number"
                    value={filters.minWeight}
                    onChange={(e) => setFilters({ ...filters, minWeight: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-700 focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Max Mass (kg)</label>
                  <input
                    type="number"
                    value={filters.maxWeight}
                    onChange={(e) => setFilters({ ...filters, maxWeight: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-700 focus:ring-2 focus:ring-blue-500"
                    placeholder="Any"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Proximity (km)</label>
                  <input
                    type="number"
                    value={filters.radiusKm}
                    onChange={(e) => setFilters({ ...filters, radiusKm: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-700 focus:ring-2 focus:ring-blue-500"
                    placeholder="50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Listing Grid Rendering */}
          {loading ? (
            <div className="py-20 flex flex-col items-center">
              <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
              <p className="text-slate-500 font-mono text-xs">Decrypting market data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeTab === 'active' ? listings : pastDeals).map((listing) => {
                const distance = location ? calculateDistance(location.lat, location.lng, listing.latitude, listing.longitude) : null;
                const isPast = activeTab === 'past';

                return (
                  <div key={listing.id} className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 hover:border-blue-500/40 transition-all group flex flex-col">
                    <div className="relative w-full h-48 mb-4 overflow-hidden rounded-2xl bg-slate-950 border border-slate-800">
                      {listing.imageUrl ? (
                        <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-800"><svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                      )}
                      <div className="absolute top-3 left-3 px-2 py-1 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg text-[10px] font-bold text-blue-400 uppercase tracking-widest">{listing.wasteType}</div>
                      {distance && <div className="absolute top-3 right-3 px-2 py-1 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-lg text-[10px] font-bold text-slate-400">📍 {distance} KM</div>}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors">{listing.title}</h3>
                    <p className="text-slate-400 text-xs mb-4 line-clamp-2 leading-relaxed">{listing.description}</p>
                    
                    <div className="mt-auto space-y-3">
                      <div className="flex justify-between items-end p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Net Mass</p>
                          <p className="text-lg font-bold text-white">{listing.weight} <span className="text-xs text-slate-500">kg</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Est. Value</p>
                          <p className="text-lg font-bold text-emerald-400">₹{listing.price || '0'}<span className="text-xs text-slate-500">/kg</span></p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs px-1 text-slate-500 font-mono">
                        <span>Node: {isPast ? listing.buyer?.name : listing.seller.name}</span>
                        {isPast && <span>{new Date(listing.soldAt!).toLocaleDateString()}</span>}
                      </div>

                      {!isPast && (
                        <div className="grid grid-cols-2 gap-3 pt-2">
                           <button onClick={() => { setSelectedListing(listing); setShowBidsModal(true); }} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors">
                            Bids ({listing.bids?.length || 0})
                           </button>
                           <button onClick={() => setShowBidModal(listing.id)} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
                            Execute Bid
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bid Input Modal */}
          {showBidModal && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white tracking-tight">Place Valuation Bid</h2>
                  <button onClick={() => { setShowBidModal(null); setBidAmount(''); setBidMessage(''); }} className="text-slate-500 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Total Offer Amount (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 font-mono text-xl"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Procurement Message (Optional)</label>
                    <textarea
                      value={bidMessage}
                      onChange={(e) => setBidMessage(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 resize-none h-24"
                      placeholder="Logistics or acquisition notes..."
                    />
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setShowBidModal(null)} className="flex-1 px-4 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold hover:bg-slate-700">Abort</button>
                    <button onClick={() => handlePlaceBid(showBidModal)} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/20">Execute Bid</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View Bids Modal */}
          {showBidsModal && selectedListing && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in-up flex flex-col">
                <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white tracking-tight">Bid Registry: <span className="text-blue-400">"{selectedListing.title}"</span></h2>
                  <button onClick={() => { setShowBidsModal(false); setSelectedListing(null); }} className="text-slate-500 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 bg-slate-900/40 flex-1">
                  {selectedListing.bids && selectedListing.bids.length > 0 ? (
                    selectedListing.bids.map((bid) => (
                      <div key={bid.id} className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-white">{bid.bidder.name}</h4>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">{bid.bidder.businessType || 'ENTITY'}</p>
                          {bid.message && <p className="text-xs text-slate-400 mt-2 italic">"{bid.message}"</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-400 font-mono">₹{bid.amount}</p>
                          <p className="text-[10px] text-slate-600 mt-1 font-mono uppercase">{new Date(bid.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center text-slate-500 font-mono text-sm">No bid data found for this asset.</div>
                  )}
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