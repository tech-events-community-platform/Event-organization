import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#153E2A] text-white border-t border-[#8BA448]/30 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/80 font-light">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.jpg"
              alt="Sheeba Logo"
              className="h-7 w-auto object-contain transition-transform group-hover:scale-105 rounded"
            />
            <span className="font-serif font-bold text-sm tracking-tight text-white group-hover:text-[#F9FF46] transition-colors">
              Sheeba
            </span>
          </Link>

          <p className="text-white/70">
            © 2026 Sheeba Event Infrastructure. All rights reserved. Addis Ababa, Ethiopia.
          </p>
        </div>
      </div>
    </footer>
  );
};
