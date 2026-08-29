import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  QrCode,
  CheckCircle2,
  Award,
  ShieldCheck,
  Zap,
  LogIn,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  Search,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FEC196]/40 border border-[#FFA686]/50 text-[#63474D] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#63474D]" />
          <span>Ethiopia&apos;s Event Infrastructure Platform</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#2D1F23] tracking-tight leading-[1.15]">
          Attendance, <span className="text-[#63474D] italic">verified.</span>
        </h1>

        <p className="font-sans text-base sm:text-lg text-[#756366] max-w-2xl mx-auto leading-relaxed">
          Sheba turns event attendance into verifiable organizer badges for attendees, and clean, sponsor-ready proof for community organizers in Ethiopia.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" fullWidth icon={<ArrowRight className="w-5 h-5" />}>
              Organizer Portal
            </Button>
          </Link>
          <Link to="/search" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" fullWidth icon={<Search className="w-5 h-5" />}>
              Search Badges & Events
            </Button>
          </Link>
        </div>

        {/* Value Proposition Pills */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-4xl mx-auto">
          <div className="p-5 rounded-2xl bg-white border border-[#E8DDD7] space-y-2 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-[#63474D]/10 flex items-center justify-center text-[#63474D]">
              <QrCode className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-[#2D1F23]">Shareable Link & Dynamic QR</h3>
            <p className="text-xs text-[#756366]">
              Publish events with custom question forms. Attendee QR passes dynamically update without reissuance.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E8DDD7] space-y-2 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-[#AA767C]/15 flex items-center justify-center text-[#AA767C]">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-[#2D1F23]">Organizer-Issued Badges</h3>
            <p className="text-xs text-[#756366]">
              Attended, Participant, Winner, and Speaker badges live permanently on verifiable public profiles.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E8DDD7] space-y-2 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-[#D6A184]/20 flex items-center justify-center text-[#63474D]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-[#2D1F23]">Sponsor-Ready Reports</h3>
            <p className="text-xs text-[#756366]">
              Export verified metrics, check-in velocity, and badge distributions with 1-click PDF reports.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Check-in & Badge Issuance Simulation */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DDD7] shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-[#E8DDD7]">
            <div>
              <span className="text-xs font-mono text-[#756366]">sheba.et/organizer/scanner</span>
              <h2 className="font-serif font-bold text-lg text-[#2D1F23]">Door Check-In & Automatic Badge Issuance</h2>
            </div>
            <Badge variant="primary" icon={<ShieldCheck className="w-3 h-3" />}>
              Live Infrastructure Demo
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* 1. Dynamic QR Ticket */}
            <div className="bg-[#FAF7F5] p-5 rounded-2xl border border-[#E8DDD7] space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#63474D]">
                <span>PASS #SHB-8921</span>
                <span className="text-[#2A7B5F] font-bold">VALID</span>
              </div>
              <h4 className="font-serif font-bold text-sm text-[#2D1F23]">React & Modern Web Architecture</h4>
              <p className="text-xs text-[#756366]">Abebe Kebede • Bole Innovation Hub</p>
              <div className="bg-white p-3 rounded-xl border border-[#E8DDD7] text-center">
                <QrCode className="w-24 h-24 mx-auto text-[#63474D]" />
              </div>
              <p className="text-[10px] text-center text-[#756366]">Dynamic Signed Token</p>
            </div>

            {/* 2. Instant Scanner */}
            <div className="text-center space-y-2 py-2">
              <div className="w-12 h-12 rounded-full bg-[#63474D] text-[#FFA686] flex items-center justify-center mx-auto shadow-md">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-xs font-bold text-[#63474D]">Web Camera Scanner</p>
              <p className="text-[11px] text-[#756366]">Instant Approval Verification</p>
            </div>

            {/* 3. Result: Badge Awarded + Report Updated */}
            <div className="bg-[#FAF7F5] border border-[#AA767C]/30 p-5 rounded-2xl space-y-3 text-left">
              <div className="flex items-center gap-2 text-[#2A7B5F] font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                Check-in Approved
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E8DDD7] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#63474D]">
                  <Award className="w-3.5 h-3.5 text-[#FFA686]" />
                  <span>Badge Issued: "Attended"</span>
                </div>
                <p className="text-[11px] text-[#756366]">Given by GDG Addis</p>
              </div>
              <p className="text-[10px] bg-[#63474D] text-white px-2.5 py-1 rounded-full font-mono text-center">
                Sponsor Report Turnout Rate: 85.3%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Badge System Showcase */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="space-y-2">
          <Badge variant="tertiary">The Sheba Credential Standard</Badge>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1F23]">
            Fixed Four-Badge Model
          </h2>
          <p className="text-xs text-[#756366] max-w-xl mx-auto">
            Clear, tamper-proof distinctions of community participation without inflated scores.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { code: 'Attended', desc: 'Auto-awarded upon door check-in approval', color: 'primary' as const },
            { code: 'Participant', desc: 'Awarded to hands-on workshop coders', color: 'secondary' as const },
            { code: 'Winner', desc: 'Awarded to hackathon prize recipients', color: 'accent' as const },
            { code: 'Speaker', desc: 'Awarded to keynote & session leads', color: 'tertiary' as const },
          ].map((b) => (
            <div key={b.code} className="p-4 rounded-2xl bg-white border border-[#E8DDD7] text-left space-y-2 shadow-xs">
              <Badge variant={b.color} icon={<Award className="w-3 h-3" />}>
                {b.code}
              </Badge>
              <p className="text-xs text-[#756366]">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-[#63474D] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-lg">
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
            Proof you showed up.
          </h2>
          <p className="text-sm text-[#E8DDD7] max-w-xl mx-auto">
            Join Ethiopian developer communities hosting hackathons, workshops, and meetups on Sheba infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link to="/login">
              <Button size="lg" variant="accent" icon={<LogIn className="w-5 h-5" />}>
                Sign In to Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
