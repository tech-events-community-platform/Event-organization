import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import {
  Lock,
  Mail,
  AlertCircle,
<<<<<<< HEAD
=======
  Clock,
  ArrowLeft,
>>>>>>> 04b4e5f (feat remove the demos)
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPendingNotice, setIsPendingNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
<<<<<<< HEAD
    setSuccessMsg(null);

    if (authMode === 'REGISTER' && !isAgeAttested) {
      setErrorMsg('You must confirm you are 18 years of age or older to register on Sheeba.');
      return;
    }

=======
    setIsPendingNotice(false);
>>>>>>> 04b4e5f (feat remove the demos)
    setIsLoading(true);

    try {
      const loggedUser = await login(email.trim(), password);
      if (loggedUser.role === 'ORGANIZER') {
        navigate('/organizer');
      } else if (loggedUser.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/app/events');
      }
    } catch (err: any) {
      const message = err.message || 'Authentication failed. Please verify your credentials.';
      
      // Check if organizer is pending approval
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

  return (
<<<<<<< HEAD
    <div className="max-w-md mx-auto pt-24 sm:pt-32 pb-16 px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 pt-2">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-sheeba-dark">
          {authMode === 'LOGIN' ? 'Sign in to Sheeba' : 'Create Sheeba Account'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-light">
          One account, one role. Verifiable attendance and credentials for Ethiopia.
=======
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      {/* Back to Home Button */}
      <div className="flex items-center justify-start">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#756366] hover:text-[#2D1F23] bg-white hover:bg-[#FAF7F5] px-3.5 py-1.5 rounded-full border border-[#E8DDD7] transition-all shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#63474D] flex items-center justify-center text-[#FFA686] mx-auto shadow-sm">
          <Award className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl font-extrabold text-[#2D1F23]">
          Sign in to Sheba
        </h1>
        <p className="text-xs text-[#756366]">
          Verifiable attendance credentials and community tech events in Ethiopia.
>>>>>>> 04b4e5f (feat remove the demos)
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8DDD7] shadow-sm space-y-4">
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
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
            <label className="block text-xs font-bold text-[#2D1F23] mb-1">Password</label>
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

<<<<<<< HEAD
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
                  I confirm that I am <strong>18 years of age or older</strong>, and agree to Sheeba&apos;s Terms of Service and Privacy Policy.
                </span>
              </label>
            </div>
          )}

=======
>>>>>>> 04b4e5f (feat remove the demos)
          <Button
            type="submit"
            fullWidth
            variant="primary"
            isLoading={isLoading}
            className="mt-2 py-3"
          >
            Sign In
          </Button>
        </form>

<<<<<<< HEAD
      {/* Fast Demo Access Quick-links */}
      <div className="bg-[#F4EFEB] p-4 rounded-2xl border border-[#E8DDD7] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#2D1F23]">
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
=======
        <div className="pt-3 text-center border-t border-[#E8DDD7] text-xs text-[#756366]">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[#63474D] hover:underline">
            Register as Attendee or Organizer
          </Link>
>>>>>>> 04b4e5f (feat remove the demos)
        </div>
      </div>
    </div>
  );
};
