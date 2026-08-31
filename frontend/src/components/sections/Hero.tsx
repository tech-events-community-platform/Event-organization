import { Link } from 'react-router-dom';
import { ArrowRight, QrCode } from 'lucide-react';
import FadeIn from '../FadeIn';

export default function Hero() {
  return (
    <section className="relative pt-36 pb-20 lg:pt-44 lg:pb-32 overflow-hidden min-h-[82vh] flex items-center">
      {/* Background Image Layer with Subtly Tapered Gradient Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/hero.jpg"
          alt="Ethiopian Tech Ecosystem"
          className="w-full h-full object-cover object-right lg:object-[82%_center] opacity-85"
        />
        {/* Soft Horizontal Fade: Leaves the middle and right wide open and clear */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#ffffff]/85 from-0% via-[#ffffff]/45 via-30% via-transparent via-90% to-transparent"></div>
        {/* Subtle Top Line and Bottom Line Edge Blend (Middle left with way less intensity) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#ffffff]/40 from-0% via-transparent via-25% via-transparent via-70% to-[#ffffff] to-100%"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl space-y-6">
          <FadeIn delay={100}>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-sheeba-dark leading-[1.12]">
              Event infrastructure built for Ethiopia&apos;s{' '}
              <span className="text-gradient">developer ecosystem.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="font-sans text-lg sm:text-xl text-grey-1200 leading-relaxed max-w-2xl font-medium">
              Sheeba turns evey attendance that matters into a lasting proof. Attendees get a verified record of
              everywhere they show up to. Organizers get simple registration links, instant QR check-in, and clean reports
              and data they can trust that's ready for sponsors.
            </p>
          </FadeIn>

          {/* CTAs */}
          <FadeIn delay={300}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#63474D] text-white font-bold hover:bg-[#523a3f] shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base group"
              >
                <span>Register (Attendee & Organizer)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white border border-[#E8DDD7] text-[#2D1F23] font-semibold hover:border-[#63474D] hover:text-[#63474D] shadow-xs hover:shadow transition-all duration-200 text-sm sm:text-base"
              >
                <span>Sign In</span>
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 font-semibold hover:border-sheeba-purple hover:text-sheeba-purple shadow-xs hover:shadow transition-all duration-200 text-sm sm:text-base"
              >
                <QrCode className="w-4 h-4 text-sheeba-pink" />
                <span>Live Simulator</span>
              </a>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
