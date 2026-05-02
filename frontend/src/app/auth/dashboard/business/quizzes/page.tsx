'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NotificationBell from '@/components/NotificationBell';
import api from '@/utils/axiosInstance';
import RoleGuard from '@/components/RoleGuard';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: any[];
  rewardAmount: number;
  cleanCoinReward?: number;
  targetRole?: string;
  maxAttempts: number;
  startDate: string;
  endDate: string;
  status: string;
  participations: any[];
}

export default function QuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rewardAmount: '',
    cleanCoinReward: '',
    targetRole: '',
    maxAttempts: '1',
    startDate: '',
    endDate: '',
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }],
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    api.get('/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCurrentUserId(res.data.id))
      .catch(() => router.push('/auth/login'));

    fetchQuizzes();
  }, [router]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get('/business/quizzes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes(response.data);
    } catch (error) {
      console.error('Failed to sync quiz registry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return alert('Nomenclature required');
    if (!formData.rewardAmount || parseFloat(formData.rewardAmount) < 0) return alert('Invalid XP reward protocol');

    const validQuestions = formData.questions.filter(q => 
      q.question.trim() && 
      q.options.every(opt => opt.trim())
    );

    if (validQuestions.length === 0) return alert('Protocol requires at least one valid data point (question)');

    try {
      const token = localStorage.getItem('access_token');
      const formattedQuestions = validQuestions.map(q => ({
        question: q.question.trim(),
        options: q.options.map(opt => opt.trim()),
        correctAnswer: q.correctAnswer,
      }));

      await api.post('/business/quizzes', {
        ...formData,
        rewardAmount: parseFloat(formData.rewardAmount),
        cleanCoinReward: formData.cleanCoinReward ? parseInt(formData.cleanCoinReward) : 0,
        maxAttempts: parseInt(formData.maxAttempts) || 1,
        questions: formattedQuestions,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      alert('Quiz protocol deployed to draft registry.');
      setShowCreateModal(false);
      setFormData({
        title: '', description: '', rewardAmount: '', cleanCoinReward: '',
        targetRole: '', maxAttempts: '1', startDate: '', endDate: '',
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }],
      });
      fetchQuizzes();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Protocol deployment failed');
    }
  };

  const handleActivate = async (quizId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      await api.post(`/business/quizzes/${quizId}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Knowledge verification protocol is now LIVE.');
      fetchQuizzes();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Activation failed');
    }
  };

  const addQuestion = () => setFormData({ ...formData, questions: [...formData.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }] });
  const removeQuestion = (idx: number) => setFormData({ ...formData, questions: formData.questions.filter((_, i) => i !== idx) });
  const updateQuestion = (idx: number, field: string, val: any) => {
    const updated = [...formData.questions];
    updated[idx] = { ...updated[idx], [field]: val };
    setFormData({ ...formData, questions: updated });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-800 text-slate-400 border-slate-700';
      case 'ACTIVE': return 'bg-emerald-950/50 text-emerald-400 border-emerald-800';
      case 'COMPLETED': return 'bg-blue-950/50 text-blue-400 border-blue-800';
      default: return 'bg-red-950/50 text-red-400 border-red-800';
    }
  };

  return (
    <RoleGuard role="BUSINESS">
      <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
        
        {/* Tech Background Effects */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in-up">
          
          {/* Header Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <button onClick={() => router.back()} className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                  Incentive <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Engineering</span>
                </h1>
                <p className="text-slate-400 text-sm">Deploy knowledge verification protocols to drive civilian engagement and reward participation.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {currentUserId && <NotificationBell userId={currentUserId} />}
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Deploy Protocol
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center">
              <div className="animate-spin h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-slate-500 font-mono text-xs">Synchronizing quiz registry...</p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-20 text-center border border-slate-800 shadow-xl">
              <p className="text-slate-500 font-mono text-lg mb-6">No knowledge verification protocols detected.</p>
              <button onClick={() => setShowCreateModal(true)} className="px-8 py-3 bg-slate-800 text-cyan-400 border border-cyan-900/50 rounded-xl font-bold hover:bg-slate-700 transition-colors">
                Initialize First Protocol
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(quiz.status)}`}>
                      {quiz.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">ID: {quiz.id.substring(0, 8)}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight tracking-tight">{quiz.title}</h3>
                  <p className="text-slate-400 text-xs mb-6 line-clamp-2 leading-relaxed">{quiz.description}</p>
                  
                  <div className="space-y-3 mb-6 flex-grow">
                    <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Reward Matrix</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">
                        {quiz.rewardAmount} XP {quiz.cleanCoinReward ? `+ ${quiz.cleanCoinReward} CC` : ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Target Node</p>
                        <p className="text-xs font-bold text-blue-400">{quiz.targetRole || 'GLOBAL'}</p>
                      </div>
                      <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Participants</p>
                        <p className="text-xs font-bold text-white">{quiz.participations.length}</p>
                      </div>
                    </div>
                  </div>

                  {quiz.status === 'DRAFT' && (
                    <button
                      onClick={() => handleActivate(quiz.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20"
                    >
                      Activate Protocol
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Protocol Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in-up flex flex-col">
              <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                   <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                   New Knowledge Verification Protocol
                </h2>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleCreateQuiz} className="p-6 space-y-6 overflow-y-auto flex-1 bg-slate-900/40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Protocol Nomenclature *</label>
                      <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all" placeholder="e.g. Asset Segregation Awareness" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Target Node Role</label>
                      <select value={formData.targetRole} onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 outline-none appearance-none">
                        <option value="">All Functional Roles</option>
                        <option value="CITIZEN">Civilian Nodes Only</option>
                        <option value="WORKER">Field Agents Only</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">XP Yield *</label>
                        <input type="number" step="0.01" value={formData.rewardAmount} onChange={(e) => setFormData({ ...formData, rewardAmount: e.target.value })} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono" placeholder="0.00" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">CC Yield</label>
                        <input type="number" value={formData.cleanCoinReward} onChange={(e) => setFormData({ ...formData, cleanCoinReward: e.target.value })} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-mono" placeholder="0" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Attempt Threshold</label>
                      <input type="number" value={formData.maxAttempts} onChange={(e) => setFormData({ ...formData, maxAttempts: e.target.value })} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono" required />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Protocol Window (Start)</label>
                    <input type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Protocol Window (End)</label>
                    <input type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 outline-none" required />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-bold text-white uppercase tracking-widest">Question Matrix *</label>
                    <button type="button" onClick={addQuestion} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] font-bold rounded-lg border border-cyan-900/30 transition-all">+ Add Logic Point</button>
                  </div>
                  
                  <div className="space-y-6">
                    {formData.questions.map((q, index) => (
                      <div key={index} className="p-6 bg-slate-950/50 border border-slate-800 rounded-2xl relative group">
                        <div className="flex justify-between mb-4">
                           <span className="text-[10px] font-bold text-slate-600 uppercase">Logic Point #{index + 1}</span>
                           {formData.questions.length > 1 && <button type="button" onClick={() => removeQuestion(index)} className="text-red-500 text-[10px] font-bold uppercase hover:text-red-400">Decommission</button>}
                        </div>
                        <input type="text" value={q.question} onChange={(e) => updateQuestion(index, 'question', e.target.value)} placeholder="Enter query parameters..." className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white mb-4 focus:border-cyan-500 outline-none" required />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${q.correctAnswer === optIdx ? 'bg-cyan-900/20 border-cyan-500/50 shadow-inner shadow-cyan-950' : 'bg-slate-900 border-slate-800'}`}>
                              <input type="radio" name={`correct-${index}`} checked={q.correctAnswer === optIdx} onChange={() => updateQuestion(index, 'correctAnswer', optIdx)} className="w-4 h-4 accent-cyan-500 cursor-pointer" />
                              <input type="text" value={opt} onChange={(e) => { const updated = [...q.options]; updated[optIdx] = e.target.value; updateQuestion(index, 'options', updated); }} placeholder={`Variable ${optIdx + 1}`} className="bg-transparent text-sm text-white outline-none flex-1" required />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-800 sticky bottom-0 bg-slate-900/80 backdrop-blur-md pb-2">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold hover:bg-slate-700 transition-all">Abort Protocol</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-500 shadow-lg shadow-cyan-900/30 transition-all">Authorize Deployment</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </RoleGuard>
  );
}