import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Features', href: isHome ? '#features' : '/#features' },
    { name: 'How It Works', href: isHome ? '#how-it-works' : '/#how-it-works' },
    { name: 'Interactive Demo', href: isHome ? '#demo' : '/#demo' },
    { name: 'Audiences', href: isHome ? '#audiences' : '/#audiences' },
    { name: 'Roadmap', href: isHome ? '#roadmap' : '/#roadmap' },
    { name: 'Team', href: isHome ? '#team' : '/#team' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <img
              src="/logo.jpg"
              alt="Sheeba Logo"
              className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
            />
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-sheeba-dark group-hover:text-sheeba-purple transition-colors">
                Sheeba
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-sheeba-rose -mt-1">
                Event Infrastructure
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {!['/login', '/register', '/pending-approval'].includes(location.pathname) && (
            <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-gray-700 hover:text-sheeba-purple transition-colors duration-150 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-sheeba-purple hover:after:w-full after:transition-all after:duration-200"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          )}

          {/* Desktop Right CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {!['/login', '/register', '/pending-approval'].includes(location.pathname) ? (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-sheeba-purple hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#63474D] text-white text-sm font-bold hover:bg-[#523a3f] shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <span>Register</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </Link>
              </>
            ) : (
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                <span>Back to Home</span>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            {!['/login', '/register', '/pending-approval'].includes(location.pathname) ? (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-lg bg-[#63474D] text-white text-xs font-bold hover:bg-[#523a3f]"
                >
                  Register
                </Link>
              </>
            ) : (
              <Link
                to="/"
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold"
              >
                Back to Home
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-sheeba-purple cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-xl px-6 py-6 transition-all duration-300">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-sheeba-rose">
                Navigation
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-sheeba-purple font-medium bg-sheeba-purple/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-sheeba-pink"></span>
                Ethiopia&apos;s Tech Engine
              </span>
            </div>
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-gray-800 hover:text-sheeba-purple py-1.5 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center py-2.5 rounded-xl border border-gray-300 text-gray-800 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#63474D] text-white font-bold text-sm shadow-xs hover:bg-[#523a3f] transition-colors"
              >
                <span>Register</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
