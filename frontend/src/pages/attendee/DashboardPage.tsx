import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Ticket } from '../../types/ticket';
import type { VerifiedAttendance } from '../../types/attendance';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  QrCode,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
} from 'lucide-react';

export const AttendeeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [history, setHistory] = useState<VerifiedAttendance[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const userTickets = await api.getTickets();
        const userHistory = await api.getAttendanceHistory(user.id);
        setTickets(userTickets.filter((t) => t.userId === user.id));
        setHistory(userHistory);
      }
    };
    fetchData();
  }, [user]);

  const upcomingTicket = tickets.find((t) => t.status === 'Valid');

  return (
    <div className="space-y-8 pb-10">
      {/* Header Greeting */}
      <div className="bg-[#0B5D4B] text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#D6A84F]/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <Badge variant="gold" icon={<ShieldCheck className="w-3 h-3" />}>
              Verified Attendee Account
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Good morning, {user?.name.split(' ')[0] || 'Member'}! 👋
            </h1>
            <p className="text-xs text-emerald-100">
              Telegram ID: <span className="font-semibold text-[#D6A84F]">{user?.telegramHandle}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#064638] px-4 py-3 rounded-2xl border border-[#D6A84F]/30 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#D6A84F]/20 flex items-center justify-center text-[#D6A84F]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white">{history.length}</span>
              <p className="text-[10px] text-gray-300 uppercase tracking-wider font-semibold">
                Verified Events Attended
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Event & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Upcoming Event Card */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-extrabold text-[#17211E] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0B5D4B]" />
            Upcoming Registered Event Pass
          </h2>

          {upcomingTicket ? (
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-md space-y-6 hover:border-[#0B5D4B]/40 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
                <Badge variant="gold" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                  Status: Valid Pass
                </Badge>
                <span className="font-mono text-xs text-[#66736E]">ID: {upcomingTicket.id}</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#17211E]">{upcomingTicket.eventTitle}</h3>
                <div className="space-y-1 text-xs text-[#66736E]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#0B5D4B]" />
                    <span>{upcomingTicket.eventDate} • {upcomingTicket.eventTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0B5D4B]" />
                    <span>{upcomingTicket.eventLocation}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F7F8F5] p-4 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B5D4B] text-white flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-[#D6A84F]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#17211E]">Show QR at Entrance</p>
                    <p className="text-[11px] text-[#66736E]">Instant verification at door</p>
                  </div>
                </div>
                <Link to={`/app/ticket/${upcomingTicket.eventId}`} className="w-full sm:w-auto">
                  <Button variant="accent" size="sm" fullWidth icon={<QrCode className="w-4 h-4" />}>
                    Open QR Ticket
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 space-y-4 shadow-2xs">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-[#0B5D4B]">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#17211E]">
                You haven&apos;t registered for an upcoming event yet.
              </h3>
              <p className="text-xs text-[#66736E] max-w-sm mx-auto">
                Explore tech workshops, developer hack nights, and AI meetups across Addis Ababa.
              </p>
              <Link to="/events">
                <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Events Now
                </Button>
              </Link>
            </div>
          )}

          {/* Recent Verified Participation */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#17211E]">Recent Participation</h3>
              <Link
                to="/app/profile/attendance"
                className="text-xs font-bold text-[#0B5D4B] hover:underline"
              >
                View Full Timeline
              </Link>
            </div>

            {history.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center text-xs text-[#66736E]">
                Your verified participation will appear here after you attend an event.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200/80 divide-y divide-gray-100 overflow-hidden">
                {history.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#17211E]">{item.eventTitle}</p>
                      <p className="text-[#66736E]">{item.organizerName} • {item.eventDate}</p>
                    </div>
                    <Badge variant="green" icon={<CheckCircle2 className="w-3 h-3" />}>
                      Verified Attended
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Profile Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4 shadow-2xs">
            <h3 className="font-bold text-base text-[#17211E]">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/app/events" className="block">
                <div className="p-3 bg-[#F7F8F5] hover:bg-gray-200/60 rounded-2xl flex items-center justify-between text-xs font-semibold text-[#17211E] transition-colors">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#0B5D4B]" />
                    <span>My Registered Events</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
              <Link to="/app/profile/attendance" className="block">
                <div className="p-3 bg-[#F7F8F5] hover:bg-gray-200/60 rounded-2xl flex items-center justify-between text-xs font-semibold text-[#17211E] transition-colors">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
                    <span>Verified Attendance</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
              <Link to="/events" className="block">
                <div className="p-3 bg-[#F7F8F5] hover:bg-gray-200/60 rounded-2xl flex items-center justify-between text-xs font-semibold text-[#17211E] transition-colors">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#0B5D4B]" />
                    <span>Browse All Tech Events</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
