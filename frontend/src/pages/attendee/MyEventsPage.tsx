import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Ticket } from '../../types/ticket';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Calendar, MapPin, QrCode, ShieldCheck, ArrowRight, Ticket as TicketIcon } from 'lucide-react';

export const MyEventsPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Attended'>('Upcoming');

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      if (user) {
        const allTickets = await api.registration.getAttendeeTickets(user.id);
        setTickets(allTickets);
      }
      setLoading(false);
    };
    fetchTickets();
  }, [user]);

  const upcomingTickets = tickets.filter((t) => t.status === 'Valid');
  const attendedTickets = tickets.filter((t) => t.status === 'Checked in' || t.status === 'Expired');
  const currentList = activeTab === 'Upcoming' ? upcomingTickets : attendedTickets;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="space-y-1">
        <Badge variant="primary">QR Wallet</Badge>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2D1F23]">
          My Tickets & QR Wallet
        </h1>
        <p className="text-xs text-[#756366]">
          Stored dynamic QR passes for registered single-day events.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E8DDD7] gap-6">
        <button
          onClick={() => setActiveTab('Upcoming')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'Upcoming'
              ? 'border-[#63474D] text-[#63474D]'
              : 'border-transparent text-[#756366] hover:text-[#2D1F23]'
          }`}
        >
          Active Passes ({upcomingTickets.length})
        </button>
        <button
          onClick={() => setActiveTab('Attended')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'Attended'
              ? 'border-[#63474D] text-[#63474D]'
              : 'border-transparent text-[#756366] hover:text-[#2D1F23]'
          }`}
        >
          Past Attended Passes ({attendedTickets.length})
        </button>
      </div>

      {/* Ticket List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-[#E8DDD7]/50 rounded-2xl"></div>
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-[#E8DDD7] space-y-3 shadow-xs">
          <TicketIcon className="w-10 h-10 text-[#AA767C] mx-auto" />
          <h3 className="font-serif text-base font-bold text-[#2D1F23]">
            {activeTab === 'Upcoming'
              ? "You don't have any active event passes."
              : 'No past ticket records found.'}
          </h3>
          <p className="text-xs text-[#756366]">
            Register for tech hackathons, workshops, or meetups using organizer share links.
          </p>
          <Link to="/search">
            <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
              Search Events
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-3xl p-6 border border-[#E8DDD7] shadow-xs hover:border-[#63474D] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={ticket.status === 'Valid' ? 'success' : 'gray'}
                    icon={<ShieldCheck className="w-3 h-3" />}
                  >
                    {ticket.status}
                  </Badge>
                  <span className="font-mono text-[10px] text-[#756366]">PASS: {ticket.id}</span>
                </div>

                <h3 className="font-serif font-bold text-base text-[#2D1F23] truncate">
                  {ticket.eventTitle}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#756366]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#63474D]" />
                    {ticket.eventDate} • {ticket.eventTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#63474D]" />
                    {ticket.eventLocation}
                  </span>
                </div>
              </div>

              <div className="w-full sm:w-auto pt-2 sm:pt-0">
                <Link to={`/app/ticket/${ticket.eventId}`}>
                  <Button variant="accent" size="sm" fullWidth icon={<QrCode className="w-4 h-4" />}>
                    Open Pass View
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
