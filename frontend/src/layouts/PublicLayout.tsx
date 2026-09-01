import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { Footer } from '../components/layout/Footer';

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

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
