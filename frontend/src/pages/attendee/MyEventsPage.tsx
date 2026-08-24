import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Ticket } from '../../types/ticket';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Calendar, MapPin, QrCode, ShieldCheck, ArrowRight } from 'lucide-react';

export const MyEventsPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Attended'>('Upcoming');

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      if (user) {
        const allTickets = await api.getTickets();
        setTickets(allTickets.filter((t) => t.userId === user.id));
      }
      setLoading(false);
    };
    fetchTickets();
  }, [user]);

  const upcomingTickets = tickets.filter((t) => t.status === 'Valid');
  const attendedTickets = tickets.filter((t) => t.status === 'Checked in' || t.status === 'Expired');

  const currentList = activeTab === 'Upcoming' ? upcomingTickets : attendedTickets;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-extrabold text-[#17211E]">My Events</h1>
        <p className="text-xs text-[#66736E]">Manage your registered event passes and verified participation history.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab('Upcoming')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'Upcoming'
              ? 'border-[#0B5D4B] text-[#0B5D4B]'
              : 'border-transparent text-[#66736E] hover:text-[#17211E]'
          }`}
        >
          Upcoming ({upcomingTickets.length})
        </button>
        <button
          onClick={() => setActiveTab('Attended')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'Attended'
              ? 'border-[#0B5D4B] text-[#0B5D4B]'
              : 'border-transparent text-[#66736E] hover:text-[#17211E]'
          }`}
        >
          Attended ({attendedTickets.length})
        </button>
      </div>

      {/* Event Ticket List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 space-y-3">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-[#17211E]">
            {activeTab === 'Upcoming'
              ? "You haven't registered for any upcoming events."
              : 'No attended event history found.'}
          </h3>
          <p className="text-xs text-[#66736E]">
            Discover workshops, hackathons, and technical meetups to participate.
          </p>
          <Link to="/events">
            <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
              Explore Events
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={ticket.status === 'Valid' ? 'gold' : 'green'}
                    icon={<ShieldCheck className="w-3 h-3" />}
                  >
                    {ticket.status === 'Valid' ? 'Registered' : 'Checked In'}
                  </Badge>
                  <span className="font-mono text-[10px] text-[#66736E]">ID: {ticket.id}</span>
                </div>

                <h3 className="font-bold text-base text-[#17211E] truncate">{ticket.eventTitle}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#66736E]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#0B5D4B]" />
                    {ticket.eventDate} • {ticket.eventTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#0B5D4B]" />
                    {ticket.eventLocation}
                  </span>
                </div>
              </div>

              <div className="w-full sm:w-auto pt-2 sm:pt-0">
                <Link to={`/app/ticket/${ticket.eventId}`}>
                  <Button variant="accent" size="sm" fullWidth icon={<QrCode className="w-4 h-4" />}>
                    View Ticket Pass
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
