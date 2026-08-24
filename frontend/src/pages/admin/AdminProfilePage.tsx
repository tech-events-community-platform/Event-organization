import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, LogOut, Lock, User, Send, Settings } from 'lucide-react';

export const AdminProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'}
            alt="Admin Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-[#D6A84F] shadow-sm"
          />

          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <h1 className="text-2xl font-extrabold text-[#17211E]">
                {user?.name || 'Hanan Admin'}
              </h1>
              <Badge variant="gold" icon={<Lock className="w-3.5 h-3.5" />}>
                Administrator
              </Badge>
            </div>

            <p className="text-sm font-semibold text-[#0B5D4B] flex items-center justify-center sm:justify-start gap-1">
              <Send className="w-4 h-4" />
              {user?.telegramHandle || '@admin_demo'}
            </p>

            <p className="text-xs text-[#66736E] leading-relaxed">
              Sheba Platform System Administrator. Overseeing event verification nodes, community organizers, and infrastructure telemetry.
            </p>

            <div className="pt-2 flex items-center justify-center sm:justify-start gap-3 text-xs">
              <Badge variant="green">Account Status: Active</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Account Details Box */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 space-y-4 shadow-2xs">
        <h3 className="font-bold text-base text-[#17211E] flex items-center gap-2">
          <User className="w-4 h-4 text-[#0B5D4B]" />
          Admin Identity Parameters
        </h3>

        <div className="space-y-3 text-xs divide-y divide-gray-100">
          <div className="pt-2 flex justify-between">
            <span className="text-[#66736E]">Full Name</span>
            <span className="font-semibold text-[#17211E]">{user?.name || 'Hanan Admin'}</span>
          </div>
          <div className="pt-2 flex justify-between">
            <span className="text-[#66736E]">Telegram Identity</span>
            <span className="font-semibold text-[#0B5D4B]">{user?.telegramHandle || '@admin_demo'}</span>
          </div>
          <div className="pt-2 flex justify-between">
            <span className="text-[#66736E]">Access Level</span>
            <span className="font-bold text-[#D6A84F]">PLATFORM ADMINISTRATOR</span>
          </div>
          <div className="pt-2 flex justify-between">
            <span className="text-[#66736E]">System Status</span>
            <span className="font-semibold text-[#238B6E]">Active & Verified</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 space-y-4 shadow-2xs">
        <h3 className="font-bold text-base text-[#17211E] flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#0B5D4B]" />
          Platform Session Management
        </h3>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Link to="/admin">
            <Button variant="outline" size="sm" icon={<ShieldCheck className="w-4 h-4" />}>
              Back to Admin Dashboard
            </Button>
          </Link>
          <Button
            onClick={handleLogout}
            variant="danger"
            size="sm"
            icon={<LogOut className="w-4 h-4" />}
          >
            Log out of Admin Console
          </Button>
        </div>
      </div>
    </div>
  );
};
