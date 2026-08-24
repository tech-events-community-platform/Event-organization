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
} from 'lucide-react';
import type { UserRole } from '../../types/user';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsDemoUser } = useAuth();
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);

  const handleDemoLogin = (role: UserRole) => {
    setLoadingRole(role);
    setTimeout(() => {
      loginAsDemoUser(role);
      setLoadingRole(null);
      if (role === 'ORGANIZER') {
        navigate('/organizer');
      } else if (role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/app');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col justify-between overflow-x-hidden">
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          
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
              <span>v1.0 MVP</span>
            </div>
          </div>

          {/* RIGHT SIDE (Clean Direct Login Cards) */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-8">
            {/* Header */}
            <div className="space-y-2">
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

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17211E]">Sign In to Sheba</h1>
              <p className="text-xs text-[#66736E]">
                Select your account role to enter the Sheba platform.
              </p>
            </div>

            {/* DIRECT 1-CLICK ROLE ACCESSIBLE CARDS */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* ATTENDEE CARD */}
                <div className="bg-[#F7F8F5] p-5 rounded-2xl border border-gray-200 hover:border-[#0B5D4B] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="green" icon={<UserCheck className="w-3 h-3" />}>
                        ATTENDEE
                      </Badge>
                      <span className="text-xs font-bold text-[#17211E]">Abebe Kebede</span>
                    </div>
                    <p className="text-xs text-[#66736E]">Discover tech events & access digital QR ticket pass</p>
                  </div>
                  <Button
                    onClick={() => handleDemoLogin('ATTENDEE')}
                    isLoading={loadingRole === 'ATTENDEE'}
                    size="md"
                    variant="primary"
                    className="w-full sm:w-auto text-xs whitespace-nowrap"
                    icon={<LogIn className="w-4 h-4" />}
                  >
                    Sign In as Attendee
                  </Button>
                </div>

                {/* ORGANIZER CARD */}
                <div className="bg-[#F7F8F5] p-5 rounded-2xl border border-gray-200 hover:border-[#064638] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="gold" icon={<Building2 className="w-3 h-3" />}>
                        ORGANIZER
                      </Badge>
                      <span className="text-xs font-bold text-[#17211E]">Sara Tesfaye</span>
                    </div>
                    <p className="text-xs text-[#66736E]">Manage events, run door scanner & export sponsor reports</p>
                  </div>
                  <Button
                    onClick={() => handleDemoLogin('ORGANIZER')}
                    isLoading={loadingRole === 'ORGANIZER'}
                    size="md"
                    variant="accent"
                    className="w-full sm:w-auto text-xs whitespace-nowrap"
                    icon={<LogIn className="w-4 h-4" />}
                  >
                    Sign In as Organizer
                  </Button>
                </div>

                {/* ADMIN CARD */}
                <div className="bg-[#F7F8F5] p-5 rounded-2xl border border-gray-200 hover:border-slate-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="dark" icon={<Lock className="w-3 h-3" />}>
                        ADMIN
                      </Badge>
                      <span className="text-xs font-bold text-[#17211E]">Hanan Admin</span>
                    </div>
                    <p className="text-xs text-[#66736E]">Platform master dashboard, user & organizer management</p>
                  </div>
                  <Button
                    onClick={() => handleDemoLogin('ADMIN')}
                    isLoading={loadingRole === 'ADMIN'}
                    size="md"
                    variant="secondary"
                    className="w-full sm:w-auto text-xs whitespace-nowrap"
                    icon={<LogIn className="w-4 h-4" />}
                  >
                    Sign In as Admin
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom Footer Disclaimer */}
            <div className="text-center pt-4 border-t border-gray-100">
              <span className="text-[11px] text-[#66736E]">
                Sheba Event Infrastructure Platform • Direct Passwordless Access
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
