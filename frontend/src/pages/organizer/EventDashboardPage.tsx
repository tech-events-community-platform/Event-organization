import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Event } from '../../types/event';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Calendar,
  MapPin,
  QrCode,
  BarChart3,
  ArrowLeft,
  Users,
} from 'lucide-react';

export const EventDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="max-w-4xl mx-auto py-12 px-4 animate-pulse h-64 bg-gray-200 rounded-3xl"></div>;
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#17211E]">Event Not Found</h2>
        <Link to="/organizer/events">
          <Button variant="primary">Return to Manage Events</Button>
        </Link>
      </div>
    );
  }

  const attendanceRate =
    event.registeredCount > 0
      ? ((event.checkedInCount / event.registeredCount) * 100).toFixed(1)
      : '0.0';

  const capacityFillPercent = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

  return (
    <div className="space-y-8 pb-12">
      <Link
        to="/organizer/events"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5D4B] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Event List
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[#66736E]">Registrations</span>
          <p className="text-2xl font-extrabold text-[#17211E]">{event.registeredCount}</p>
          <p className="text-[10px] text-[#66736E]">Target capacity: {event.capacity}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[#66736E]">Checked In</span>
          <p className="text-2xl font-extrabold text-[#238B6E]">{event.checkedInCount}</p>
          <p className="text-[10px] text-[#238B6E] font-medium">QR passes verified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[#66736E]">Attendance Rate</span>
          <p className="text-2xl font-extrabold text-[#D6A84F]">{attendanceRate}%</p>
          <p className="text-[10px] text-[#66736E]">Verified turn-out ratio</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[#66736E]">Capacity Usage</span>
          <p className="text-2xl font-extrabold text-[#0B5D4B]">{capacityFillPercent}%</p>
          <p className="text-[10px] text-[#66736E]">{event.capacity - event.registeredCount} seats open</p>
        </div>
      </div>

      {/* Primary Actions Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="text-xs text-[#17211E] font-semibold">
          Quick Execution Options
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Link to={`/organizer/events/${event.id}/scanner`} className="flex-1 sm:flex-initial">
            <Button fullWidth variant="accent" icon={<QrCode className="w-4 h-4" />}>
              Scan QR Pass
            </Button>
          </Link>
          <Link to={`/organizer/events/${event.id}/attendees`} className="flex-1 sm:flex-initial">
            <Button fullWidth variant="primary" icon={<Users className="w-4 h-4" />}>
              View Attendees
            </Button>
          </Link>
          <Link to={`/organizer/events/${event.id}/report`} className="flex-1 sm:flex-initial">
            <Button fullWidth variant="secondary" icon={<BarChart3 className="w-4 h-4" />}>
              View Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress & Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4 shadow-2xs">
          <h3 className="font-bold text-base text-[#17211E]">Registration & Entrance Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#66736E]">Capacity Filled</span>
              <span className="text-[#0B5D4B]">{capacityFillPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div
                className="bg-[#0B5D4B] h-full rounded-full transition-all"
                style={{ width: `${capacityFillPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#66736E]">Door Turnout Rate</span>
              <span className="text-[#238B6E]">{attendanceRate}%</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div
                className="bg-[#238B6E] h-full rounded-full transition-all"
                style={{ width: `${attendanceRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3 shadow-2xs text-xs">
          <h3 className="font-bold text-base text-[#17211E]">Event Summary</h3>
          <p className="text-[#66736E] leading-relaxed">{event.description}</p>
          <div className="pt-2 flex items-center gap-2">
            <span className="font-bold text-[#17211E]">Host:</span>
            <span>{event.organizer.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
