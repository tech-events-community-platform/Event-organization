import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { BadgeAward } from '../../types/attendance';
import { Badge } from '../../components/ui/Badge';
import { Award, Calendar, MapPin, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AttendanceHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<BadgeAward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      if (user) {
        const data = await api.badges.getAttendeeBadges(user.id);
        setBadges(data);
      }
      setLoading(false);
    };
    fetchHistory();
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <Link
        to="/app/profile"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#63474D] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </Link>

      {/* Header Banner */}
      <div className="bg-[#63474D] text-white p-6 sm:p-8 rounded-3xl space-y-3 shadow-sm">
        <Badge variant="accent" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          Verified Participation Log
        </Badge>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
          Verified Attendance Timeline
        </h1>
        <p className="text-xs text-[#E8DDD7] leading-relaxed">
          Official attendance entries verified at the door and credentialed by community organizers.
        </p>
      </div>

      {/* Timeline list */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-[#E8DDD7]/50 rounded-2xl"></div>
          ))}
        </div>
      ) : badges.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-[#E8DDD7] space-y-2">
          <p className="font-serif text-sm font-bold text-[#2D1F23]">No verified participation records yet.</p>
          <p className="text-xs text-[#756366]">
            Your attendance will appear here automatically when you check in at an event door scanner.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-[#D6A184]/50 space-y-6">
          {badges.map((record) => (
            <div key={record.id} className="relative group">
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#63474D] border-2 border-white ring-4 ring-[#63474D]/20"></div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8DDD7] shadow-xs space-y-3 hover:border-[#63474D] transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant={
                      record.badgeCode === 'winner'
                        ? 'accent'
                        : record.badgeCode === 'speaker'
                        ? 'tertiary'
                        : record.badgeCode === 'participant'
                        ? 'secondary'
                        : 'primary'
                    }
                    icon={<Award className="w-3.5 h-3.5" />}
                  >
                    {record.badgeLabel}
                  </Badge>
                  <span className="text-[10px] font-mono text-[#756366]">
                    Awarded: {new Date(record.awardedAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-base text-[#2D1F23]">{record.eventTitle}</h3>
                  <p className="text-xs text-[#AA767C] font-semibold mt-0.5">
                    Given by {record.issuerName}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E8DDD7] flex items-center justify-between text-xs text-[#756366]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#63474D]" />
                    Event Date: {record.eventDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#63474D]" />
                    {record.eventLocation.split(',')[0]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
