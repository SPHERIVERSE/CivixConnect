'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NotificationBell from '@/components/NotificationBell';
import api from '@/utils/axiosInstance';

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
  buyer?: { id: string; name: string; businessType?: string };
  bids?: WasteBid[];
}

const WASTE_TYPES = [
  'PLASTIC',
  'PAPER',
  'METAL',
  'GLASS',
  'ORGANIC',
  'ELECTRONIC',
  'TEXTILE',
  'OTHER',
];

export default function MarketplacePage() {
  const router = useRouter();
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [pastDeals, setPastDeals] = useState<WasteListing[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    wasteType: 'PLASTIC',
    title: '',
    description: '',
    weight: '',
    price: '',
    image: null as File | null,
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedListing, setSelectedListing] = useState<WasteListing | null>(null);
  const [showBidsModal, setShowBidsModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Get current user
    api.get('/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCurrentUserId(res.data.id))
      .catch(() => router.push('/auth/login'));

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => console.error('Location access denied')
      );
    }

    fetchListings();
    fetchPastDeals();
  }, [router]);

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

  const fetchBids = async (listingId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get(`/marketplace/listings/${listingId}/bids`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch bids:', error);
      return [];
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    if (!confirm('Execute transaction protocol? This will permanently close the asset listing.')) return;

    try {
      const token = localStorage.getItem('access_token');
      await api.post(`/marketplace/bids/${bidId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Transaction executed successfully!');
      setShowBidsModal(false);
      setSelectedListing(null);
      fetchListings();
    } catch (error: any) {
      console.error('Failed to accept bid:', error);
      alert(error.response?.data?.message || 'Failed to execute transaction');
    }
  };

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get('/marketplace/my-listings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings(response.data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      alert('Geospatial lock required to deploy asset listing.');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const formDataToSend = new FormData();
      formDataToSend.append('wasteType', formData.wasteType);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('weight', formData.weight);
      if (formData.price) formDataToSend.append('price', formData.price);
      formDataToSend.append('latitude', location.lat.toString());
      formDataToSend.append('longitude', location.lng.toString());
      if (formData.image) formDataToSend.append('image', formData.image);

      await api.post('/marketplace/listings', formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Asset deployed to network successfully!');
      setShowCreateModal(false);
      setFormData({
        wasteType: 'PLASTIC',
        title: '',
        description: '',
        weight: '',
        price: '',
        image: null,
      });
      fetchListings();
    } catch (error: any) {
      console.error('Failed to create listing:', error);
      alert(error.response?.data?.message || 'Failed to deploy asset');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-cyan-900/30 text-cyan-400 border-cyan-500/30';
      case 'SOLD':
        return 'bg-blue-900/30 text-blue-400 border-blue-500/30';
      case 'EXPIRED':
        return 'bg-slate-800 text-slate-400 border-slate-600';
      case 'CANCELLED':
        return 'bg-red-900/30 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
      
      {/* Ambient Tech Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-900/30 border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                Resource <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Exchange Network</span>
              </h1>
              <p className="text-slate-400 text-sm">Deploy raw material assets for corporate procurement and processing.</p>
            </div>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Deploy Asset
            </button>
          </div>
        </div>

        {/* Database Viewer */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-xl overflow-hidden mb-8">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/50">
            <button
              className={`flex-1 py-5 px-6 text-center font-semibold text-sm tracking-wide uppercase transition-all duration-300 ${
                activeTab === 'active'
                  ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
              }`}
              onClick={() => setActiveTab('active')}
            >
              Active Transmissions ({listings.length})
            </button>
            <button
              className={`flex-1 py-5 px-6 text-center font-semibold text-sm tracking-wide uppercase transition-all duration-300 ${
                activeTab === 'past'
                  ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
              }`}
              onClick={() => setActiveTab('past')}
            >
              Executed Contracts ({pastDeals.length})
            </button>
          </div>

          <div className="p-6 md:p-8 bg-slate-900/40 min-h-[400px]">
            {/* Content based on active tab */}
            {activeTab === 'past' ? (
              <div>
                {pastDeals.length === 0 ? (
                  <div className="text-center py-16">
                     <p className="text-slate-500 font-mono text-sm">No executed contracts found in local registry.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastDeals.map((deal) => (
                      <div key={deal.id} className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800 hover:border-blue-500/30 transition-all">
                        {deal.imageUrl && (
                          <div className="w-full h-40 relative rounded-xl overflow-hidden mb-4 border border-slate-800">
                            <img src={deal.imageUrl} alt={deal.title} className="w-full h-full object-cover opacity-80" />
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2 py-1 border text-[10px] font-bold uppercase tracking-wider rounded-md ${getStatusBadge('SOLD')}`}>
                            EXECUTED
                          </span>
                          <span className="text-slate-400 text-xs font-mono">{deal.wasteType}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 leading-tight">{deal.title}</h3>
                        
                        <div className="space-y-2 mt-4 text-sm font-mono text-slate-400 bg-slate-900 p-3 rounded-lg border border-slate-800">
                           <div className="flex justify-between"><span className="text-slate-500">Volume:</span><span className="text-white">{deal.weight} kg</span></div>
                           {deal.buyer && (
                             <div className="flex justify-between"><span className="text-slate-500">Entity:</span><span className="text-cyan-400 truncate ml-2">{deal.buyer.name}</span></div>
                           )}
                           {deal.bids && deal.bids.length > 0 && deal.bids[0] && (
                             <div className="flex justify-between"><span className="text-slate-500">Valuation:</span><span className="text-emerald-400">₹{deal.bids[0].amount}</span></div>
                           )}
                        </div>
                        {deal.soldAt && (
                          <p className="text-xs text-slate-600 mt-4 text-center">Timestamp: {new Date(deal.soldAt).toLocaleString()}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Listings Grid */}
                {loading ? (
                  <div className="text-center py-16 flex flex-col items-center">
                    <svg className="animate-spin h-8 w-8 text-cyan-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="text-slate-400 font-mono text-sm">Querying active assets...</p>
                  </div>
                ) : listings.length === 0 ? (
                  <div className="text-center py-16">
                     <p className="text-slate-500 font-mono text-sm">No active asset transmissions detected.</p>
                     <button onClick={() => setShowCreateModal(true)} className="mt-4 px-6 py-2 bg-slate-800 text-cyan-400 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                       Initialize First Deployment
                     </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                      <div key={listing.id} className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800 hover:border-cyan-500/30 transition-all shadow-lg flex flex-col">
                        {listing.imageUrl && (
                          <div className="w-full h-40 relative rounded-xl overflow-hidden mb-4 border border-slate-800">
                             <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2 py-1 border text-[10px] font-bold uppercase tracking-wider rounded-md ${getStatusBadge(listing.status)}`}>
                            {listing.status}
                          </span>
                          <span className="text-slate-400 text-xs font-mono">{listing.wasteType}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 leading-tight">{listing.title}</h3>
                        {listing.description && (
                          <p className="text-slate-400 text-xs mb-4 line-clamp-2">{listing.description}</p>
                        )}
                        
                        <div className="space-y-2 mt-auto text-sm font-mono text-slate-400 bg-slate-900 p-3 rounded-lg border border-slate-800 mb-4">
                           <div className="flex justify-between"><span className="text-slate-500">Volume:</span><span className="text-white">{listing.weight} kg</span></div>
                           {listing.price && (
                             <div className="flex justify-between"><span className="text-slate-500">Target/kg:</span><span className="text-emerald-400">₹{listing.price}</span></div>
                           )}
                        </div>

                        {listing.status === 'ACTIVE' && (
                          <button
                            onClick={async () => {
                              const bids = await fetchBids(listing.id);
                              setSelectedListing({ ...listing, bids });
                              setShowBidsModal(true);
                            }}
                            className="w-full bg-slate-800 border border-slate-700 hover:bg-cyan-900/40 hover:border-cyan-500/50 hover:text-cyan-400 text-slate-300 py-3 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                            View Corporate Proposals ({listing.bids?.length || 0})
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Listing Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in-up">
            <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                 Deploy Resource Asset
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {!location && (
                <div className="bg-amber-900/20 border border-amber-800/50 rounded-xl p-3 mb-4">
                  <p className="text-xs text-amber-400 font-mono text-center">
                    ⚠️ GEOSPATIAL LOCK REQUIRED TO DEPLOY LISTING
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Resource Type</label>
                  <select
                    value={formData.wasteType}
                    onChange={(e) => setFormData({ ...formData, wasteType: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    required
                  >
                    {WASTE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Asset Classification / Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Bulk Polycarbonate Scrap"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Material Specifications</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Provide technical details for acquiring entities..."
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mass Volume (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Valuation (₹/kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional Target"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Visual Assessment Data</label>
                <div className="border border-slate-700 border-dashed rounded-xl p-4 bg-slate-950/50 hover:bg-slate-950 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  disabled={!location}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                >
                  Execute Deployment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bids Modal */}
      {showBidsModal && selectedListing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in-up flex flex-col">
            <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-bold text-white tracking-tight">
                 Corporate Proposals: <span className="text-cyan-400">"{selectedListing.title}"</span>
              </h2>
              <button
                onClick={() => {
                  setShowBidsModal(false);
                  setSelectedListing(null);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-900/40">
              {selectedListing.bids && selectedListing.bids.length > 0 ? (
                <div className="space-y-4">
                  {selectedListing.bids.map((bid) => (
                    <div
                      key={bid.id}
                      className={`p-5 border rounded-2xl transition-all ${
                        bid.status === 'ACCEPTED' ? 'bg-cyan-900/20 border-cyan-500/30' :
                        bid.status === 'REJECTED' ? 'bg-red-900/20 border-red-500/30' :
                        'bg-slate-950/50 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-white text-lg">{bid.bidder.name}</h3>
                          {bid.bidder.businessType && (
                            <p className="text-xs font-mono text-cyan-400 mt-1">{bid.bidder.businessType}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-400 font-mono">₹{bid.amount}</p>
                          <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 border font-bold uppercase tracking-wider rounded ${
                            bid.status === 'ACCEPTED' ? 'bg-cyan-900/50 text-cyan-400 border-cyan-500/50' :
                            bid.status === 'REJECTED' ? 'bg-red-900/50 text-red-400 border-red-500/50' :
                            'bg-slate-800 text-slate-400 border-slate-600'
                          }`}>
                            {bid.status}
                          </span>
                        </div>
                      </div>
                      
                      {bid.message && (
                        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 mb-3">
                          <p className="text-sm text-slate-400 italic">"{bid.message}"</p>
                        </div>
                      )}
                      
                      <p className="text-xs text-slate-500 font-mono mt-2 mb-4">
                        Received: {new Date(bid.createdAt).toLocaleString()}
                      </p>
                      
                      {bid.status === 'PENDING' && (
                        <button
                          onClick={() => handleAcceptBid(bid.id)}
                          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Authorize Transaction
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500 font-mono">No corporate proposals received yet.</p>
                </div>
              )}
            </div>
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
  );
}