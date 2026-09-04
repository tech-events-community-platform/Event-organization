import React from 'react';
import { TelegramIcon, XIcon, YouTubeIcon } from '../ui/SocialIcons';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-8 mt-auto bg-transparent">
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-5">
        {/* Long thick line separator */}
        <div className="w-full h-1 bg-white/40 rounded-full" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm sm:text-base font-semibold text-white">
          <p className="text-white tracking-wide">
            © 2026 Sheeba. All rights reserved.
          </p>

          {/* 3 Socials Icons (White and enlarged in size) */}
          <div className="flex items-center gap-6 text-white">
            <span className="cursor-pointer hover:text-white/80 transition-colors" title="Telegram">
              <TelegramIcon className="w-6 h-6" />
            </span>
            <span className="cursor-pointer hover:text-white/80 transition-colors" title="X (Twitter)">
              <XIcon className="w-5 h-5" />
            </span>
            <span className="cursor-pointer hover:text-white/80 transition-colors" title="YouTube">
              <YouTubeIcon className="w-6 h-6" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
