import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { Footer } from '../components/layout/Footer';

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isExternalRegistration =
    location.pathname.startsWith('/e/') ||
    (location.pathname.startsWith('/events/') && location.pathname.includes('/register'));

  if (isExternalRegistration) {
    return (
      <div
        className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: `url('/register-bg.png')` }}
      >
        <Header />
        <main className="flex-1 pt-20 sm:pt-24">
          <Outlet />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfafc]">
      <Header />
      <main className={`flex-1 ${!isHome ? 'pt-24 sm:pt-28' : ''}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

