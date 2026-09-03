import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import {
  Award,
  Lock,
  Mail,
  User,
  AlertCircle,
  Clock,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  X,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect');
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  const { user, isAuthenticated, login, register } = useAuth();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPendingNotice, setIsPendingNotice] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (redirectTarget) {
        navigate(redirectTarget, { replace: true });
      } else if (user.role === 'ORGANIZER') {
        navigate('/organizer', { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/app', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, redirectTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsPendingNotice(false);
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        const loggedUser = await login(email.trim(), password);
        if (redirectTarget) {
          navigate(redirectTarget);
        } else if (loggedUser.role === 'ORGANIZER') {
          navigate('/organizer');
        } else if (loggedUser.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/app');
        }
      } else {
        // Create attendee account
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name.');
          setIsLoading(false);
          return;
        }

        await register({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          role: 'ATTENDEE',
        });

        // Context preserved: redirect right back to event registration form
        if (redirectTarget) {
          navigate(redirectTarget);
        } else {
          navigate('/app');
        }
      }
    } catch (err: any) {
      const message = err.message || 'Authentication failed. Please verify your credentials.';

      if (
        err.isPendingApproval ||
        message.toLowerCase().includes('1 hour') ||
        message.toLowerCase().includes('pending')
      ) {
        setIsPendingNotice(true);
        setErrorMsg('you will be using this sytem in 1 hour');
      } else {
        setErrorMsg(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setForgotSuccess(null);
    try {
      const res = await api.auth.forgotPassword(forgotEmail.trim());
      setForgotSuccess(res.message || 'Password reset link sent to your email.');
    } catch (err: any) {
      setForgotSuccess(err.message || 'If an account exists, a reset link has been dispatched.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-md mx-auto pt-24 sm:pt-28 pb-20 px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#63474D] flex items-center justify-center text-[#FFA686] mx-auto shadow-sm">
          <Award className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl font-extrabold text-[#2D1F23]">
          {authMode === 'login' ? 'Sign in to Sheba' : 'Create Attendee Account'}
        </h1>
        <p className="text-xs text-[#756366]">
          {redirectTarget
            ? "Sign in or create your account to proceed directly with your event registration."
            : "Verifiable attendance credentials and community tech events in Ethiopia."}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8DDD7] shadow-sm space-y-4">
        {/* Toggle Switch between Login and Sign Up (Section 2) */}
        <div className="flex bg-[#FAF7F5] p-1 rounded-2xl border border-[#E8DDD7]">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'login'
                ? 'bg-white text-[#2D1F23] shadow-xs'
                : 'text-[#756366] hover:text-[#2D1F23]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'signup'
                ? 'bg-white text-[#2D1F23] shadow-xs'
                : 'text-[#756366] hover:text-[#2D1F23]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Pending Approval Notice Banner */}
        {isPendingNotice && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2.5">
            <div className="flex items-center gap-2 font-bold">
              <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
              <span>Organizer Approval Pending</span>
            </div>
            <p className="text-[11px] text-amber-800">
              Your organizer registration has been received and is in the Admin verification queue.
            </p>
            <p className="font-extrabold text-xs text-[#63474D]">
              you will be using this sytem in 1 hour
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => navigate('/pending-approval', { state: { email } })}
              className="mt-1"
            >
              View Approval Status Screen
            </Button>
          </div>
        )}

        {errorMsg && !isPendingNotice && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-[#2D1F23] mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756366]" />
                <input
                  type="text"
                  required
                  placeholder="Abebe Bikila"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
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
                className="w-full pl-10 pr-3 py-2.5 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#2D1F23]">Password</label>
              {authMode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setShowForgotModal(true);
                  }}
                  className="text-[11px] font-semibold text-[#63474D] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756366]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
              />
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            variant="primary"
            isLoading={isLoading}
            className="mt-2 py-3"
          >
            {authMode === 'login' ? 'Sign In' : 'Create Account & Continue'}
          </Button>
        </form>

        <div className="pt-3 text-center border-t border-[#E8DDD7] space-y-2">
          <p className="text-xs text-[#756366]">
            Organizing an event?{' '}
            <Link
              to={`/register?role=ORGANIZER${redirectTarget ? `&redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
              className="font-bold text-[#63474D] hover:underline"
            >
              Register as Organizer
            </Link>
          </p>
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#756366] hover:text-[#2D1F23] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setShowForgotModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />
          <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 z-10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#63474D]" />
                <h3 className="font-serif font-bold text-base text-[#2D1F23]">Reset Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#756366]">
              Enter your registered email address to receive password reset instructions.
            </p>

            {forgotSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2">
                <p>{forgotSuccess}</p>
                <Button
                  size="sm"
                  fullWidth
                  variant="outline"
                  onClick={() => setShowForgotModal(false)}
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D1F23] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
                  />
                </div>
                <Button
                  type="submit"
                  fullWidth
                  variant="primary"
                  size="sm"
                  isLoading={forgotLoading}
                >
                  Send Reset Link
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
