import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Ticket } from '../../types/ticket';
import type { Event } from '../../types/event';
import { TicketCard } from '../../components/ticket/TicketCard';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, AlertCircle, QrCode } from 'lucide-react';

export const TicketPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      if (eventId) {
        const evt = await api.getEventById(eventId);
        setEvent(evt || null);

        if (user) {
          const tkt = await api.getTicketForEvent(eventId, user.id);
          setTicket(tkt || null);
        }
      }
      setLoading(false);
    };
    fetchTicket();
  }, [eventId, user]);

  const handleIssueTicket = async () => {
    if (!eventId || !user) return;
    setRegistering(true);
    try {
      const newTicket = await api.registerForEvent(
        eventId,
        user.id,
        user.name,
        user.telegramHandle
      );
      setTicket(newTicket);
    } catch (e) {
      console.error(e);
    } finally {
      setRegistering(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-4 animate-pulse">
        <div className="h-96 bg-gray-200 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link
          to="/app/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5D4B] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Events
        </Link>
      </div>

      {ticket ? (
        <TicketCard ticket={ticket} onDownload={handleDownload} />
      ) : (
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 space-y-4 shadow-md">
          <AlertCircle className="w-12 h-12 text-[#D6A84F] mx-auto" />
          <h2 className="text-xl font-bold text-[#17211E]">No Ticket Found for this Event</h2>
          <p className="text-xs text-[#66736E]">
            {event
              ? `You haven't registered for "${event.title}" yet.`
              : 'Please register to generate your official Sheba entrance QR ticket pass.'}
          </p>
          {event && (
            <Button
              onClick={handleIssueTicket}
              isLoading={registering}
              variant="primary"
              fullWidth
              icon={<QrCode className="w-4 h-4" />}
            >
              Register & Get Ticket Pass
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
