'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/axiosInstance';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('CITIZEN');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Business-specific fields
  const [licenseNo, setLicenseNo] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const sendOtp = async () => {
    if (!phone) return setMessage('Please enter your phone number');
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { phone });
      setOtpSent(true);
      setMessage('Security token dispatched successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to dispatch security token');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return setMessage('Please enter the security token');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        phone,
        token: otp,
      });
      if (!res.data.accessToken) {
        setMessage('Invalid security token');
        return;
      }
      setOtpVerified(true);
      setMessage('Identity verified. Please configure your access credentials.');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Identity verification failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) return setMessage('Please verify your identity first');
    if (!password || password !== confirmPassword)
      return setMessage('Security keys do not match');
    
    setLoading(true);
    try {
      const registerData: any = {
        name,
        email,
        phone,
        password,
        role,
      };
      
      if (role === 'BUSINESS') {
        registerData.licenseNo = licenseNo;
        registerData.businessType = businessType;
        registerData.address = address;
        registerData.city = city;
        registerData.state = state;
        registerData.pincode = pincode;
      }
      
      await api.post('/auth/register', registerData);
      setMessage('Node registration successful. Initializing login sequence...');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Registration sequence failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-2xl w-full space-y-8 p-10 backdrop-blur-xl bg-slate-900/60 rounded-3xl border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative z-10 transition-all duration-300">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-900/30 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Node Registration</h2>
          <p className="mt-2 text-slate-400 text-sm">Join the CivixConnect infrastructure network</p>
        </div>

        <form className="space-y-6" onSubmit={register}>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Primary Identifier (Full Name)</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Communication Channel (Email)</label>
              <input
                type="email"
                placeholder="node@civixconnect.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Access Level (Role)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none"
              >
                <option value="CITIZEN">Citizen / Civilian Node</option>
                <option value="WORKER">Infrastructure Worker</option>
                <option value="BUSINESS">Corporate / Institutional Entity</option>
              </select>
            </div>
            
            {/* Business-specific fields */}
            {role === 'BUSINESS' && (
              <div className="p-5 rounded-2xl bg-slate-800/30 border border-slate-700/50 space-y-5 mt-4">
                <h3 className="text-sm font-bold text-cyan-400 border-b border-slate-700 pb-2">Enterprise Configuration</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Entity Name *</label>
                  <input
                    type="text"
                    placeholder="Enter corporate or institute name"
                    value={name} // Note: Originally bound to 'name' in your code
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Registration ID *</label>
                  <input
                    type="text"
                    placeholder="Enter official license number"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sector Classification *</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none"
                    required
                  >
                    <option value="">Select entity classification</option>
                    <option value="Recycling Company">Recycling & Processing</option>
                    <option value="NGO">Non-Governmental Organization</option>
                    <option value="Educational Institute">Educational Institute</option>
                    <option value="Corporate">Corporate / Tech</option>
                    <option value="Government Organization">Government Department</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Physical Location *</label>
                  <textarea
                    placeholder="Enter headquarters address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    rows={2}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">City *</label>
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">State *</label>
                    <input
                      type="text"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Postal Code *</label>
                    <input
                      type="text"
                      placeholder="000000"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Secure Commlink (Phone)</label>
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
                  className="px-6 py-3 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50 whitespace-nowrap shadow-[0_0_15px_rgba(79,70,229,0.3)]"
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
                    placeholder="Enter 6-digit verification code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-cyan-700/50 bg-cyan-950/20 text-white placeholder-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors text-center tracking-widest text-lg font-mono"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={verifyOtp}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl font-semibold text-sm text-white bg-cyan-600 hover:bg-cyan-500 transition-colors disabled:opacity-50 whitespace-nowrap shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    {loading ? 'Verifying...' : 'Verify Node'}
                  </button>
                </div>
              </div>
            )}

            {otpVerified && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-5 pt-4 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Configure Access Key (Password)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm Access Key</label>
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
                  ) : 'Establish Connection'}
                </button>
              </div>
            )}
          </div>
          
          {message && (
            <div className={`p-4 rounded-xl text-sm border backdrop-blur-sm ${
              message.includes('successful') || message.includes('verified')
                ? 'bg-emerald-900/30 text-emerald-300 border-emerald-800'
                : 'bg-red-900/30 text-red-300 border-red-800'
            }`}>
              {message}
            </div>
          )}
        </form>

        <div className="text-center pt-4 border-t border-slate-800">
          <p className="text-sm text-slate-500">
            Node already registered?{' '}
            <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              Initialize session
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}