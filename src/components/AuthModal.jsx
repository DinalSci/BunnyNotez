import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNextIndexNumber } from '../services/api';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  GraduationCap,
  Eye,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AuthModal = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('student'); // 'student' | 'admin'

  // Form states
  const [name, setName] = useState('');
  const [emailOrIndex, setEmailOrIndex] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [batch, setBatch] = useState('2026 A/L');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [previewIndex, setPreviewIndex] = useState('BN001');

  useEffect(() => {
    setPreviewIndex(getNextIndexNumber());
  }, [isRegister]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim() || !email.trim() || !password.trim()) {
          throw new Error('Please fill in all required fields.');
        }
        const res = await register({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          batch
        });
        
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        setSuccessMsg(`Welcome ${res.user.name}! Your Student Index is ${res.index_no}`);
      } else {
        if (!emailOrIndex.trim() || !password.trim()) {
          throw new Error('Please enter your credentials.');
        }
        await login(emailOrIndex.trim(), password, role);
      }
    } catch (err) {
      setError(err.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (identifier, pass, selectedRole) => {
    setRole(selectedRole);
    setEmailOrIndex(identifier);
    setPassword(pass);
    setIsRegister(false);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Decorative Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-300/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-400 via-teal-400 to-sky-400 p-1 shadow-xl shadow-emerald-200/50 mb-3 animate-float">
            <div className="w-full h-full bg-white/95 rounded-[20px] flex items-center justify-center text-3xl">
              🐰
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 via-teal-700 to-sky-700 bg-clip-text text-transparent">
            Bunny Notes
          </h1>
          <p className="text-slate-500 text-sm mt-1">Study Group Portal • Biology, Chemistry, Physics</p>
        </div>

        {/* Main Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-white/80 relative overflow-hidden">
          
          {/* Top Role Selector */}
          {!isRegister && (
            <div className="flex bg-slate-100/80 p-1 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => { setRole('student'); setError(''); }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  role === 'student'
                    ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Login</span>
              </button>
              <button
                type="button"
                onClick={() => { setRole('admin'); setError(''); }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  role === 'admin'
                    ? 'bg-white text-sky-700 shadow-sm border border-sky-100'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Login</span>
              </button>
            </div>
          )}

          {/* Form Header */}
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800">
              {isRegister ? 'Student Registration' : role === 'student' ? 'Student Sign In' : 'Admin Sign In'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRegister 
                ? 'Create your account & get an auto-generated Index Number'
                : 'Enter your credentials to access study papers & marks'
              }
            </p>
          </div>

          {/* Error / Success Alerts */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-medium text-rose-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-medium text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegister && (
              <>
                {/* Index Auto-Assigned Banner */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                    <div>
                      <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Your Assigned Index</div>
                      <div className="text-xs text-emerald-600">Generated on submit</div>
                    </div>
                  </div>
                  <span className="font-mono text-base font-extrabold px-3 py-1 bg-emerald-500 text-white rounded-xl shadow-sm">
                    {previewIndex}
                  </span>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. Kasun Perera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-sm text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      placeholder="e.g. kasun@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-sm text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Phone & Batch Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp No</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="tel"
                        placeholder="0771234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-2xl glass-input text-sm text-slate-800 placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">A/L Batch</label>
                    <select
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl glass-input text-sm text-slate-800"
                    >
                      <option value="2025 A/L">2025 A/L</option>
                      <option value="2026 A/L">2026 A/L</option>
                      <option value="2027 A/L">2027 A/L</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {!isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {role === 'student' ? 'Student Index (e.g. BN001) or Email' : 'Admin Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder={role === 'student' ? 'BN001 or student@gmail.com' : 'admin@bunnynotes.com'}
                    value={emailOrIndex}
                    onChange={(e) => setEmailOrIndex(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-sm text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl glass-input text-sm text-slate-800 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 shadow-lg shadow-emerald-500/25 transition transform active:scale-98 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Complete Registration' : 'Sign In to Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Register / Login */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            {isRegister ? (
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setError(''); }}
                  className="font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Sign In
                </button>
              </p>
            ) : (
              role === 'student' && (
                <p className="text-xs text-slate-500">
                  New student to Bunny Notes?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsRegister(true); setError(''); }}
                    className="font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    Register Here (Get Index No)
                  </button>
                </p>
              )
            )}
          </div>

          {/* Quick Demo Logins for easy testing */}
          <div className="mt-5 p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/70">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>1-Click Demo Accounts</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('BN001', 'password123', 'student')}
                className="text-left p-2 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200/80 transition text-xs"
              >
                <div className="font-bold text-slate-800">Kasun (BN001)</div>
                <div className="text-[10px] text-emerald-600 font-mono">Student Demo</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('BN002', 'password123', 'student')}
                className="text-left p-2 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200/80 transition text-xs"
              >
                <div className="font-bold text-slate-800">Nethmi (BN002)</div>
                <div className="text-[10px] text-emerald-600 font-mono">Top Ranker</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@bunnynotes.com', 'admin123', 'admin')}
                className="col-span-2 text-left p-2 rounded-xl bg-white hover:bg-sky-50 border border-slate-200/80 transition text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-800">Admin Danushka</div>
                  <div className="text-[10px] text-sky-600 font-mono">admin@bunnynotes.com</div>
                </div>
                <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold rounded-lg">Admin Demo</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
