'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axiosInstance';
import RoleGuard from '@/components/RoleGuard';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: any[];
  rewardAmount: number;
  cleanCoinReward: number;
  targetRole?: string;
  maxAttempts: number;
  startDate: string;
  endDate: string;
  status: string;
  organizer: {
    id: string;
    name: string;
    businessType?: string;
  };
  _count?: {
    participations: number;
  };
}

export default function WorkerQuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [userAttempts, setUserAttempts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/business/quizzes/active?role=WORKER');
      setQuizzes(response.data);
      
      const attempts: Record<string, number> = {};
      for (const quiz of response.data) {
        try {
          const participationRes = await api.get(`/business/quizzes/${quiz.id}/my-participation`);
          attempts[quiz.id] = participationRes.data?.attempts || 0;
        } catch {
          attempts[quiz.id] = 0;
        }
      }
      setUserAttempts(attempts);
    } catch (error) {
      console.error('Failed to sync protocol registry:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setAnswers(new Array(quiz.questions.length).fill(-1));
    setResult(null);
  };

  const submitQuiz = async () => {
    if (!selectedQuiz) return;

    setSubmitting(true);
    try {
      let correct = 0;
      selectedQuiz.questions.forEach((q: any, index: number) => {
        if (answers[index] === q.correctAnswer) {
          correct++;
        }
      });
      const score = (correct / selectedQuiz.questions.length) * 100;

      const response = await api.post(`/business/quizzes/${selectedQuiz.id}/participate`, {
        answers: answers.map((ans, idx) => ({
          questionIndex: idx,
          selectedAnswer: ans,
        })),
        score,
      });

      setResult({
        score,
        correct,
        total: selectedQuiz.questions.length,
        rewardEarned: response.data.rewardEarned,
        cleanCoinReward: score >= 70 ? selectedQuiz.cleanCoinReward : 0,
      });

      await fetchQuizzes();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit protocol data');
    } finally {
      setSubmitting(false);
    }
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const canAttempt = (quiz: Quiz) => {
    if (isExpired(quiz.endDate)) return false;
    if (quiz.status !== 'ACTIVE') return false;
    const attempts = userAttempts[quiz.id] || 0;
    return attempts < quiz.maxAttempts;
  };

  if (loading) {
    return (
      <RoleGuard role="WORKER">
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400 font-medium animate-pulse">Accessing knowledge registry...</p>
        </div>
      </RoleGuard>
    );
  }

  // ACTIVE QUIZ INTERFACE
  if (selectedQuiz && !result) {
    return (
      <RoleGuard role="WORKER">
        <div className="min-h-screen bg-slate-950 text-slate-50 p-6 relative">
          <div className="absolute inset-0 bg-amber-600/5 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">{selectedQuiz.title}</h2>
                  <p className="text-amber-400 text-sm font-mono mt-1">PROTOCOL IN PROGRESS</p>
                </div>
                <button
                  onClick={() => { setSelectedQuiz(null); setAnswers([]); }}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-red-400"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-8">
                {selectedQuiz.questions.map((q: any, qIndex: number) => (
                  <div key={qIndex} className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800 shadow-inner">
                    <h3 className="text-white font-semibold text-lg mb-6 flex gap-3">
                      <span className="text-amber-500 font-mono">{String(qIndex + 1).padStart(2, '0')}.</span>
                      {q.question}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((option: string, optIndex: number) => (
                        <label
                          key={optIndex}
                          className={`flex items-center p-4 rounded-xl cursor-pointer transition-all border-2 ${
                            answers[qIndex] === optIndex
                              ? 'bg-amber-900/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${qIndex}`}
                            checked={answers[qIndex] === optIndex}
                            onChange={() => {
                              const newAnswers = [...answers];
                              newAnswers[qIndex] = optIndex;
                              setAnswers(newAnswers);
                            }}
                            className="w-4 h-4 accent-amber-500 mr-4"
                          />
                          <span className={answers[qIndex] === optIndex ? 'text-white font-medium' : 'text-slate-300'}>
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={submitQuiz}
                disabled={submitting || answers.some(a => a === -1)}
                className="mt-10 w-full bg-amber-600 hover:bg-amber-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Transmitting Data...' : 'Submit Verification Protocol'}
              </button>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  // RESULTS INTERFACE
  if (result && selectedQuiz) {
    return (
      <RoleGuard role="WORKER">
        <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
              
              <h2 className="text-3xl font-bold text-white mb-2">Protocol Assessment</h2>
              <p className="text-slate-500 font-mono text-sm mb-8 uppercase tracking-widest">Verification Complete</p>
              
              <div className="relative inline-block mb-8">
                <div className={`text-7xl mb-4 ${result.score >= 70 ? 'text-emerald-400' : 'text-amber-500'}`}>
                  {result.score.toFixed(0)}%
                </div>
                <div className="text-slate-400 text-sm">
                  Precision Score: {result.correct} / {result.total}
                </div>
              </div>

              {result.score >= 70 ? (
                <div className="bg-emerald-900/20 rounded-2xl p-6 mb-8 border border-emerald-500/30">
                  <p className="text-emerald-400 font-bold mb-4 uppercase tracking-tighter">Incentive Eligibility Confirmed</p>
                  <div className="flex justify-center gap-6">
                    {result.rewardEarned > 0 && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">+{result.rewardEarned}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Experience XP</p>
                      </div>
                    )}
                    {result.cleanCoinReward > 0 && (
                      <div className="text-center border-l border-slate-800 pl-6">
                        <p className="text-2xl font-bold text-emerald-400">+{result.cleanCoinReward}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">CleanCoins CC</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-900/20 rounded-2xl p-6 mb-8 border border-amber-800/30">
                  <p className="text-amber-400 font-bold">Assessment Threshold Not Met</p>
                  <p className="text-slate-400 text-sm mt-2">A minimum score of 70% is required for reward distribution.</p>
                </div>
              )}

              <button
                onClick={() => { setSelectedQuiz(null); setResult(null); setAnswers([]); fetchQuizzes(); }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold transition-all border border-slate-700"
              >
                Return to Terminal
              </button>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  // MAIN LISTING INTERFACE
  return (
    <RoleGuard role="WORKER">
      <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto p-6 sm:p-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Knowledge <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Verification</span>
              </h1>
              <p className="text-slate-400 mt-2">Execute awareness protocols to maintain clearance and earn network incentives.</p>
            </div>
            <div className="text-xs font-mono text-slate-500 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">
              UPLINK STATUS: <span className="text-emerald-400 animate-pulse">STABLE</span>
            </div>
          </div>

          {quizzes.length === 0 ? (
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-20 text-center border border-slate-800 shadow-xl">
              <div className="w-20 h-20 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-800">
                <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <p className="text-slate-400 font-mono text-lg">No active verification protocols detected in your sector.</p>
              <p className="text-slate-600 text-sm mt-2">Operational directives will appear here when deployed by Command.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => {
                const expired = isExpired(quiz.endDate);
                const attempted = (userAttempts[quiz.id] || 0) >= quiz.maxAttempts;
                const canTake = canAttempt(quiz);

                return (
                  <div
                    key={quiz.id}
                    className={`bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border transition-all duration-300 flex flex-col ${
                      expired || attempted
                        ? 'border-slate-800 opacity-60 grayscale'
                        : 'border-slate-800 hover:border-amber-500/50 shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="px-3 py-1 bg-amber-900/20 text-amber-500 border border-amber-800/50 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        {quiz.organizer.name}
                      </div>
                      {expired && <span className="text-red-400 text-[10px] font-bold font-mono">EXPIRED</span>}
                      {attempted && !expired && <span className="text-emerald-400 text-[10px] font-bold font-mono">COMPLETE</span>}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">{quiz.title}</h3>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">{quiz.description}</p>

                    <div className="space-y-3 mb-6 flex-grow">
                      <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-slate-800/50 text-xs font-mono">
                        <span className="text-slate-500">REWARD MATRIX</span>
                        <span className="text-emerald-400 font-bold">{quiz.rewardAmount} XP / {quiz.cleanCoinReward} CC</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-mono px-1">
                        <span className="text-slate-500">EXPIRATION:</span>
                        <span className="text-slate-300">{new Date(quiz.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => startQuiz(quiz)}
                      disabled={!canTake}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        canTake
                          ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {expired ? 'Protocol Expired' : attempted ? 'Attempt Threshold Reached' : 'Initialize Protocol'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}