import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { BadgeAward } from '../../types/attendance';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Award,
  Calendar,
  MapPin,
  User,
  ShieldCheck,
  ArrowLeft,
  Clock,
} from 'lucide-react';

export const BadgeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [badge, setBadge] = useState<BadgeAward | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadge = async () => {
      setLoading(true);
      if (id) {
        const b = await api.badges.getBadgeById(id);
        setBadge(b);
      }
      setLoading(false);
    };
    fetchBadge();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 animate-pulse">
        <div className="h-64 bg-[#E8DDD7]/50 rounded-3xl"></div>
      </div>
    );
  }

  if (!badge) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <Award className="w-12 h-12 text-[#AA767C] mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-[#2D1F23]">Badge Not Found</h2>
        <p className="text-xs text-[#756366]">
          This badge may have been revoked or the identifier is invalid.
        </p>
        <Link to="/search">
          <Button variant="outline" size="sm">
            Search Other Credentials
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-6 pb-20">
      <Link
        to={`/profile/${badge.attendeeId}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#63474D] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {badge.attendeeName}&apos;s Profile
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DDD7] shadow-sm space-y-6 text-center">
        <div className="w-20 h-20 bg-[#63474D] rounded-full flex items-center justify-center text-[#FFA686] mx-auto shadow-md border-4 border-[#FAF7F5]">
          <Award className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <Badge
            variant={
              badge.badgeCode === 'winner'
                ? 'accent'
                : badge.badgeCode === 'speaker'
                ? 'tertiary'
                : badge.badgeCode === 'participant'
                ? 'secondary'
                : 'primary'
            }
            className="text-xs font-bold px-3.5 py-1"
          >
            {badge.badgeLabel} Badge
          </Badge>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2D1F23]">
            {badge.eventTitle}
          </h1>
          <p className="text-xs font-bold text-[#AA767C]">
            Given by {badge.issuerName}
          </p>
        </div>

        {/* Verification Credential Details */}
        <div className="bg-[#FAF7F5] rounded-2xl p-5 border border-[#E8DDD7] space-y-3 text-left text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-[#E8DDD7]">
            <span className="text-[#756366]">Awarded Recipient</span>
            <span className="font-bold text-[#2D1F23] flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#63474D]" /> {badge.attendeeName}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-[#E8DDD7]">
            <span className="text-[#756366]">Event Category</span>
            <span className="font-semibold text-[#63474D] uppercase font-mono">{badge.eventType}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-[#E8DDD7]">
            <span className="text-[#756366]">Event Date</span>
            <span className="font-semibold text-[#2D1F23] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#63474D]" /> {badge.eventDate}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-[#E8DDD7]">
            <span className="text-[#756366]">Venue Location</span>
            <span className="font-semibold text-[#2D1F23] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#63474D]" /> {badge.eventLocation}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#756366]">Timeline Entry</span>
            <span className="font-mono text-[#756366] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#63474D]" /> {new Date(badge.awardedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Credential Attestation Rule Box */}
        <div className="p-4 bg-[#63474D]/10 rounded-2xl border border-[#63474D]/20 text-xs text-[#63474D] flex items-start gap-2.5 text-left">
          <ShieldCheck className="w-5 h-5 flex-shrink-0 text-[#63474D]" />
          <div>
            <p className="font-bold">Verified Event Credential</p>
            <p className="text-[11px] text-[#756366]">
              This badge was awarded by the verified event organizer ({badge.issuerName}). Badges do not expire and represent direct proof of participation.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Link to={`/profile/${badge.attendeeId}`}>
            <Button fullWidth variant="primary">
              View Recipient Badges Collection
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
