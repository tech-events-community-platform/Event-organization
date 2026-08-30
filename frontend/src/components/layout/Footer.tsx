import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-light">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.jpg"
              alt="Sheeba Logo"
              className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="font-serif font-bold text-sm tracking-tight text-sheeba-dark">
              Sheeba
            </span>
          </Link>

          <p>
            © 2026 Sheeba. All rights reserved. Addis Ababa, Ethiopia.
          </p>
        </div>
      </div>
    </footer>
  );
};
