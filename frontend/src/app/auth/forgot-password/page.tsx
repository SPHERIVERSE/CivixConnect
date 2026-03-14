'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/axiosInstance';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!phone) return setMessage('Please enter your phone number');
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { phone });
      setOtpSent(true);
      setMessage('Security token dispatched successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to dispatch token');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return setMessage('Please enter the security token');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { phone, token: otp });
      if (!res.data.success) {
        setMessage('Invalid security token');
        return;
      }
      setOtpVerified(true);
      setMessage('Token verified! Please configure your new access key.');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Token verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) return setMessage('Please verify identity token first');
    if (!newPassword || newPassword !== confirmPassword)
      return setMessage('Security keys do not match');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { phone, newPassword });
      setMessage('Access key reset successfully! Reinitializing login...');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to reset access key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full space-y-8 p-10 backdrop-blur-xl bg-slate-900/60 rounded-3xl border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative z-10 transition-all duration-300">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-900/30 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Recover Access</h2>
          <p className="mt-2 text-slate-400 text-sm">Reset your security key via secure commlink</p>
        </div>

        <form className="space-y-6" onSubmit={resetPassword}>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Registered Commlink (Phone)</label>
              <div className="flex space-x-3">
                <input
                  type="tel"
                  placeholder="+91 1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading || otpSent}
                  className="px-5 py-3 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50 whitespace-nowrap shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                >
                  {loading ? 'Transmitting...' : otpSent ? 'Dispatched' : 'Request Token'}
                </button>
              </div>
            </div>

            {otpSent && !otpVerified && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">Input Security Token</label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-cyan-700/50 bg-cyan-950/20 text-white placeholder-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors text-center tracking-widest text-lg font-mono"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={verifyOtp}
                    disabled={loading}
                    className="px-5 py-3 rounded-xl font-semibold text-sm text-white bg-cyan-600 hover:bg-cyan-500 transition-colors disabled:opacity-50 whitespace-nowrap shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    {loading ? 'Verifying...' : 'Verify Token'}
                  </button>
                </div>
              </div>
            )}

            {otpVerified && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-5 pt-4 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Configure New Key</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm New Key</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-semibold text-lg text-white bg-blue-600 hover:bg-blue-500 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] flex justify-center items-center mt-6"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Configuring...
                    </span>
                  ) : 'Reset Security Key'}
                </button>
              </div>
            )}
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm border backdrop-blur-sm ${
              message.includes('successful') || message.includes('verified') || message.includes('! Please')
                ? 'bg-emerald-900/30 text-emerald-300 border-emerald-800'
                : 'bg-red-900/30 text-red-300 border-red-800'
            }`}>
              {message}
            </div>
          )}
        </form>

        <div className="text-center pt-4 border-t border-slate-800">
          <p className="text-sm text-slate-500">
            Remembered your credentials?{' '}
            <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              Initialize session
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}