import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  User,
  Settings,
  Search,
  LogOut,
  Award,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Minimize2,
  Maximize2,
} from 'lucide-react';

interface AttendeeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AttendeeDrawer: React.FC<AttendeeDrawerProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!isOpen) return null;

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
      />

      {/* Drawer Panel */}
      <div
        className={`absolute inset-y-0 right-0 max-w-full flex transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-full sm:w-[480px]' : 'w-full sm:w-96'
        }`}
      >
        <div className="w-full bg-white shadow-2xl flex flex-col justify-between border-l border-gray-200">
          {/* Drawer Top Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg text-sheeba-dark">Account & Tools</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors hidden sm:inline-flex cursor-pointer"
                title={isExpanded ? 'Minimize drawer' : 'Expand drawer'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* User Profile Card */}
            <div className="p-4 rounded-2xl bg-[#faf8fb] border border-gray-200/80 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt={user?.name}
                  className="w-12 h-12 rounded-full object-cover border border-sheeba-rose/40"
                />
                <div className="space-y-0.5">
                  <h3 className="font-serif font-bold text-base text-sheeba-dark">{user?.name}</h3>
                  <p className="text-xs text-gray-500 font-light">{user?.email}</p>
                </div>
              </div>
              {user?.bio && (
                <p className="text-xs text-gray-600 font-light leading-relaxed pt-1 border-t border-gray-200/60">
                  {user.bio}
                </p>
              )}
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                <span className="flex items-center gap-1 text-[#2A7B5F] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Attendee
                </span>
                <span>Member since {user?.memberSince || '2026'}</span>
              </div>
            </div>

            {/* Quick Actions & Links */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-sheeba-rose px-1">
                Navigation & Profile
              </span>

              <Link
                to="/app/profile"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-sheeba-dark border border-transparent hover:border-gray-200/80 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sheeba-purple/10 text-sheeba-purple flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold block">Public Profile & Credentials</span>
                    <span className="text-[11px] text-gray-500 font-light">Share your verified badges publicly</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/app/settings"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-sheeba-dark border border-transparent hover:border-gray-200/80 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sheeba-rose/10 text-sheeba-rose flex items-center justify-center">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold block">Account Settings</span>
                    <span className="text-[11px] text-gray-500 font-light">Privacy, email, and password controls</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/search"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-sheeba-dark border border-transparent hover:border-gray-200/80 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sheeba-indigo/10 text-sheeba-indigo flex items-center justify-center">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold block">Discover Events & Badges</span>
                    <span className="text-[11px] text-gray-500 font-light">Search upcoming community gatherings</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {user?.id && (
                <Link
                  to={`/profile/${user.id}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-sheeba-dark border border-transparent hover:border-gray-200/80 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sheeba-coral/20 text-sheeba-purple flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold block">View as Public Visitor</span>
                      <span className="text-[11px] text-gray-500 font-light">Preview your external shareable link</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>
          </div>

          {/* Drawer Bottom Footer */}
          <div className="p-6 border-t border-gray-100 bg-[#faf8fb]">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
