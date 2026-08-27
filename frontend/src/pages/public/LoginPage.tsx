import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  UserCheck,
  Building2,
  Lock,
  QrCode,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  LogIn,
  Mail,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import type { UserRole } from '../../types/user';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, loginAsDemoUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'attendee' | 'organizer'>('attendee');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const loggedUser = await login(email, password);
        if (loggedUser.role === 'ORGANIZER') navigate('/organizer');
        else if (loggedUser.role === 'ADMIN') navigate('/admin');
        else navigate('/app');
      } else {
        const regUser = await register({
          email,
          password,
          full_name: fullName,
          role,
          phone,
          organization,
        });
        if (regUser.role === 'ORGANIZER') navigate('/organizer');
        else if (regUser.role === 'ADMIN') navigate('/admin');
        else navigate('/app');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoRole: UserRole) => {
    setLoadingRole(demoRole);
    setTimeout(() => {
      loginAsDemoUser(demoRole);
      setLoadingRole(null);
      if (demoRole === 'ORGANIZER') {
        navigate('/organizer');
      } else if (demoRole === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/app');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col justify-between overflow-x-hidden">
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[650px]">
          
          {/* LEFT SIDE (Desktop Branding & Visuals) */}
          <div className="lg:col-span-5 bg-[#064638] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Background Gold & Green Ambient Orbs */}
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-[#D6A84F]/15 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-[#0B5D4B] rounded-full blur-3xl pointer-events-none"></div>

            {/* Brand Header */}
            <div className="relative z-10 space-y-6">
              <Link to="/" className="inline-flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-[#D6A84F] flex items-center justify-center text-[#064638] font-bold shadow-md">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-1">
                    SHEBA<span className="text-[#D6A84F]">.</span>
                  </span>
                  <span className="text-[10px] font-semibold text-[#D6A84F] tracking-wider -mt-1">
                    EVENT INFRASTRUCTURE
                  </span>
                </div>
              </Link>

              <div className="space-y-3 pt-4">
                <Badge variant="gold" icon={<Sparkles className="w-3.5 h-3.5" />}>
                  Ethiopia Tech Event Infrastructure
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  Run better tech events.{' '}
                  <span className="text-[#D6A84F] block">Prove the impact.</span>
                </h2>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Join software engineers, event hosts, and sponsors using digital QR tickets for instant door verification across Addis Ababa.
                </p>
              </div>
            </div>

            {/* Middle Event Entrance Check-in Visual */}
            <div className="relative z-10 my-8 bg-[#0B5D4B]/60 p-5 rounded-2xl border border-[#D6A84F]/30 space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#D6A84F] font-bold text-[11px]">ENTRANCE VERIFIED</span>
                <span className="text-emerald-200 text-[10px]">Instant 0.2s QR Scan</span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <div className="w-10 h-10 rounded-xl bg-[#D6A84F] text-[#064638] flex items-center justify-center font-bold flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">React & Modern Frontend Workshop</p>
                  <p className="text-[11px] text-gray-300">Abebe Kebede • @abebe_demo</p>
                </div>
              </div>
            </div>

            {/* Bottom Footer Info */}
            <div className="relative z-10 pt-4 border-t border-[#0B5D4B] flex items-center justify-between text-[11px] text-gray-300">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D6A84F]" />
                Identity Pass Verified
              </span>
              <span>v1.0 Real API</span>
            </div>
          </div>

          {/* RIGHT SIDE (Real Auth Form + Quick Demo Accounts) */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
            {/* Header & Tabs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 lg:hidden">
                  <div className="w-8 h-8 rounded-lg bg-[#0B5D4B] flex items-center justify-center text-white">
                    <QrCode className="w-4 h-4 text-[#D6A84F]" />
                  </div>
                  <span className="font-bold text-lg text-[#17211E]">SHEBA</span>
                </div>
                <Link to="/" className="text-xs font-semibold text-[#0B5D4B] hover:underline ml-auto">
                  ← Back to Home
                </Link>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17211E]">
                    {mode === 'login' ? 'Sign In to Sheba' : 'Create an Account'}
                  </h1>
                  <p className="text-xs text-[#66736E]">
                    {mode === 'login' ? 'Access your tickets, events, and reports' : 'Join the Sheba tech event community'}
                  </p>
                </div>

                <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mode === 'login' ? 'bg-white text-[#064638] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mode === 'register' ? 'bg-white text-[#064638] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* REAL AUTHENTICATION FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#17211E] mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Abebe Bikila"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#064638] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#17211E] mb-1">Account Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#064638] focus:outline-none bg-white"
                      >
                        <option value="attendee">Attendee</option>
                        <option value="organizer">Organizer</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#17211E] mb-1">Phone Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="+251911234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#064638] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#17211E] mb-1">Organization / Hub</label>
                      <input
                        type="text"
                        placeholder="Addis Tech Hub"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#064638] focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#17211E] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="user@sheba.et"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#064638] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211E] mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#064638] focus:outline-none"
                  />
                </div>
              </div>

              <Button
                type="submit"
                isLoading={loading}
                variant="primary"
                className="w-full py-2.5 text-xs font-bold"
                icon={mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              >
                {mode === 'login' ? 'Sign In with Real API' : 'Register Real Account'}
              </Button>
            </form>

            {/* QUICK DEMO CARDS FOR TESTING */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
                  Quick Demo Access
                </span>
                <span className="text-[10px] text-gray-400">Skip email login for instant review</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('ATTENDEE')}
                  disabled={loadingRole !== null}
                  className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all flex flex-col items-center gap-1 text-center"
                >
                  <UserCheck className="w-4 h-4 text-[#0B5D4B]" />
                  <span className="text-[11px] font-bold text-[#17211E]">Attendee</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('ORGANIZER')}
                  disabled={loadingRole !== null}
                  className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-amber-50 hover:border-amber-300 transition-all flex flex-col items-center gap-1 text-center"
                >
                  <Building2 className="w-4 h-4 text-[#D6A84F]" />
                  <span className="text-[11px] font-bold text-[#17211E]">Organizer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('ADMIN')}
                  disabled={loadingRole !== null}
                  className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-slate-100 hover:border-slate-300 transition-all flex flex-col items-center gap-1 text-center"
                >
                  <Lock className="w-4 h-4 text-slate-700" />
                  <span className="text-[11px] font-bold text-[#17211E]">Admin</span>
                </button>
              </div>
            </div>

            {/* Bottom Footer Disclaimer */}
            <div className="text-center pt-2">
              <span className="text-[11px] text-[#66736E]">
                Sheba Event Infrastructure Platform • Powered by Express & PostgreSQL
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
