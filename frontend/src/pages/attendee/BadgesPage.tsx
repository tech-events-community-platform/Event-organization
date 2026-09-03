import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { BadgeAward } from '../../types/attendance';
import { Button } from '../../components/ui/Button';
import {
  Award,
  ShieldCheck,
  Calendar,
  MapPin,
  Download,
  CheckCircle2,
  Sparkles,
  Ticket as TicketIcon,
} from 'lucide-react';

export const BadgesPage: React.FC = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<BadgeAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingBadgeId, setExportingBadgeId] = useState<string | null>(null);

  // Hidden canvas reference for client-side badge export
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      setLoading(true);
      try {
        if (user) {
          const userBadges = await api.badges.getAttendeeBadges(user.id);
          setBadges(userBadges || []);
        }
      } catch (err) {
        console.error('Failed to load badges:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [user]);

  // Section 7: Client-side Badge Export to PNG image
  const handleExportBadge = (badge: BadgeAward) => {
    setExportingBadgeId(badge.id);

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setExportingBadgeId(null);
      return;
    }

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 630);
    bgGradient.addColorStop(0, '#2D1F23');
    bgGradient.addColorStop(1, '#63474D');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Card border
    ctx.strokeStyle = '#AA767C';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 1140, 570);

    // Inner card background
    ctx.fillStyle = '#FAF7F5';
    ctx.fillRect(40, 40, 1120, 550);

    // Header bar
    ctx.fillStyle = '#63474D';
    ctx.fillRect(40, 40, 1120, 90);

    // Brand title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px serif';
    ctx.fillText('SHEEBA • OFFICIAL VERIFIED CREDENTIAL', 80, 98);

    // Badge Type Stamp
    ctx.fillStyle = '#AA767C';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`TIER: ${badge.badgeLabel.toUpperCase()}`, 80, 180);

    // Event Title
    ctx.fillStyle = '#2D1F23';
    ctx.font = 'bold 44px serif';
    ctx.fillText(badge.eventTitle, 80, 245);

    // Given by Organizer (Section 5 & 7 requirement)
    const givenByText = `Given by ${badge.givenBy || badge.issuerName || badge.organizerName || 'Organizer'}`;
    ctx.fillStyle = '#63474D';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(givenByText, 80, 295);

    // Divider line
    ctx.strokeStyle = '#E8DDD7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 330);
    ctx.lineTo(1100, 330);
    ctx.stroke();

    // Recipient line
    ctx.fillStyle = '#756366';
    ctx.font = '20px sans-serif';
    ctx.fillText('Awarded To Verified Attendee:', 80, 375);

    ctx.fillStyle = '#2D1F23';
    ctx.font = 'bold 30px serif';
    ctx.fillText(badge.attendeeName, 80, 415);

    // Logistics
    ctx.fillStyle = '#756366';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Event Date: ${badge.eventDate}`, 80, 470);
    ctx.fillText(`Location: ${badge.eventLocation}`, 80, 505);

    // Security badge seal on right
    ctx.fillStyle = '#1b4332';
    ctx.beginPath();
    ctx.arc(1020, 450, 55, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED', 1020, 445);
    ctx.fillText('PRESENCE', 1020, 465);
    ctx.textAlign = 'left';

    // Download trigger
    const link = document.createElement('a');
    const safeTitle = badge.eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    link.download = `sheba-badge-${badge.badgeCode}-${safeTitle}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    setTimeout(() => {
      setExportingBadgeId(null);
    }, 600);
  };

  const getBadgeIcon = (code: string) => {
    switch (code) {
      case 'winner':
        return '🏆';
      case 'speaker':
        return '🎙️';
      case 'participant':
        return '⭐';
      case 'attended':
      default:
        return '🏅';
    }
  };

  const getBadgePillStyle = (code: string) => {
    switch (code) {
      case 'winner':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'speaker':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'participant':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'attended':
      default:
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
        <div className="h-10 w-48 bg-gray-200 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-56 bg-gray-100 rounded-3xl animate-pulse"></div>
          <div className="h-56 bg-gray-100 rounded-3xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 pb-24">
      {/* Hidden canvas for client-side rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-7 h-7 text-[#63474D]" />
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#2D1F23]">
              My Badges
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#756366] font-light mt-1">
            Authentic, tamper-proof credentials issued by organizers at verified events.
          </p>
        </div>

        {badges.length > 0 && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{badges.length} Verified Badges Earned</span>
          </div>
        )}
      </div>

      {/* SECTION 5: STATE 1 — Designed Empty State */}
      {badges.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E8DDD7] p-8 sm:p-12 shadow-xs text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-[#63474D]/10 text-[#63474D] flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-10 h-10 text-[#63474D]" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[#2D1F23]">
              Your Badges Will Unlock Here
            </h2>
            <p className="text-xs text-[#756366] max-w-md mx-auto leading-relaxed">
              Sheeba badges are not earned by registering — they are officially issued when an organizer checks you in at the door on the day of the event.
            </p>
          </div>

          {/* Educational 4-Badge Tier Preview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-left">
            <div className="p-3.5 rounded-2xl bg-[#FAF7F5] border border-[#E8DDD7] space-y-1">
              <span className="text-2xl block">🏅</span>
              <p className="font-bold text-xs text-[#2D1F23]">Attended</p>
              <p className="text-[10px] text-[#756366] leading-tight">
                Awarded instantly upon door check-in scan.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF7F5] border border-[#E8DDD7] space-y-1">
              <span className="text-2xl block">⭐</span>
              <p className="font-bold text-xs text-[#2D1F23]">Participant</p>
              <p className="text-[10px] text-[#756366] leading-tight">
                Awarded for active project submission.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF7F5] border border-[#E8DDD7] space-y-1">
              <span className="text-2xl block">🏆</span>
              <p className="font-bold text-xs text-[#2D1F23]">Winner</p>
              <p className="text-[10px] text-[#756366] leading-tight">
                Awarded for podium and track achievements.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF7F5] border border-[#E8DDD7] space-y-1">
              <span className="text-2xl block">🎙️</span>
              <p className="font-bold text-xs text-[#2D1F23]">Speaker</p>
              <p className="text-[10px] text-[#756366] leading-tight">
                Awarded to keynote speakers & mentors.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E8DDD7] flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/app/events">
              <Button variant="primary" size="md" className="flex items-center gap-2">
                <TicketIcon className="w-4 h-4" />
                <span>View Registered Events & Passes</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* SECTION 5: STATE 2 — Non-Empty State: Badge Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {badges.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl border border-[#E8DDD7] p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              {/* Card Accent Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#63474D]/5 rounded-full -mr-10 -mt-10 pointer-events-none" />

              <div className="space-y-3">
                {/* Top Row: Badge Pill + Glyph */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold border ${getBadgePillStyle(
                      b.badgeCode
                    )}`}
                  >
                    <span>{getBadgeIcon(b.badgeCode)}</span>
                    <span className="uppercase">{b.badgeLabel}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>

                {/* Event Name */}
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1F23] leading-snug">
                  {b.eventTitle}
                </h3>

                {/* Given by [Organizer] line (Section 5 requirement) */}
                <p className="text-xs font-bold text-[#63474D]">
                  Given by {b.givenBy || b.issuerName || b.organizerName || 'Organizer'}
                </p>

                {/* Logistics */}
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#756366] pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#AA767C]" />
                    {b.eventDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#AA767C]" />
                    {b.eventLocation}
                  </span>
                </div>
              </div>

              {/* Bottom Action: Client-Side Export (Section 7) */}
              <div className="pt-3 border-t border-[#E8DDD7] flex items-center justify-between">
                <span className="text-[10px] text-[#756366] font-mono">
                  Credential #{b.id.substring(0, 8)}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportBadge(b)}
                  isLoading={exportingBadgeId === b.id}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#63474D]" />
                  <span>Export Badge</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
