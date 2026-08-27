import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Event } from '../../types/event';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  ArrowLeft,
  XCircle,
  BarChart3,
} from 'lucide-react';

export const AdminEventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      if (id) {
        const evt = await api.getEventById(id);
        setEvent(evt || null);
      }
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  const handleApprove = async () => {
    if (!event) return;
    const updated = await api.events.update(event.id, { status: 'Upcoming' });
    setEvent(updated);
    setStatusMessage('Event status updated to LIVE / UPCOMING.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleCancel = async () => {
    if (!event) return;
    const updated = await api.events.update(event.id, { status: 'Draft' });
    setEvent(updated);
    setStatusMessage('Event status updated to CANCELLED / DRAFT.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto py-12 animate-pulse h-64 bg-gray-200 rounded-3xl"></div>;
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#17211E]">Event Not Found</h2>
        <Link to="/admin/events">
          <Button variant="primary">Return to Admin Events</Button>
        </Link>
      </div>
    );
  }

  const attendanceRate =
    event.registeredCount > 0
      ? ((event.checkedInCount / event.registeredCount) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-8 pb-12">
      <Link
        to="/admin/events"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5D4B] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Admin Events Roster
      </Link>

      {/* Header Banner */}
      <div className="bg-[#064638] text-white p-6 sm:p-8 rounded-3xl space-y-4 shadow-lg border border-[#0B5D4B]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="gold">{event.status}</Badge>
            <Badge variant="green">{event.category}</Badge>
          </div>
          <span className="text-xs text-gray-300 font-mono">ID: {event.id}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">{event.title}</h1>

        <div className="flex flex-wrap items-center gap-6 text-xs text-gray-300">
          <span className="flex items-center gap-1.5 font-semibold text-[#D6A84F]">
            Host: {event.organizer.name}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#D6A84F]" />
            {event.date} • {event.time}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#D6A84F]" />
            {event.venueName}
          </span>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-[#238B6E]/10 border border-[#238B6E]/40 p-4 rounded-2xl text-xs font-bold text-[#238B6E] flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          {statusMessage}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[#66736E]">Registrations</span>
          <p className="text-3xl font-extrabold text-[#17211E]">{event.registeredCount}</p>
          <p className="text-[10px] text-[#66736E]">Capacity: {event.capacity}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[#66736E]">Checked In</span>
          <p className="text-3xl font-extrabold text-[#238B6E]">{event.checkedInCount}</p>
          <p className="text-[10px] text-[#238B6E] font-medium">Door QR Verified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[#66736E]">Attendance Rate</span>
          <p className="text-3xl font-extrabold text-[#D6A84F]">{attendanceRate}%</p>
          <p className="text-[10px] text-[#66736E]">Turnout ratio</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs font-bold text-[#17211E]">
          Platform Administration Actions
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Button onClick={handleApprove} variant="primary" size="sm" icon={<CheckCircle2 className="w-4 h-4" />}>
            Approve / Make Live
          </Button>
          <Button onClick={handleCancel} variant="danger" size="sm" icon={<XCircle className="w-4 h-4" />}>
            Cancel Event
          </Button>
          <Link to={`/organizer/events/${event.id}/attendees`}>
            <Button variant="outline" size="sm" icon={<Users className="w-4 h-4" />}>
              View Attendees
            </Button>
          </Link>
          <Link to={`/organizer/events/${event.id}/report`}>
            <Button variant="secondary" size="sm" icon={<BarChart3 className="w-4 h-4" />}>
              View Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Details & Information */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-3 text-xs">
        <h3 className="font-bold text-base text-[#17211E]">Event Overview</h3>
        <p className="text-[#66736E] leading-relaxed whitespace-pre-line">{event.description}</p>
        <div className="pt-2 flex items-center justify-between border-t border-gray-100 text-[#17211E]">
          <span>Location: {event.location}</span>
          <span className="font-bold">Capacity: {event.capacity} Attendees</span>
        </div>
      </div>
    </div>
  );
};
