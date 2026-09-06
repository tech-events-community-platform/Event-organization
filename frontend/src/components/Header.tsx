import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ArrowRight,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Award,
  ChevronDown,
  Compass,
  Ticket,
  PlusCircle,
  Calendar,
  BarChart3,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isAuthPage = ['/login', '/register', '/pending-approval'].includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setUserDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isTabActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(path);
  };

  const getDashboardPath = () => {
    if (!user) return '/app';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'ORGANIZER') return '/organizer';
    if (user.role === 'SPONSOR') return '/sponsor';
    return '/app';
  };

  const getProfilePath = () => {
    if (!user) return '/app/profile';
    if (user.role === 'ORGANIZER') return '/organizer/events';
    if (user.role === 'ADMIN') return '/admin';
    return '/app/profile';
  };

  const publicNavLinks = isHome
    ? [
        { name: 'Features', href: '#features', isInternal: true },
        { name: 'How It Works', href: '#how-it-works', isInternal: true },
        { name: 'Interactive Demo', href: '#demo', isInternal: true },
        { name: 'Audiences', href: '#audiences', isInternal: true },
        { name: 'Explore Events', href: '/search', isInternal: false },
      ]
    : [
        { name: 'Home', href: '/', isInternal: false },
        { name: 'Explore Events', href: '/search', isInternal: false },
      ];

  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#153E2A]/95 backdrop-blur-md shadow-md border-b border-white/10'
          : 'bg-[#153E2A]/90 backdrop-blur-sm border-b border-white/10 shadow-2xs'
      }`}
    >
      {/* Top Navbar Row */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <img
              src="/logo.jpg"
              alt="Sheeba Logo"
              className="h-8 sm:h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-200 rounded"
            />
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-extrabold tracking-tight text-white group-hover:text-[#F9FF46] transition-colors leading-none">
                Sheeba
              </span>
              <span className="text-[8px] uppercase font-bold tracking-widest text-[#F9FF46] mt-0.5">
                Event Infrastructure
              </span>
            </div>
          </Link>

          {/* Desktop Navigation for Logged Out Guests */}
          {!isAuthenticated && !isAuthPage && (
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              {publicNavLinks.map((link) =>
                link.isInternal ? (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-xs sm:text-sm font-semibold text-white/85 hover:text-[#F9FF46] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#F9FF46] hover:after:w-full after:transition-all after:duration-200"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-xs sm:text-sm font-semibold text-white/85 hover:text-[#F9FF46] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#F9FF46] hover:after:w-full after:transition-all after:duration-200"
                  >
                    {link.name}
                  </Link>
                )
              )}
            </nav>
          )}

          {/* Desktop Right: Profile / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              /* Logged In User Pill & Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-white/10 border border-white/20 hover:border-[#F9FF46]/50 hover:bg-white/15 transition-all cursor-pointer text-white"
                >
                  <img
                    src={user.avatarUrl || defaultAvatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#F9FF46]/60 shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultAvatar;
                    }}
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-white max-w-[130px] truncate leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-[#F9FF46]">
                      {user.role === 'ADMIN' ? 'Super Admin' : user.role === 'ORGANIZER' ? 'Organizer' : user.role === 'SPONSOR' ? 'Sponsor' : 'Attendee'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-300 transition-transform duration-200" />
                </button>

                {/* Profile Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-fade-in text-gray-800">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-xs font-bold text-[#153E2A] truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-[#f6f9f7] hover:text-[#153E2A] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#153E2A]" />
                        <span>Go to Dashboard</span>
                      </Link>

                      {user.role === 'ATTENDEE' && (
                        <Link
                          to={getProfilePath()}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-[#f6f9f7] hover:text-[#153E2A] transition-colors"
                        >
                          <Award className="w-4 h-4 text-[#8BA448]" />
                          <span>My Profile & Badges</span>
                        </Link>
                      )}

                      <Link
                        to="/search"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-[#f6f9f7] hover:text-[#153E2A] transition-colors"
                      >
                        <Compass className="w-4 h-4 text-[#153E2A]" />
                        <span>Explore Events</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : isAuthPage ? (
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/30 text-white text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                <span>Back to Home</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F9FF46] text-[#153E2A] text-xs font-bold hover:bg-[#e0e63c] shadow-xs hover:shadow-sm transition-all duration-200"
                >
                  <span>Register</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#153E2A]" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && user ? (
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full border border-[#E8DDD7]"
              >
                <img
                  src={user.avatarUrl || defaultAvatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
              </button>
            ) : null}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#63474D] cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 1-LINE QUICK NAVIGATION SUBNAV (Visible When Logged In) */}
      {isAuthenticated && user && (
        <div className="bg-[#153E2A]/95 border-t border-b border-white/10 py-1 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-2 sm:gap-4 whitespace-nowrap min-w-max text-xs">
            {user.role === 'ATTENDEE' && (
              <>
                <Link
                  to="/app"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    location.pathname === '/app'
                      ? 'bg-[#F9FF46] text-[#153E2A] shadow-xs'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>📊 Dashboard</span>
                </Link>

                <Link
                  to="/app/events"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    isTabActive('/app/events') || isTabActive('/app/ticket')
                      ? 'bg-[#F9FF46] text-[#153E2A] shadow-xs'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>🎟️ My Tickets & Passes</span>
                </Link>

                <Link
                  to="/app/record"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    isTabActive('/app/record')
                      ? 'bg-[#F9FF46] text-[#153E2A] shadow-xs'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>🏆 My Badges & Records</span>
                </Link>

                <Link
                  to="/app/explore"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    isTabActive('/app/explore') || isTabActive('/search')
                      ? 'bg-[#F9FF46] text-[#153E2A] shadow-xs'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>🔍 Explore Events</span>
                </Link>

                <Link
                  to="/app/profile"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    isTabActive('/app/profile') && location.pathname !== '/app/profile/attendance'
                      ? 'bg-[#F9FF46] text-[#153E2A] shadow-xs'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>👤 My Profile</span>
                </Link>
              </>
            )}

            {user.role === 'ORGANIZER' && (
              <>
                <Link
                  to="/organizer/events"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    isTabActive('/organizer/events') && location.pathname !== '/organizer/events/create'
                      ? 'bg-[#F9FF46] text-[#153E2A] shadow-xs'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>📅 My Events</span>
                </Link>

                <Link
                  to="/organizer/events/create"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    isTabActive('/organizer/events/create')
                      ? 'bg-[#F9FF46] text-[#153E2A] shadow-xs'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>➕ Create Event</span>
                </Link>

                <Link
                  to="/organizer"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    location.pathname === '/organizer'
                      ? 'bg-[#F9FF46] text-[#153E2A] shadow-xs'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>📊 Organizer Studio</span>
                </Link>

                <Link
                  to="/organizer/reports"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    isTabActive('/organizer/reports')
                      ? 'bg-[#F9FF46] text-[#153E2A] shadow-xs'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>📈 Reports & Badges</span>
                </Link>

                <Link
                  to="/search"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    isTabActive('/search')
                      ? 'bg-[#F9FF46] text-[#153E2A] shadow-xs'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>🔍 Explore Events</span>
                </Link>
              </>
            )}

            {user.role === 'ADMIN' && (
              <>
                <Link
                  to="/admin"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    location.pathname === '/admin'
                      ? 'bg-[#F9FF46] text-[#153E2A] shadow-xs'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>🛡️ Admin Portal</span>
                </Link>

                <Link
                  to="/admin/users"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    isTabActive('/admin/users')
                      ? 'bg-[#F9FF46] text-[#153E2A] shadow-xs'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>👥 Users Management</span>
                </Link>

                <Link
                  to="/admin/events"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    isTabActive('/admin/events')
                      ? 'bg-[#F9FF46] text-[#153E2A] shadow-xs'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>📅 Events Moderation</span>
                </Link>

                <Link
                  to="/search"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    isTabActive('/search')
                      ? 'bg-[#F9FF46] text-[#153E2A] shadow-xs'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>🔍 Explore Events</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bg-[#153E2A]/98 backdrop-blur-xl border-b border-[#8BA448]/30 shadow-xl px-6 py-6 transition-all duration-300 max-h-[85vh] overflow-y-auto text-white">
          <div className="flex flex-col gap-4">
            {isAuthenticated && user ? (
              /* Mobile Logged-in User Card */
              <div className="pb-3 border-b border-white/10 space-y-2">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatarUrl || defaultAvatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#F9FF46]/60"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{user.name}</span>
                    <span className="text-xs text-[#F9FF46]">{user.email}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-1.5">
                  {user.role === 'ATTENDEE' && (
                    <>
                      <Link
                        to="/app/events"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 py-2 px-3 rounded-xl bg-white/10 text-xs font-semibold text-[#F9FF46]"
                      >
                        <Ticket className="w-4 h-4" />
                        <span>🎟️ My Tickets & Passes</span>
                      </Link>

                      <Link
                        to="/app/record"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-white/10 text-xs font-medium text-white/90"
                      >
                        <Award className="w-4 h-4 text-[#8BA448]" />
                        <span>🏆 My Badges & Records</span>
                      </Link>

                      <Link
                        to="/app"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-white/10 text-xs font-medium text-white/90"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#8BA448]" />
                        <span>📊 Dashboard</span>
                      </Link>
                    </>
                  )}

                  {user.role === 'ORGANIZER' && (
                    <>
                      <Link
                        to="/organizer/events"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 py-2 px-3 rounded-xl bg-white/10 text-xs font-semibold text-[#F9FF46]"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>📅 My Events</span>
                      </Link>
                      <Link
                        to="/organizer/events/create"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-white/10 text-xs font-medium text-white/90"
                      >
                        <PlusCircle className="w-4 h-4 text-[#8BA448]" />
                        <span>➕ Create Event</span>
                      </Link>
                    </>
                  )}

                  <Link
                    to="/search"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-white/10 text-xs font-medium text-white/90"
                  >
                    <Compass className="w-4 h-4 text-[#8BA448]" />
                    <span>🔍 Explore Events</span>
                  </Link>
                </div>
              </div>
            ) : null}

            {/* Public Navigation links for guests */}
            {!isAuthenticated && (
              <div className="flex flex-col gap-2">
                {publicNavLinks.map((link) =>
                  link.isInternal ? (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-sm font-medium text-white hover:text-[#F9FF46] py-1.5 transition-colors"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-sm font-medium text-white hover:text-[#F9FF46] py-1.5 transition-colors"
                    >
                      {link.name}
                    </Link>
                  )
                )}
              </div>
            )}

            {/* Mobile Auth Actions */}
            <div className="pt-4 border-t border-white/10">
              {isAuthenticated && user ? (
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-400/40 bg-red-950/40 text-red-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-xl border border-white/30 text-white font-semibold text-xs hover:bg-white/10 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-[#F9FF46] text-[#153E2A] font-bold text-xs shadow-xs hover:bg-[#e0e63c] transition-colors"
                  >
                    <span>Register</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#153E2A]" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
