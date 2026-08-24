import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  QrCode,
  CheckCircle2,
  BarChart3,
  Calendar,
  ShieldCheck,
  Zap,
  LogIn,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-16 pb-16 overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-[#0B5D4B]/10 via-[#D6A84F]/5 to-transparent blur-3xl -z-10 rounded-full"></div>

        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <Badge variant="gold" className="px-3.5 py-1 text-xs shadow-xs" icon={<Sparkles className="w-3.5 h-3.5" />}>
            Ethiopia&apos;s Dedicated Event Infrastructure Platform
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#17211E] tracking-tight leading-[1.15]">
            Run better tech events.{' '}
            <span className="text-[#0B5D4B] block sm:inline">Prove the impact.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#66736E] max-w-2xl mx-auto leading-relaxed">
            Sheba helps Ethiopia&apos;s tech communities manage registration, verify attendance via digital QR passes, and turn event activity into sponsor-ready reports.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/events" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" fullWidth icon={<ArrowRight className="w-5 h-5" />}>
                Explore Events
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" fullWidth icon={<LogIn className="w-5 h-5" />}>
                Sign In / Demo Access
              </Button>
            </Link>
          </div>
        </div>

        {/* Product Interactive Check-in Preview Card */}
        <div className="mt-12 max-w-4xl mx-auto bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-200/80 relative">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="text-xs font-mono text-[#66736E] ml-2">sheba.net/organizer/scanner</span>
            </div>
            <Badge variant="green" icon={<ShieldCheck className="w-3 h-3" />}>
              Live Entrance Scanner Preview
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left Mock Ticket */}
            <div className="bg-[#F7F8F5] p-4 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0B5D4B]">
                <span>TICKET #SHB-8921</span>
                <span className="text-[#D6A84F] font-bold">VALID</span>
              </div>
              <h4 className="font-bold text-sm text-[#17211E]">React & Modern Frontend Workshop</h4>
              <p className="text-xs text-[#66736E]">Abebe Kebede • @abebe_demo</p>
              <div className="bg-white p-3 rounded-xl border border-gray-200 text-center">
                <QrCode className="w-24 h-24 mx-auto text-[#064638]" />
              </div>
            </div>

            {/* Middle Scanner Simulation Arrow */}
            <div className="text-center space-y-2 py-2">
              <div className="w-12 h-12 rounded-full bg-[#0B5D4B] text-[#D6A84F] flex items-center justify-center mx-auto shadow-md animate-pulse">
                <Zap className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-[#0B5D4B]">Instant 0.2s QR Scan</p>
              <p className="text-[11px] text-[#66736E]">Identity Pass Verified</p>
            </div>

            {/* Right Verified Result */}
            <div className="bg-[#238B6E]/10 border border-[#238B6E]/30 p-5 rounded-2xl space-y-2 text-left">
              <div className="flex items-center gap-2 text-[#238B6E] font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                Check-in Verified
              </div>
              <p className="text-xs text-[#17211E] font-semibold">Attendance Logged</p>
              <p className="text-[11px] text-[#66736E]">Timestamp: 02:14 PM EAT • Bole Innovation Hub</p>
              <div className="pt-2">
                <span className="text-[10px] bg-[#064638] text-white px-2 py-0.5 rounded-full font-mono">
                  Sponsor Report Updated (+1)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW SHEBA WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-2 mb-12">
          <Badge variant="green">Architecture</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17211E]">How Sheba Works</h2>
          <p className="text-sm text-[#66736E]">A streamlined loop engineered specifically for event success in Ethiopia.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Create Event',
              desc: 'Organizer configures event location, date, capacity, and topic tags.',
              icon: Calendar,
            },
            {
              step: '02',
              title: 'Get Digital Pass',
              desc: 'Attendees discover events and register with 1-click to receive an instant QR pass.',
              icon: QrCode,
            },
            {
              step: '03',
              title: 'Door Scan & Verify',
              desc: 'Organizers scan attendee QR passes at the entrance for instant check-in verification.',
              icon: ShieldCheck,
            },
            {
              step: '04',
              title: 'Sponsor Report',
              desc: 'Export verified attendance rates and technology distribution summaries for sponsors.',
              icon: BarChart3,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-2xs space-y-4 hover:border-[#0B5D4B]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#0B5D4B]/10 flex items-center justify-center text-[#0B5D4B]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#D6A84F] bg-[#D6A84F]/10 px-2 py-0.5 rounded-full">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-[#17211E]">{item.title}</h3>
                <p className="text-xs text-[#66736E] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA CARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#064638] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-xl border border-[#0B5D4B]">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#D6A84F]/10 rounded-full blur-2xl"></div>

          <Badge variant="gold" className="mx-auto">
            Get Started Today
          </Badge>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white max-w-xl mx-auto leading-tight">
            Ready to elevate your tech community events in Ethiopia?
          </h2>

          <p className="text-sm text-gray-200 max-w-lg mx-auto">
            Join software engineers, community builders, and sponsors on Sheba.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/login">
              <Button variant="accent" size="lg" icon={<LogIn className="w-4 h-4" />}>
                Sign In to Platform
              </Button>
            </Link>
            <Link to="/events">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Explore Events
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
