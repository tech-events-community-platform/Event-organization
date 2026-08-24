import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  QrCode,
  Menu,
  X,
  LogIn,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#0B5D4B] flex items-center justify-center text-white shadow-sm group-hover:bg-[#064638] transition-colors">
              <QrCode className="w-5 h-5 text-[#D6A84F]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-[#17211E] flex items-center gap-1">
                SHEBA
                <span className="w-1.5 h-1.5 rounded-full bg-[#D6A84F]"></span>
              </span>
              <span className="text-[10px] font-semibold text-[#0B5D4B] -mt-1 tracking-wider">
                EVENT INFRASTRUCTURE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/events"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/events')
                  ? 'bg-[#0B5D4B]/10 text-[#0B5D4B]'
                  : 'text-[#66736E] hover:text-[#17211E] hover:bg-gray-100/80'
              }`}
            >
              Explore Events
            </Link>

            {isAuthenticated && role === 'ATTENDEE' && (
              <Link
                to="/app"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/app')
                    ? 'bg-[#0B5D4B]/10 text-[#0B5D4B]'
                    : 'text-[#66736E] hover:text-[#17211E] hover:bg-gray-100/80'
                }`}
              >
                Attendee Hub
              </Link>
            )}

            {isAuthenticated && role === 'ORGANIZER' && (
              <Link
                to="/organizer"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/organizer')
                    ? 'bg-[#0B5D4B]/10 text-[#0B5D4B]'
                    : 'text-[#66736E] hover:text-[#17211E] hover:bg-gray-100/80'
                }`}
              >
                Organizer Console
              </Link>
            )}

            {isAuthenticated && role === 'ADMIN' && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/admin')
                    ? 'bg-[#0B5D4B]/10 text-[#0B5D4B]'
                    : 'text-[#66736E] hover:text-[#17211E] hover:bg-gray-100/80'
                }`}
              >
                Admin Console
              </Link>
            )}
          </nav>

          {/* Right User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Logged in User Role Badge */}
                <Badge
                  variant={
                    role === 'ADMIN'
                      ? 'dark'
                      : role === 'ORGANIZER'
                      ? 'gold'
                      : 'green'
                  }
                  className="font-semibold px-3 py-1 text-xs shadow-2xs"
                >
                  {role === 'ADMIN'
                    ? 'Admin'
                    : role === 'ORGANIZER'
                    ? 'Organizer'
                    : 'Attendee'}
                </Badge>

                <Link
                  to={role === 'ORGANIZER' ? '/organizer' : role === 'ADMIN' ? '/admin/profile' : '/app/profile'}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <img
                    src={user?.avatarUrl}
                    alt={user?.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#D6A84F]"
                  />
                  <span className="text-xs font-semibold text-[#17211E]">
                    {user?.name}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button size="sm" variant="primary" icon={<LogIn className="w-3.5 h-3.5" />}>
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && role === 'ATTENDEE' && (
              <Link
                to="/app/ticket/evt_react_workshop_2026"
                className="p-2 bg-[#0B5D4B]/10 text-[#0B5D4B] rounded-lg"
                title="My Ticket"
              >
                <QrCode className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#17211E] rounded-lg hover:bg-gray-100 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-lg">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/events"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#17211E] hover:bg-[#F7F8F5]"
            >
              Explore Events
            </Link>
            {isAuthenticated ? (
              <>
                {role === 'ATTENDEE' && (
                  <>
                    <Link
                      to="/app"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#17211E] hover:bg-[#F7F8F5]"
                    >
                      Attendee Hub
                    </Link>
                    <Link
                      to="/app/events"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#17211E] hover:bg-[#F7F8F5]"
                    >
                      My Registered Events
                    </Link>
                    <Link
                      to="/app/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#17211E] hover:bg-[#F7F8F5]"
                    >
                      Attendee Profile
                    </Link>
                  </>
                )}
                {role === 'ORGANIZER' && (
                  <Link
                    to="/organizer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#0B5D4B] bg-[#0B5D4B]/10 font-semibold"
                  >
                    Organizer Console
                  </Link>
                )}
                {role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-900 bg-slate-100 font-semibold"
                  >
                    Admin Console
                  </Link>
                )}
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold text-[#0B5D4B]"
              >
                Sign In
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-gray-100">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={user?.avatarUrl}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full border border-[#D6A84F]"
                  />
                  <div>
                    <p className="text-xs font-semibold text-[#17211E]">{user?.name}</p>
                    <p className="text-[10px] text-[#66736E]">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-600 font-medium"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button fullWidth variant="primary" icon={<LogIn className="w-4 h-4" />}>
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
