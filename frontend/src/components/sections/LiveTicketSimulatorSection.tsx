import React, { useState } from 'react';
import FadeIn from '../FadeIn';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  RefreshCw,
  Download,
  Calendar,
  MapPin,
  Building2,
  User,
  Briefcase,
  Share2,
} from 'lucide-react';

export const LiveTicketSimulatorSection: React.FC = () => {
  const [attendeeName, setAttendeeName] = useState('Sara Tesfaye');
  const [jobTitle, setJobTitle] = useState('Founder & Lead Organizer • Horizon');
  const [selectedEvent, setSelectedEvent] = useState('Sheeba Annual Summit 2026');
  const [eventDate] = useState('Saturday, Nov 14, 2026 • 09:00 AM');
  const [location] = useState('Millennium Hall, Addis Ababa');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Dynamic pass token derived from state
  const passCode = `SHB-${(attendeeName.replace(/\s+/g, '').slice(0, 3) || 'USR').toUpperCase()}-8921`;
  const qrTokenPayload = `SHEEBA_TICKET:${passCode}:${attendeeName}:${selectedEvent}`;

  const handleSimulateCheckIn = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsCheckedIn(true);
    }, 600);
  };

  const handleResetCheckIn = () => {
    setIsCheckedIn(false);
  };

  const handleExportBadge = () => {
    alert(`Badge Certificate for "${attendeeName || 'Attendee'}" exported successfully!`);
  };

  return (
    <section id="simulator" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 lg:space-y-16 scroll-mt-28">
      {/* Section Header */}
      <FadeIn direction="up">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D1F23] tracking-tight">
            Your sample ticket and badge
          </h2>
          <p className="text-sm sm:text-base text-[#2D1F23] leading-relaxed font-medium">
            Watch your verified digital ticket update in real time as you enter your details. Click to simulate entrance check-in and reveal your tamper-proof badge dashboard.
          </p>
        </div>
      </FadeIn>

      {/* Simulator Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Interactive Form */}
        <FadeIn direction="right" className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#AA767C]/20 shadow-md space-y-5">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2D1F23]">
                  Attendee Info
                </h3>
                <p className="text-xs text-[#2D1F23]/80 font-medium">Pass updates live on the right as you type</p>
              </div>
              <span className="text-[10px] font-bold bg-[#FFA686]/20 text-[#63474D] px-2 py-0.5 rounded-full uppercase">
                Live Preview
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1F23] mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#63474D]" />
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  placeholder="e.g. Sara Tesfaye"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs font-semibold text-[#2D1F23] focus:border-[#63474D] focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1F23] mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#63474D]" />
                  Job Title / Organization
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Founder & Creative Director"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs font-semibold text-[#2D1F23] focus:border-[#63474D] focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1F23] mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#63474D]" />
                  Select Event
                </label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs font-semibold text-[#2D1F23] focus:border-[#63474D] focus:bg-white outline-none transition-all"
                >
                  <option value="Sheeba Annual Summit 2026">Sheeba Annual Summit 2026</option>
                  <option value="Addis Creative & Cultural Expo">Addis Creative & Cultural Expo</option>
                  <option value="National Leadership & Innovation Forum">National Leadership & Innovation Forum</option>
                </select>
              </div>
            </div>

            {/* Check-In & Badge Trigger Action */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <button
                type="button"
                onClick={isCheckedIn ? handleResetCheckIn : handleSimulateCheckIn}
                disabled={isScanning}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#63474D] hover:bg-[#4E373C] text-white"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Scanning Camera Viewfinder...</span>
                  </>
                ) : isCheckedIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-[#FFA686]" />
                    <span>Reset & Try Another Name</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-[#FFA686]" />
                    <span>Simulate Door Check-In & Claim Badge</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-[#2D1F23] text-center font-medium">
                Simulates real-time &lt; 0.5s door verification and instant badge award.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Right Column: Live Rendered Sheeba Event Ticket */}
        <FadeIn direction="left" className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-md">
            {/* The Ticket Container */}
            <div
              className={`bg-white rounded-3xl shadow-xl border overflow-hidden relative transition-all duration-500 ${
                isCheckedIn
                  ? 'border-emerald-500 ring-4 ring-emerald-500/20 shadow-emerald-500/10'
                  : 'border-[#AA767C]/25'
              }`}
            >
              {/* Top Header Brand (Plum #63474D) */}
              <div className="bg-[#63474D] text-white p-6 text-center relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/logo.jpg"
                      alt="Sheeba Logo"
                      className="h-9 sm:h-10 w-auto object-contain shrink-0 drop-shadow-xs"
                    />
                    <span className="font-serif font-bold text-lg tracking-wider text-white">
                      SHEEBA<span className="text-[#FFA686]">.</span>
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors ${
                      isCheckedIn
                        ? 'bg-emerald-500 text-white'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isCheckedIn ? 'CHECKED IN' : 'VALID'}</span>
                  </span>
                </div>

                <h2 className="font-serif text-xl font-bold text-white mb-1 leading-snug">
                  {selectedEvent}
                </h2>
                <p className="text-xs text-[#E8DDD7] font-medium uppercase font-mono">
                  Official Digital Entrance Pass
                </p>
              </div>

              {/* Card Body Details */}
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#756366] uppercase tracking-wider text-[10px] font-bold block mb-1">
                      ATTENDEE NAME
                    </span>
                    <p className="font-bold text-[#2D1F23] text-sm truncate">
                      {attendeeName || 'Guest Attendee'}
                    </p>
                    <p className="text-[11px] text-[#2D1F23] font-medium truncate">
                      {jobTitle || 'Participant'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[#756366] uppercase tracking-wider text-[10px] font-bold block mb-1">
                      PASS NUMBER
                    </span>
                    <p className="font-mono font-bold text-[#2D1F23] text-xs bg-[#FAF7F5] border border-gray-200 px-2 py-1 rounded-md inline-block">
                      {passCode}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-[#2D1F23]">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-[#63474D] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-[#2D1F23]">{eventDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 pt-0.5">
                    <MapPin className="w-4 h-4 text-[#63474D] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-[#2D1F23]">{location}</p>
                    </div>
                  </div>
                </div>

                {/* Ticket Tear Line Separator */}
                <div className="relative py-2 flex items-center justify-center">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-4 h-8 bg-[#fcfafc] rounded-r-full border-r border-[#AA767C]/30" />
                  <div className="w-full border-t-2 border-dashed border-gray-200" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-4 h-8 bg-[#fcfafc] rounded-l-full border-l border-[#AA767C]/30" />
                </div>

                {/* Dynamic QR Code Display */}
                <div className="text-center space-y-3 pt-1">
                  <div
                    className={`p-4 rounded-2xl border-2 inline-block transition-all duration-300 ${
                      isCheckedIn
                        ? 'bg-emerald-50/60 border-emerald-400 shadow-lg'
                        : 'bg-[#FAF7F5] border-[#D6A184]/50 shadow-inner'
                    }`}
                  >
                    <QRCodeSVG
                      value={qrTokenPayload}
                      size={160}
                      bgColor={isCheckedIn ? '#ecfdf5' : '#FAF7F5'}
                      fgColor="#63474D"
                      level="H"
                      includeMargin={false}
                    />
                    <div className="mt-2 text-[10px] font-mono text-[#2D1F23] font-bold truncate max-w-[160px] mx-auto">
                      {passCode}
                    </div>
                  </div>

                  {/* Verification pill indicator */}
                  <div
                    className={`flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-4 rounded-xl border transition-colors ${
                      isCheckedIn
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {isCheckedIn
                        ? 'Door Check-In Approved! Attended Badge Awarded.'
                        : 'Evaluated live server-side at door entrance.'}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#2D1F23] font-medium">
                    Pass remains cryptographically signed and tamper-proof.
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="bg-[#FAF7F5] px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#2D1F23]">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-[#63474D]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Dynamic Signed Pass
                </span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1 text-[#63474D] hover:underline font-bold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Print / Save Pass
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* REVEALED BADGE DASHBOARD (Generated upon clicking Check-In) */}
      {isCheckedIn && (
        <FadeIn direction="up">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#63474D]/25 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200">
                    Live Status: Checked In
                  </span>
                  <span className="text-xs text-[#2D1F23] font-semibold">
                    Turnout Verified
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#2D1F23]">
                  {attendeeName}&apos;s Badge Dashboard
                </h3>
                <p className="text-xs text-[#2D1F23] font-medium mt-0.5">
                  Official participation record stored on your public Sheeba profile
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportBadge}
                  className="px-4 py-2.5 rounded-xl bg-[#63474D] hover:bg-[#4E373C] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#FFA686]" />
                  <span>Export Badge</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert(`Shareable Credential Link: https://sheeba.et/p/${passCode}`)}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-200 hover:bg-stone-50 text-xs font-bold text-[#2D1F23] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#63474D]" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* The Badge Row */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-50 to-white border border-[#AA767C]/25 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-left w-full sm:w-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shrink-0 shadow-md">
                  <img
                    src="/badges/attended-badge.jpg"
                    alt="Attended Badge"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-serif font-bold text-base text-[#2D1F23]">
                      Attended Badge
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#63474D] text-white">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-[#2D1F23] font-medium truncate">
                    Event: {selectedEvent}
                  </p>
                  <p className="text-[11px] text-[#756366] font-mono mt-0.5">
                    Credential ID: {passCode}-VERIFIED • Awarded Just Now
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-[#756366]">Status</p>
                  <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    Issued & Sealed
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportBadge}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#2D1F23] transition-colors"
                  title="Export Certificate"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
      )}
    </section>
  );
};
