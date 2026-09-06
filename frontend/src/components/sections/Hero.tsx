import { Link } from 'react-router-dom';
import { ArrowRight, QrCode } from 'lucide-react';
import FadeIn from '../FadeIn';

export default function Hero() {
  return (
    <section className="relative pt-36 pb-20 lg:pt-44 lg:pb-32 overflow-hidden min-h-[82vh] flex items-center bg-[#153E2A]">
      {/* Background Image Layer with Subtly Tapered Gradient Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/hero.jpg"
          alt="Ethiopian Tech Ecosystem"
          className="w-full h-full object-cover object-right lg:object-[82%_center] opacity-80"
        />
        {/* Subtle Brand Gradient Overlay: Dark Green #153E2A & Olive Green #8BA448 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#153E2A]/85 via-[#153E2A]/50 via-40% via-[#8BA448]/20 to-transparent"></div>
        {/* Gentle Top & Bottom Edge Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#153E2A]/50 via-transparent to-[#153E2A]/80"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl space-y-6">
          <FadeIn delay={50}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F9FF46]/15 border border-[#F9FF46]/30 text-[#F9FF46] text-xs font-bold shadow-2xs backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#F9FF46] animate-pulse"></span>
              <span>Next-Gen Event Infrastructure for Ethiopia</span>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.12]">
              Event infrastructure built for Ethiopia&apos;s{' '}
              <span className="text-[#F9FF46]">developer ecosystem.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="font-sans text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl font-medium">
              Sheeba turns every attendance that matters into lasting proof. Attendees get a verified record of
              everywhere they show up. Organizers get simple registration links, instant QR check-in, and clean, sponsor-ready reports.
            </p>
          </FadeIn>

          {/* CTAs */}
          <FadeIn delay={300}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#F9FF46] text-[#153E2A] font-extrabold hover:bg-[#e0e63c] shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base group border border-black/10"
              >
                <span>Register (Attendee, Organizer & Sponsor)</span>
                <ArrowRight className="w-4 h-4 text-[#153E2A] group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold hover:border-white hover:bg-white/20 shadow-2xs hover:shadow transition-all duration-200 text-sm sm:text-base"
              >
                <span>Sign In</span>
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-[#8BA448]/50 text-white font-semibold hover:border-[#F9FF46] hover:bg-[#8BA448] shadow-2xs hover:shadow transition-all duration-200 text-sm sm:text-base group"
              >
                <QrCode className="w-4 h-4 text-[#F9FF46] group-hover:text-white" />
                <span>Live Simulator</span>
              </a>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
