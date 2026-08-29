import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Award,
  Lock,
  Mail,
  User,
  Building,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { UserRole } from '../../types/user';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, loginAsDemoUser } = useAuth();

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ATTENDEE');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [isAgeAttested, setIsAgeAttested] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (authMode === 'REGISTER' && !isAgeAttested) {
      setErrorMsg('You must confirm you are 18 years of age or older to register on Sheba.');
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'LOGIN') {
        const loggedUser = await login(email, password);
        if (loggedUser.role === 'ORGANIZER') {
          navigate('/organizer');
        } else if (loggedUser.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/app/events');
        }
      } else {
        const registeredUser = await register({
          email,
          password,
          full_name: fullName,
          role: selectedRole,
          organization: selectedRole === 'ORGANIZER' ? organization : undefined,
        });
        setSuccessMsg('Account created successfully! Verification email dispatched.');
        setTimeout(() => {
          if (registeredUser.role === 'ORGANIZER') {
            navigate('/organizer');
          } else {
            navigate('/app/events');
          }
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    loginAsDemoUser(role);
    if (role === 'ORGANIZER') {
      navigate('/organizer');
    } else if (role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/app/events');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#63474D] flex items-center justify-center text-[#FFA686] mx-auto shadow-xs">
          <Award className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl font-extrabold text-[#2D1F23]">
          {authMode === 'LOGIN' ? 'Sign in to Sheba' : 'Create Sheba Account'}
        </h1>
        <p className="text-xs text-[#756366]">
          One account, one role. Verifiable attendance and credentials for Ethiopia.
        </p>
      </div>

      {/* Role Selector Tabs */}
      <div className="flex bg-[#F4EFEB] p-1 rounded-xl border border-[#E8DDD7]">
        <button
          type="button"
          onClick={() => setSelectedRole('ATTENDEE')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            selectedRole === 'ATTENDEE'
              ? 'bg-[#63474D] text-white shadow-xs'
              : 'text-[#756366] hover:text-[#2D1F23]'
          }`}
        >
          Attendee Account
        </button>
        <button
          type="button"
          onClick={() => setSelectedRole('ORGANIZER')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            selectedRole === 'ORGANIZER'
              ? 'bg-[#63474D] text-white shadow-xs'
              : 'text-[#756366] hover:text-[#2D1F23]'
          }`}
        >
          Organizer Account
        </button>
      </div>

      {/* Mode Switch (Sign in vs Register) */}
      <div className="flex border-b border-[#E8DDD7] text-xs font-bold text-center">
        <button
          type="button"
          onClick={() => {
            setAuthMode('LOGIN');
            setErrorMsg(null);
          }}
          className={`flex-1 pb-2 border-b-2 transition-colors ${
            authMode === 'LOGIN'
              ? 'border-[#63474D] text-[#63474D]'
              : 'border-transparent text-[#756366] hover:text-[#2D1F23]'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode('REGISTER');
            setErrorMsg(null);
          }}
          className={`flex-1 pb-2 border-b-2 transition-colors ${
            authMode === 'REGISTER'
              ? 'border-[#63474D] text-[#63474D]'
              : 'border-transparent text-[#756366] hover:text-[#2D1F23]'
          }`}
        >
          Register New Account
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8DDD7] shadow-xs space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode === 'REGISTER' && (
            <div>
              <label className="block text-xs font-bold text-[#2D1F23] mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756366]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Abebe Kebede"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
                />
              </div>
            </div>
          )}

          {authMode === 'REGISTER' && selectedRole === 'ORGANIZER' && (
            <div>
              <label className="block text-xs font-bold text-[#2D1F23] mb-1">
                Community or Organization Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756366]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. GDG Addis, ALX Tech Community"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#2D1F23] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756366]" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D1F23] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756366]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
              />
            </div>
          </div>

          {authMode === 'REGISTER' && (
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#756366]">
                <input
                  type="checkbox"
                  checked={isAgeAttested}
                  onChange={(e) => setIsAgeAttested(e.target.checked)}
                  className="mt-0.5 rounded text-[#63474D] focus:ring-[#63474D]"
                />
                <span>
                  I confirm that I am <strong>18 years of age or older</strong>, and agree to Sheba&apos;s Terms of Service and Privacy Policy.
                </span>
              </label>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            variant="primary"
            isLoading={isLoading}
            className="mt-2"
          >
            {authMode === 'LOGIN'
              ? `Sign In as ${selectedRole === 'ORGANIZER' ? 'Organizer' : 'Attendee'}`
              : `Register as ${selectedRole === 'ORGANIZER' ? 'Organizer' : 'Attendee'}`}
          </Button>
        </form>
      </div>

      {/* Fast Demo Access Quick-links */}
      <div className="bg-[#F4EFEB] p-4 rounded-2xl border border-[#E8DDD7] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#2D1F23] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FFA686]" />
            Instant Demo Account Sign-In
          </span>
          <Badge variant="tertiary">Quick Test</Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleDemoLogin('ATTENDEE')}
            className="py-1.5 px-2 bg-white rounded-xl border border-[#E8DDD7] text-[11px] font-bold text-[#63474D] hover:bg-[#63474D] hover:text-white transition-colors"
          >
            Attendee
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('ORGANIZER')}
            className="py-1.5 px-2 bg-white rounded-xl border border-[#E8DDD7] text-[11px] font-bold text-[#63474D] hover:bg-[#63474D] hover:text-white transition-colors"
          >
            Organizer
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('ADMIN')}
            className="py-1.5 px-2 bg-white rounded-xl border border-[#E8DDD7] text-[11px] font-bold text-[#63474D] hover:bg-[#63474D] hover:text-white transition-colors"
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
};
