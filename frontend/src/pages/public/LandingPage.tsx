import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../../components/sections/Hero';
import FadeIn from '../../components/FadeIn';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  QrCode,
  CheckCircle2,
  Award,
  ShieldCheck,
  Zap,
  LogIn,
  Users,
  CalendarCheck,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 pb-24 overflow-hidden">
      {/* 1. HERO SECTION */}
      <Hero />

      {/* 2. INTERACTIVE DEMO: DOOR CHECK-IN & AUTOMATIC BADGE ISSUANCE */}
      <section id="demo" className="max-w-5xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <FadeIn direction="up">
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-200/80 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs font-mono text-gray-500">sheba.et/organizer/scanner</span>
                <h2 className="font-serif font-bold text-2xl text-sheeba-dark">Door Check-In & Automatic Badge Issuance</h2>
              </div>
              <Badge variant="primary" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                Live Infrastructure Demo
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* 1. Dynamic QR Ticket */}
              <div className="bg-[#FAF7F5] p-5 rounded-2xl border border-gray-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-sheeba-purple">
                  <span>PASS #SHB-8921</span>
                  <span className="text-[#2A7B5F] font-bold">VALID</span>
                </div>
                <h4 className="font-serif font-bold text-sm text-sheeba-dark">React & Modern Web Architecture</h4>
                <p className="text-xs text-gray-500">Abebe Kebede • Bole Innovation Hub</p>
                <div className="bg-white p-3 rounded-xl border border-gray-200/80 text-center shadow-xs">
                  <QrCode className="w-24 h-24 mx-auto text-sheeba-purple" />
                </div>
                <p className="text-[10px] text-center text-gray-500">Dynamic Signed Token</p>
              </div>

              {/* 2. Instant Scanner */}
              <div className="text-center space-y-2 py-2">
                <div className="w-12 h-12 rounded-full bg-sheeba-purple text-sheeba-coral flex items-center justify-center mx-auto shadow-md">
                  <Zap className="w-6 h-6 animate-pulse" />
                </div>
                <p className="text-xs font-bold text-sheeba-dark">Web Camera Scanner</p>
                <p className="text-[11px] text-gray-500">Instant Approval Verification</p>
              </div>

              {/* 3. Result: Badge Awarded + Report Updated */}
              <div className="bg-[#FAF7F5] border border-sheeba-rose/30 p-5 rounded-2xl space-y-3 text-left">
                <div className="flex items-center gap-2 text-[#2A7B5F] font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  Check-in Approved
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200/80 space-y-1 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sheeba-purple">
                    <Award className="w-3.5 h-3.5 text-sheeba-coral" />
                    <span>Badge Issued: &quot;Attended&quot;</span>
                  </div>
                  <p className="text-[11px] text-gray-500">Given by GDG Addis</p>
                </div>
                <p className="text-[10px] bg-sheeba-purple text-white px-2.5 py-1 rounded-full font-mono text-center">
                  Sponsor Report Turnout Rate: 85.3%
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* 3. FEATURES: 4-BADGE SYSTEM SHOWCASE */}
      <section id="features" className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8 scroll-mt-24">
        <FadeIn direction="up">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-sheeba-purple/10 text-sheeba-purple">
              The Sheba Credential Standard
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-sheeba-dark">
              Fixed Four-Badge Model
            </h2>
            <p className="text-sm text-gray-600 max-w-xl mx-auto font-light">
              Clear, tamper-proof distinctions of community participation without inflated scores.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { code: 'Attended', desc: 'Auto-awarded upon door check-in approval', color: 'primary' as const },
            { code: 'Participant', desc: 'Awarded to hands-on workshop coders', color: 'secondary' as const },
            { code: 'Winner', desc: 'Awarded to hackathon prize recipients', color: 'accent' as const },
            { code: 'Speaker', desc: 'Awarded to keynote & session leads', color: 'tertiary' as const },
          ].map((b, idx) => (
            <FadeIn key={b.code} delay={idx * 100}>
              <div className="p-5 rounded-2xl bg-white border border-gray-200/80 text-left space-y-2 shadow-xs hover:border-sheeba-rose transition-colors">
                <Badge variant={b.color} icon={<Award className="w-3 h-3" />}>
                  {b.code}
                </Badge>
                <p className="text-xs text-gray-600 leading-relaxed font-light">{b.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 scroll-mt-24">
        <FadeIn direction="up">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-sheeba-pink/10 text-sheeba-pink">
              Seamless Flow
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-sheeba-dark">
              How Sheba Works
            </h2>
            <p className="text-sm text-gray-600 max-w-lg mx-auto font-light">
              Simple 3-step lifecycle connecting organizers, attendees, and sponsors with verified data.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FadeIn delay={100}>
            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-sheeba-purple/10 flex items-center justify-center text-sheeba-purple font-serif font-bold text-lg">
                1
              </div>
              <h3 className="font-serif font-bold text-lg text-sheeba-dark">Publish & Share</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
                Create single-day tech events with custom question forms. Share simple registration links across Telegram and social channels.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-sheeba-rose/15 flex items-center justify-center text-sheeba-rose font-serif font-bold text-lg">
                2
              </div>
              <h3 className="font-serif font-bold text-lg text-sheeba-dark">Scan at the Door</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
                Use any smartphone camera to scan dynamically signed QR passes. Verify genuine attendees and prevent duplicates in milliseconds.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-sheeba-coral/20 flex items-center justify-center text-sheeba-purple font-serif font-bold text-lg">
                3
              </div>
              <h3 className="font-serif font-bold text-lg text-sheeba-dark">Proof & Badges</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
                Attendees instantly receive tamper-proof digital credentials on their public profile. Organizers export clean, sponsor-ready reports.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 5. TARGET AUDIENCES */}
      <section id="audiences" className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 scroll-mt-24">
        <FadeIn direction="up">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-sheeba-indigo/10 text-sheeba-indigo">
              Built for the Community
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-sheeba-dark">
              Who Is Sheba Built For?
            </h2>
            <p className="text-sm text-gray-600 max-w-lg mx-auto font-light">
              Empowering every stakeholder in the Ethiopian technology and startup landscape.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FadeIn delay={100}>
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/80 space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-sheeba-purple/10 text-sheeba-purple flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-xl text-sheeba-dark">For Attendees & Developers</h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600 font-light">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2A7B5F] shrink-0 mt-0.5" />
                  <span>Build a verified public portfolio of hackathons, workshops, and meetups you actually attended.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2A7B5F] shrink-0 mt-0.5" />
                  <span>Permanent shareable URLs to showcase skills and credentials to international and local employers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2A7B5F] shrink-0 mt-0.5" />
                  <span>Zero paper tickets or lost registration emails. Everything accessible in one place.</span>
                </li>
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/80 space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-sheeba-rose/15 text-sheeba-rose flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-xl text-sheeba-dark">For Organizers & Sponsors</h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600 font-light">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2A7B5F] shrink-0 mt-0.5" />
                  <span>Eliminate spreadsheet chaos and manual check-in bottlenecks at the venue entrance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2A7B5F] shrink-0 mt-0.5" />
                  <span>1-click sponsor-ready attendance reports with turnout rates and verified participant rosters.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2A7B5F] shrink-0 mt-0.5" />
                  <span>Award authentic Winner, Speaker, and Participant badges recognized community-wide.</span>
                </li>
              </ul>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 6. ROADMAP */}
      <section id="roadmap" className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 scroll-mt-24">
        <FadeIn direction="up">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-sheeba-purple/10 text-sheeba-purple">
              Future Milestones
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-sheeba-dark">
              Platform Roadmap
            </h2>
            <p className="text-sm text-gray-600 max-w-lg mx-auto font-light">
              Phase-by-phase evolution of Ethiopia&apos;s digital event infrastructure.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FadeIn delay={100}>
            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sheeba-purple bg-sheeba-purple/10 px-2.5 py-0.5 rounded-full">Phase 1</span>
                <span className="text-[11px] text-[#2A7B5F] font-semibold">Live Now</span>
              </div>
              <h4 className="font-serif font-bold text-base text-sheeba-dark">Core Infrastructure</h4>
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                Dynamic signed QR passes, instant web camera door check-in, 4-badge verification, and downloadable sponsor reports.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sheeba-rose bg-sheeba-rose/10 px-2.5 py-0.5 rounded-full">Phase 2</span>
                <span className="text-[11px] text-sheeba-rose font-semibold">Upcoming</span>
              </div>
              <h4 className="font-serif font-bold text-base text-sheeba-dark">Telegram Native Bot</h4>
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                Seamless Telegram bot ticketing, instant push notifications, Ethiopian calendar support, and local SMS reminders.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sheeba-indigo bg-sheeba-indigo/10 px-2.5 py-0.5 rounded-full">Phase 3</span>
                <span className="text-[11px] text-gray-500 font-semibold">Planned</span>
              </div>
              <h4 className="font-serif font-bold text-base text-sheeba-dark">Ecosystem Network</h4>
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                Developer talent graph, automated sponsor settlement matching, on-chain credential hashing, and developer analytics.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 7. TEAM & COMMUNITY */}
      <section id="team" className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 scroll-mt-24">
        <FadeIn direction="up">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-sheeba-rose/10 text-sheeba-rose">
              Ecosystem Driven
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-sheeba-dark">
              Built with Ethiopian Tech Communities
            </h2>
            <p className="text-sm text-gray-600 max-w-xl mx-auto font-light">
              Partnering with grassroots developer circles, university tech clubs, and innovation hubs across Addis Ababa and beyond.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="p-8 rounded-3xl bg-white border border-gray-200/80 shadow-xs max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-around gap-6">
            <div className="text-center space-y-1">
              <div className="font-serif font-bold text-3xl text-sheeba-dark">100%</div>
              <div className="text-xs text-gray-500 font-light">Verifiable Credentials</div>
            </div>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <div className="text-center space-y-1">
              <div className="font-serif font-bold text-3xl text-sheeba-dark">&lt; 0.5s</div>
              <div className="text-xs text-gray-500 font-light">QR Door Check-In Speed</div>
            </div>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <div className="text-center space-y-1">
              <div className="font-serif font-bold text-3xl text-sheeba-dark">Sponsor-Ready</div>
              <div className="text-xs text-gray-500 font-light">Live CSV & PDF Metrics</div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* 8. CTA SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <FadeIn direction="up">
          <div className="bg-sheeba-gradient text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-xl">
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
              Proof you showed up.
            </h2>
            <p className="text-base sm:text-lg text-white/90 max-w-xl mx-auto leading-relaxed font-light">
              Join Ethiopian developer communities hosting hackathons, workshops, and meetups on Sheba infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Link to="/register">
                <Button size="lg" variant="accent" icon={<LogIn className="w-5 h-5" />}>
                  Get Started / Register
                </Button>
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
};
