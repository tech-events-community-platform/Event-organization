import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import {
  Award,
  Lock,
  Mail,
  User,
  Building,
  Phone,
  FileText,
  AlertCircle,
  Users,
  Briefcase,
  ArrowLeft,
} from 'lucide-react';
import type { UserRole } from '../../types/user';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, register } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('ATTENDEE');

  // Common fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Organizer-specific fields
  const [organization, setOrganization] = useState('');
  const [bio, setBio] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ORGANIZER') {
        navigate('/organizer', { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/app', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedRole === 'ORGANIZER' && !organization.trim()) {
      setErrorMsg('Please specify your organization or community name.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await register({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        role: selectedRole,
        organization: selectedRole === 'ORGANIZER' ? organization.trim() : undefined,
        phone: phone.trim() || undefined,
        bio: selectedRole === 'ORGANIZER' ? bio.trim() : undefined,
      });

      if (res.isPendingApproval || selectedRole === 'ORGANIZER') {
        // Redirect to pending approval page with 1-hour wait notice
        navigate('/pending-approval', {
          state: {
            email: email.trim(),
            name: fullName.trim(),
            organization: organization.trim(),
          },
        });
      } else {
        // Attendee: immediate direct access to attendee dashboard
        navigate('/app');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
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
          Create Your Account
        </h1>
        <p className="text-xs text-[#756366]">
          Join Ethiopia's single-day tech event community and earn verifiable credentials.
        </p>
      </div>

      {/* Account Type Switcher */}
      <div className="grid grid-cols-2 bg-[#F4EFEB] p-1.5 rounded-2xl border border-[#E8DDD7] gap-1.5">
        <button
          type="button"
          onClick={() => setSelectedRole('ATTENDEE')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            selectedRole === 'ATTENDEE'
              ? 'bg-[#63474D] text-white shadow-xs'
              : 'text-[#756366] hover:text-[#2D1F23]'
          }`}
        >
          <Users className="w-4 h-4" />
          Attendee
        </button>
        <button
          type="button"
          onClick={() => setSelectedRole('ORGANIZER')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            selectedRole === 'ORGANIZER'
              ? 'bg-[#63474D] text-white shadow-xs'
              : 'text-[#756366] hover:text-[#2D1F23]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Organizer
        </button>
      </div>

      {/* Organizer approval notification note */}
      {selectedRole === 'ORGANIZER' && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Admin Verification Required for Organizers</p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Once registered, your account will be sent to the Platform Admin for approval. You will be able to start hosting events once verified.
            </p>
          </div>
        </div>
      )}

      {/* Registration Form Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8DDD7] shadow-sm space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5">
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
                className="w-full pl-10 pr-3 py-2.5 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
              />
            </div>
          </div>

          {selectedRole === 'ORGANIZER' && (
            <div>
              <label className="block text-xs font-bold text-[#2D1F23] mb-1">
                Community or Organization Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756366]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. GDG Addis, ALX Tech Community"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
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
            <label className="block text-xs font-bold text-[#2D1F23] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756366]" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D1F23] mb-1">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756366]" />
              <input
                type="tel"
                placeholder="+2519..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
              />
            </div>
          </div>

          {selectedRole === 'ORGANIZER' && (
            <div>
              <label className="block text-xs font-bold text-[#2D1F23] mb-1">Organizer Bio / Description</label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3.5 top-3 text-[#756366]" />
                <textarea
                  rows={2}
                  placeholder="Tell attendees about your tech community and mission..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
                />
              </div>
            </div>
          )}


          <Button
            type="submit"
            fullWidth
            variant="primary"
            isLoading={isLoading}
            className="mt-3 py-3"
          >
            {selectedRole === 'ORGANIZER'
              ? 'Submit Organizer Registration'
              : 'Register as Attendee'}
          </Button>
        </form>

        <div className="pt-3 text-center border-t border-[#E8DDD7] space-y-2">
          <p className="text-xs text-[#756366]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#63474D] hover:underline">
              Sign in here
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
