import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#63474D] text-[#FAF7F5] border-t border-[#AA767C]/40 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FFA686] flex items-center justify-center text-[#2D1F23]">
                <Award className="w-5 h-5 font-bold" />
              </div>
              <span className="font-serif font-bold text-xl tracking-tight text-white">
                SHEEBA<span className="text-[#FFA686]">.</span>
              </span>
            </div>
            <p className="text-xs text-[#E8DDD7] max-w-sm leading-relaxed font-sans">
              Sheba is an event infrastructure platform built for Ethiopia&apos;s tech community. Built around a single insight: attendance itself should carry value.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#FFA686]">
              <ShieldCheck className="w-4 h-4" />
              <span>Organizer-Verified Badges • Dynamic QR Pass • Sponsor Evidence</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#FFA686] mb-3">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs text-[#E8DDD7]">
              <li>
                <Link to="/search" className="hover:text-white transition-colors">
                  Public Search
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Organizer Console
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Attendee Verification
                </Link>
              </li>
              <li>
                <span className="text-[#D6A184]">Chapa ETB Payment Split (3%)</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#FFA686] mb-3">
              Legal & Community
            </h4>
            <ul className="space-y-2 text-xs text-[#E8DDD7]">
              <li>Ethiopia Tech Community (18+)</li>
              <li>Single-day Hackathons, Workshops, Meetups</li>
              <li>Terms of Service & Privacy Policy</li>
              <li>Single Account, Single Role Model</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#AA767C]/40 flex flex-col sm:flex-row items-center justify-between text-xs text-[#E8DDD7] gap-4">
          <p>© {new Date().getFullYear()} Sheba. Attendance, verified. Built for Ethiopia.</p>
          <div className="flex items-center gap-1 text-[#E8DDD7]">
            <span>Proof you showed up • Addis Ababa</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
