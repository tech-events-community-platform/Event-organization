import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#064638] text-white border-t border-[#0B5D4B] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#D6A84F] flex items-center justify-center text-[#064638]">
                <QrCode className="w-5 h-5 font-bold" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                SHEBA<span className="text-[#D6A84F]">.</span>
              </span>
            </div>
            <p className="text-xs text-gray-300 max-w-sm leading-relaxed">
              Sheba is the purpose-built event infrastructure platform for Ethiopia&apos;s technology ecosystem. Empowering tech communities to manage registrations, verify attendance, and generate sponsor reports.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#D6A84F]">
              <ShieldCheck className="w-4 h-4" />
              <span>Telegram Verification Native • QR Ticket Scanner Engine</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D6A84F] mb-3">
              Platform Links
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/app" className="hover:text-white transition-colors">
                  Attendee Hub
                </Link>
              </li>
              <li>
                <Link to="/app/profile/attendance" className="hover:text-white transition-colors">
                  Verified Attendance
                </Link>
              </li>
              <li>
                <Link to="/organizer" className="hover:text-white transition-colors">
                  Organizer Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D6A84F] mb-3">
              Community Hubs
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>Addis Ababa Tech Collective</li>
              <li>ICT Park Innovation Hub</li>
              <li>ALX Ethiopia Developers</li>
              <li>Women In Tech Ethiopia</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#0B5D4B]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} SHEBA Infrastructure. Built for Ethiopia Tech Community.</p>
          <div className="flex items-center gap-1 text-gray-300">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-[#D6A84F] fill-[#D6A84F]" />
            <span>in Addis Ababa</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
