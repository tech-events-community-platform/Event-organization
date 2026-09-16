import React from 'react';
import FadeIn from '../FadeIn';
import { Award, Users, CalendarCheck, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RoleSpotlightSection: React.FC = () => {
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 lg:space-y-20 scroll-mt-28">
      {/* Section Header */}
      <FadeIn direction="up">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#63474D]/10 text-[#63474D] text-xs font-bold uppercase tracking-wider">
            <span>Three-Sided Ecosystem</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D1F23] tracking-tight">
            How Sheeba Powers Every Role
          </h2>
          <p className="text-sm sm:text-base text-[#2D1F23] leading-relaxed font-medium">
            A unified, tamper-proof platform connecting attendees, organizers, and corporate sponsors with verified data and zero friction.
          </p>
        </div>
      </FadeIn>

      {/* Alternating Layout: Matching Screenshot 1 */}
      <div className="space-y-16 lg:space-y-24">
        {/* ROW 1: Attendees (Text Left, Badge Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
          <FadeIn direction="right">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFA686]/20 text-[#63474D] text-xs font-bold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" />
                <span>For Attendees</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1F23]">
                Verifiable Proof of Attendance & Digital Badges
              </h3>
              <p className="text-sm sm:text-base text-[#2D1F23] leading-relaxed font-medium">
                Every time you attend a gathering that matters, your participation is preserved as authentic, tamper-proof proof. No more digging through inbox clutter for paper tickets or lost confirmation emails. Attendees carry a permanent digital pass wallet and earn official participation badges—from Attended and Participant to Speaker and Winner—recognized by organizations and peers across Ethiopia.
              </p>
              <div className="pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#63474D] hover:text-[#4E373C] group"
                >
                  <span>Create your attendee profile</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="left">
            <div className="flex justify-center md:justify-end">
              {/* Badge directly on main background, smaller, fully visible, no circular container */}
              <div className="flex flex-col items-center group">
                <img
                  src="/badges/attended-badge.jpg"
                  alt="Attended Badge"
                  className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                />
                <div className="mt-3 bg-[#63474D] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 whitespace-nowrap">
                  <Award className="w-3.5 h-3.5 text-[#FFA686]" />
                  <span>Attended Badge</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* ROW 2: Organizers (Badge Left, Text Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
          <FadeIn direction="right" className="order-2 md:order-1">
            <div className="flex justify-center md:justify-start">
              {/* Badge directly on main background, smaller, fully visible, no circular container */}
              <div className="flex flex-col items-center group">
                <img
                  src="/badges/speaker-badge.jpg"
                  alt="Speaker & Organizer Badge"
                  className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                />
                <div className="mt-3 bg-[#2D1F23] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 whitespace-nowrap">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFA686]" />
                  <span>Verified Organizer</span>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="left" className="order-1 md:order-2">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#63474D]/10 text-[#63474D] text-xs font-bold uppercase tracking-wider">
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>For Organizers</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1F23]">
                Effortless Door Check-In & Sponsor Pitching
              </h3>
              <p className="text-sm sm:text-base text-[#2D1F23] leading-relaxed font-medium">
                Organizing events should never be bottlenecked by manual spreadsheets or long entrance queues. Sheeba equips organizers with instant registration links, camera-based QR door scanners that verify tickets in under half a second, and automated badge issuance. Furthermore, organizers can pitch upcoming, uncreated events on the marketplace to secure funding from sponsors before opening doors.
              </p>
              <div className="pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#63474D] hover:text-[#4E373C] group"
                >
                  <span>Start hosting with Sheeba</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* ROW 3: Sponsors (Text Left, Badge Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
          <FadeIn direction="right">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFA686]/20 text-[#63474D] text-xs font-bold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                <span>For Sponsors</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1F23]">
                Marketplace Discovery & Transparent Turnout Metrics
              </h3>
              <p className="text-sm sm:text-base text-[#2D1F23] leading-relaxed font-medium">
                Back initiatives with absolute confidence. Corporate partners and brands browse upcoming event applications across categories, review expected demographics, and reach out directly to organizers off-platform. Manage active pledges cleanly in Deals & Pledges as Interested or Declined, configure brand deliverables, and receive verifiable post-event metrics backed by real door scans.
              </p>
              <div className="pt-2">
                <Link
                  to="/sponsor/auth"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#63474D] hover:text-[#4E373C] group"
                >
                  <span>Explore sponsor marketplace</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="left">
            <div className="flex justify-center md:justify-end">
              {/* Badge directly on main background, smaller, fully visible, no circular container */}
              <div className="flex flex-col items-center group">
                <img
                  src="/badges/hackathon-winner-badge.jpg"
                  alt="Recognized Excellence Badge"
                  className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                />
                <div className="mt-3 bg-[#63474D] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 whitespace-nowrap">
                  <Award className="w-3.5 h-3.5 text-[#FFA686]" />
                  <span>Recognized Excellence</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};
