import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Award,
  Search,
  Menu,
  X,
  LogIn,
  Settings,
  PlusCircle,
  Ticket,
  Home,
  Compass,
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
    <header className="sticky top-0 z-40 bg-[#FAF7F5]/90 backdrop-blur-md border-b border-[#E8DDD7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#63474D] flex items-center justify-center text-white shadow-xs group-hover:bg-[#523a3f] transition-colors">
              <Award className="w-5 h-5 text-[#FFA686]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl tracking-tight text-[#2D1F23] flex items-center gap-1.5">
                SHEEBA
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFA686]"></span>
              </span>
              <span className="text-[10px] font-sans font-semibold text-[#756366] -mt-1 tracking-wider uppercase">
                Attendance, verified.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            {!isAuthenticated && (
              <Link
                to="/search"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isActive('/search')
                    ? 'bg-[#63474D]/10 text-[#63474D]'
                    : 'text-[#756366] hover:text-[#2D1F23] hover:bg-[#E8DDD7]/40'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                Search Profiles & Events
              </Link>
            )}

            {isAuthenticated && role === 'ATTENDEE' && (
              <>
                <Link
                  to="/app"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    location.pathname === '/app'
                      ? 'bg-[#63474D]/10 text-[#63474D]'
                      : 'text-[#756366] hover:text-[#2D1F23] hover:bg-[#E8DDD7]/40'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  Attendee Hub
                </Link>
                <Link
                  to="/search"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive('/search')
                      ? 'bg-[#63474D]/10 text-[#63474D]'
                      : 'text-[#756366] hover:text-[#2D1F23] hover:bg-[#E8DDD7]/40'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  Events
                </Link>
                <Link
                  to="/app/events"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive('/app/events') || isActive('/app/ticket')
                      ? 'bg-[#63474D]/10 text-[#63474D]'
                      : 'text-[#756366] hover:text-[#2D1F23] hover:bg-[#E8DDD7]/40'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5" />
                  My Events
                </Link>
                <Link
                  to="/app/profile"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive('/app/profile')
                      ? 'bg-[#63474D]/10 text-[#63474D]'
                      : 'text-[#756366] hover:text-[#2D1F23] hover:bg-[#E8DDD7]/40'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  My Badges & Profile
                </Link>
              </>
            )}

            {isAuthenticated && role === 'ORGANIZER' && (
              <>
                <Link
                  to="/organizer"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive('/organizer') && !location.pathname.includes('/create')
                      ? 'bg-[#63474D]/10 text-[#63474D]'
                      : 'text-[#756366] hover:text-[#2D1F23] hover:bg-[#E8DDD7]/40'
                  }`}
                >
                  Events Dashboard
                </Link>
                <Link
                  to="/organizer/events/create"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive('/organizer/events/create')
                      ? 'bg-[#63474D] text-white'
                      : 'text-[#63474D] bg-[#63474D]/10 hover:bg-[#63474D]/20'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Create Event
                </Link>
              </>
            )}

            {isAuthenticated && role === 'ADMIN' && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive('/admin')
                    ? 'bg-[#63474D]/10 text-[#63474D]'
                    : 'text-[#756366] hover:text-[#2D1F23] hover:bg-[#E8DDD7]/40'
                }`}
              >
                Admin Oversight
              </Link>
            )}
          </nav>

          {/* Right User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    role === 'ADMIN'
                      ? 'primary'
                      : role === 'ORGANIZER'
                      ? 'secondary'
                      : 'tertiary'
                  }
                  className="font-semibold px-3 py-1 text-xs"
                >
                  {role === 'ADMIN'
                    ? 'Admin'
                    : role === 'ORGANIZER'
                    ? 'Organizer'
                    : 'Attendee'}
                </Badge>

                <Link
                  to={role === 'ORGANIZER' ? '/organizer/settings' : role === 'ADMIN' ? '/admin/profile' : '/app/settings'}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full hover:bg-[#E8DDD7]/40 transition-colors border border-[#E8DDD7]"
                  title="Account Settings"
                >
                  <img
                    src={user?.avatarUrl}
                    alt={user?.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#D6A184]"
                  />
                  <span className="text-xs font-semibold text-[#2D1F23]">
                    {user?.name}
                  </span>
                  <Settings className="w-3.5 h-3.5 text-[#756366]" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1 text-xs font-semibold text-[#B91C1C] hover:bg-red-50 rounded-lg transition-colors"
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
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#2D1F23] rounded-lg hover:bg-[#E8DDD7]/40 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8DDD7] bg-[#FAF7F5] px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-md">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/search"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-[#2D1F23] hover:bg-white flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-[#63474D]" />
              Search Profiles & Events
            </Link>

            {isAuthenticated ? (
              <>
                {role === 'ATTENDEE' && (
                  <>
                    <Link
                      to="/app"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-sm font-semibold text-[#2D1F23] hover:bg-white flex items-center gap-2"
                    >
                      <Home className="w-4 h-4 text-[#63474D]" />
                      Attendee Hub
                    </Link>
                    <Link
                      to="/search"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-sm font-semibold text-[#2D1F23] hover:bg-white flex items-center gap-2"
                    >
                      <Compass className="w-4 h-4 text-[#63474D]" />
                      Events
                    </Link>
                    <Link
                      to="/app/events"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-sm font-semibold text-[#2D1F23] hover:bg-white flex items-center gap-2"
                    >
                      <Ticket className="w-4 h-4 text-[#63474D]" />
                      My Events
                    </Link>
                    <Link
                      to="/app/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-sm font-semibold text-[#2D1F23] hover:bg-white flex items-center gap-2"
                    >
                      <Award className="w-4 h-4 text-[#63474D]" />
                      My Badges & Profile
                    </Link>
                    <Link
                      to="/app/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-sm font-semibold text-[#2D1F23] hover:bg-white flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4 text-[#63474D]" />
                      Account Settings
                    </Link>
                  </>
                )}
                {role === 'ORGANIZER' && (
                  <>
                    <Link
                      to="/organizer"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-sm font-semibold text-[#63474D] bg-[#63474D]/10"
                    >
                      Organizer Dashboard
                    </Link>
                    <Link
                      to="/organizer/events/create"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-sm font-semibold text-[#2D1F23] hover:bg-white"
                    >
                      Create New Event
                    </Link>
                    <Link
                      to="/organizer/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-sm font-semibold text-[#2D1F23] hover:bg-white"
                    >
                      Account & Export Data
                    </Link>
                  </>
                )}
                {role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-semibold text-[#2D1F23] bg-white"
                  >
                    Admin Oversight Panel
                  </Link>
                )}
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-bold text-[#63474D]"
              >
                Sign In / Register
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-[#E8DDD7]">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={user?.avatarUrl}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full border border-[#D6A184]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#2D1F23]">{user?.name}</p>
                    <p className="text-[10px] text-[#756366]">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs text-[#B91C1C] font-semibold"
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
