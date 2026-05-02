'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/axiosInstance';
import NotificationBell from '@/components/NotificationBell';
import RoleGuard from '@/components/RoleGuard';
import { useRouter } from 'next/navigation';

type Role = 'ADMIN' | 'WORKER' | 'CITIZEN' | 'BUSINESS';
interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  totalXp: number;
  createdAt: string;
  avatarUrl?: string;
  stats: {
    reportsCreated: number;
    postsCreated: number;
    followersCount: number;
    followingCount: number;
  };
  notifications: Array<{
    id: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | 'ALL'>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const params = selectedRole !== 'ALL' ? { role: selectedRole } : {};
      const response = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      
      // Compute core stats (stripped of deprecated training/course modules)
      const usersWithStats = response.data.map((user: any) => {
        const reportsCreated = user.civicReports?.length || 0;
        const postsCreated = user.posts?.length || 0;
        const followersCount = user.followers?.length || 0;
        const followingCount = user.following?.length || 0;

        return {
          ...user,
          stats: {
            reportsCreated,
            postsCreated,
            followersCount,
            followingCount,
          },
        };
      });
      
      setUsers(usersWithStats);
    } catch (error) {
      console.error('Failed to fetch network nodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (userId: string, message: string) => {
    try {
      const token = localStorage.getItem('access_token');
      await api.post(`/users/${userId}/notify`, 
        { message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Transmission dispatched successfully!');
      setShowNotificationModal(false);
      setNotificationMessage('');
    } catch (error) {
      console.error('Failed to dispatch transmission:', error);
      alert('Failed to dispatch transmission');
    }
  };

  const updateUserRole = async (userId: string, newRole: Role) => {
    try {
      const token = localStorage.getItem('access_token');
      await api.put(`/users/${userId}/role`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Node authorization level updated successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Failed to update node authorization:', error);
      alert('Failed to update node authorization');
    }
  };

  useEffect(() => {
    fetchUsers();

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
  }, [selectedRole]);

  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-900/30 text-red-400 border-red-800';
      case 'WORKER': return 'bg-amber-900/30 text-amber-400 border-amber-800';
      case 'BUSINESS': return 'bg-emerald-900/30 text-emerald-400 border-emerald-800';
      case 'CITIZEN': return 'bg-cyan-900/30 text-cyan-400 border-cyan-800';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getLevelFromXp = (xp: number) => {
    return Math.floor(Math.sqrt(xp / 50)) + 1;
  };

  if (loading) {
    return (
      <RoleGuard role="ADMIN">
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400 font-medium animate-pulse">Aggregating network nodes...</p>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard role="ADMIN">
      <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
        
        {/* Ambient Tech Glow */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in-up">
          
          {/* Header Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-indigo-900/30 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                  Network <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Nodes Registry</span>
                </h1>
                <p className="text-slate-400 text-sm">Monitor active identities, authorization levels, and telemetry across the CivixConnect platform.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => router.back()}
                className="px-5 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Return
              </button>
              <div className="bg-slate-950/50 p-2 rounded-2xl border border-slate-800">
                {currentUserId && <NotificationBell userId={currentUserId} />}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <label className="text-slate-400 font-semibold text-sm uppercase tracking-wider">Classification Filter:</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as Role | 'ALL')}
                className="flex-1 md:flex-none bg-slate-950 text-white rounded-xl px-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none min-w-[150px]"
              >
                <option value="ALL">All Nodes</option>
                <option value="ADMIN">Command (Admin)</option>
                <option value="WORKER">Field (Worker)</option>
                <option value="BUSINESS">Corporate (Business)</option>
                <option value="CITIZEN">Civilian (Citizen)</option>
              </select>
            </div>
            <div className="text-slate-400 text-sm font-mono bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800">
              Total Identities: <span className="font-bold text-cyan-400 ml-2">{users.length}</span>
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group shadow-lg"
                onClick={() => {
                  setSelectedUser(user);
                  setShowUserModal(true);
                }}
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-indigo-900/30 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-cyan-400 font-bold text-xl shadow-inner group-hover:scale-110 transition-transform">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-white font-bold text-lg truncate tracking-tight">{user.name}</h3>
                    <p className="text-slate-500 text-xs font-mono truncate">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/50">
                    <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Clearance</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2">
                    <span className="text-slate-400">Node Level:</span>
                    <span className="text-indigo-400 font-bold font-mono">
                      L{getLevelFromXp(user.totalXp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2">
                    <span className="text-slate-400">Experience (XP):</span>
                    <span className="text-cyan-400 font-bold font-mono">{user.totalXp}</span>
                  </div>

                  <div className="flex items-center justify-between p-2">
                    <span className="text-slate-400">Civic Reports:</span>
                    <span className="text-blue-400 font-bold font-mono">{user.stats?.reportsCreated ?? 0}</span>
                  </div>

                  {user.notifications && user.notifications.filter(n => !n.isRead).length > 0 && (
                    <div className="flex items-center justify-between p-2">
                      <span className="text-slate-400">Unread Comms:</span>
                      <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full text-xs font-bold">
                        {user.notifications.filter(n => !n.isRead).length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* User Detail Modal */}
          {showUserModal && selectedUser && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in-up">
                <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50 sticky top-0 z-10">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                    Identity Profile
                  </h2>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="p-6 space-y-8">
                  {/* User Info Header */}
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-indigo-900/30 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-cyan-400 font-bold text-3xl shadow-inner">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-2xl tracking-tight mb-1">{selectedUser.name}</h3>
                      <p className="text-slate-400 font-mono text-sm mb-3">{selectedUser.email}</p>
                      <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${getRoleColor(selectedUser.role)}`}>
                        {selectedUser.role} NODE
                      </span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-center">
                      <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Clearance</div>
                      <div className="text-indigo-400 font-bold text-xl font-mono">L{getLevelFromXp(selectedUser.totalXp)}</div>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-center">
                      <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total XP</div>
                      <div className="text-cyan-400 font-bold text-xl font-mono">{selectedUser.totalXp}</div>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-center">
                      <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Anomalies Logged</div>
                      <div className="text-blue-400 font-bold text-xl font-mono">{selectedUser.stats?.reportsCreated ?? 0}</div>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-center">
                      <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Network Posts</div>
                      <div className="text-emerald-400 font-bold text-xl font-mono">{selectedUser.stats?.postsCreated ?? 0}</div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
                    <h4 className="text-white font-bold mb-5 flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Command Overrides
                    </h4>
                    
                    <div className="space-y-6">
                      {/* Role Update */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Modify Classification Level</label>
                        <select
                          value={selectedUser.role}
                          onChange={(e) => updateUserRole(selectedUser.id, e.target.value as Role)}
                          className="w-full bg-slate-950 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                        >
                          <option value="CITIZEN">Civilian Node (Citizen)</option>
                          <option value="WORKER">Field Agent (Worker)</option>
                          <option value="BUSINESS">Corporate Entity (Business)</option>
                          <option value="ADMIN">Command Authority (Admin)</option>
                        </select>
                      </div>

                      {/* Send Notification Trigger */}
                      <button
                        onClick={() => setShowNotificationModal(true)}
                        className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md flex justify-center items-center gap-2"
                      >
                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        Transmit Direct Comms
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center pt-2">
                     <p className="text-xs text-slate-600 font-mono">Node Initialized: {new Date(selectedUser.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Modal */}
          {showNotificationModal && selectedUser && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    Dispatch Comms
                  </h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Target:</span>
                    <span className="text-cyan-400 font-mono text-sm">{selectedUser.name}</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Message Payload</label>
                    <textarea
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      placeholder="Input transmission data..."
                      className="w-full bg-slate-950 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      rows={4}
                    />
                  </div>

                  <div className="flex space-x-4 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setShowNotificationModal(false);
                        setNotificationMessage('');
                      }}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-xl transition-colors border border-slate-700"
                    >
                      Abort
                    </button>
                    <button
                      onClick={() => sendNotification(selectedUser.id, notificationMessage)}
                      disabled={!notificationMessage.trim()}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                    >
                      Dispatch
                    </button>
                  </div>
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