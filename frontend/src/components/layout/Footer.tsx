import React from 'react';
import { useLocation } from 'react-router-dom';
import { LinkedInIcon, XIcon, TikTokIcon } from '../ui/SocialIcons';

export const Footer: React.FC = () => {
  const location = useLocation();
  const isExternalRegistration =
    location.pathname.startsWith('/e/') ||
    (location.pathname.startsWith('/events/') && location.pathname.includes('/register'));

  return (
    <footer className="w-full py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Subtle separator */}
        <div
          className={`w-full h-px ${
            isExternalRegistration ? 'bg-white/20' : 'bg-gray-300'
          }`}
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          {/* Copyright notice with © and Addis Ababa, Ethiopia */}
          <p
            className={`font-semibold tracking-wide ${
              isExternalRegistration ? 'text-white' : 'text-[#2D1F23]'
            }`}
          >
            © 2026 Sheeba. All rights reserved. Addis Ababa, Ethiopia.
          </p>

          {/* Social media icons: LinkedIn, X, TikTok */}
          <div className="flex items-center gap-5">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isExternalRegistration
                  ? 'text-white hover:text-white/80 hover:bg-white/10'
                  : 'text-[#2D1F23] hover:text-[#63474D] hover:bg-[#63474D]/10'
              }`}
              title="LinkedIn"
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="w-4 h-4" />
            </a>

            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isExternalRegistration
                  ? 'text-white hover:text-white/80 hover:bg-white/10'
                  : 'text-[#2D1F23] hover:text-[#63474D] hover:bg-[#63474D]/10'
              }`}
              title="X (Twitter)"
              aria-label="X"
            >
              <XIcon className="w-4 h-4" />
            </a>

            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isExternalRegistration
                  ? 'text-white hover:text-white/80 hover:bg-white/10'
                  : 'text-[#2D1F23] hover:text-[#63474D] hover:bg-[#63474D]/10'
              }`}
              title="TikTok"
              aria-label="TikTok"
            >
              <TikTokIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
