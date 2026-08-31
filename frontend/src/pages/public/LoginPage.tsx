import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import {
  Award,
  Lock,
  Mail,
  AlertCircle,
  Clock,
  ArrowLeft,
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
    setIsPendingNotice(false);
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
    <div className="min-h-[85vh] flex flex-col justify-center max-w-md mx-auto pt-28 sm:pt-32 pb-20 px-4 space-y-6">
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

        <div className="pt-3 text-center border-t border-[#E8DDD7] space-y-2">
          <p className="text-xs text-[#756366]">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#63474D] hover:underline">
              Register as Attendee or Organizer
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
    </div>
  );
};
