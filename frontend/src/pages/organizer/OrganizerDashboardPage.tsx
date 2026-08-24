import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Event } from '../../types/event';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Calendar,
  Users,
  QrCode,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';

export const OrganizerDashboardPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const evts = await api.getEvents();
      setEvents(evts);
    };
    fetchData();
  }, []);

  const totalEvents = events.length;
  const upcomingEvents = events.filter((e) => e.status === 'Upcoming').length;
  const totalRegistrations = events.reduce((acc, curr) => acc + curr.registeredCount, 0);
  const totalCheckIns = events.reduce((acc, curr) => acc + curr.checkedInCount, 0);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="gold" icon={<ShieldCheck className="w-3 h-3" />}>
            DevCommunity Ethiopia
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17211E] tracking-tight mt-1">
            Good morning, Organizer 👋
          </h1>
          <p className="text-xs text-[#66736E]">
            Here is your live event attendance activity and community stats.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/organizer/events/evt_react_workshop_2026/scanner">
            <Button variant="accent" size="sm" icon={<QrCode className="w-4 h-4" />}>
              Open QR Scanner
            </Button>
          </Link>
          <Link to="/organizer/events/create">
            <Button variant="primary" size="sm" icon={<PlusCircle className="w-4 h-4" />}>
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: totalEvents, icon: Calendar, color: 'text-[#0B5D4B]' },
          { label: 'Upcoming Events', value: upcomingEvents, icon: TrendingUp, color: 'text-[#D6A84F]' },
          { label: 'Total Registrations', value: totalRegistrations, icon: Users, color: 'text-blue-600' },
          { label: 'Total Check-ins', value: totalCheckIns, icon: CheckCircle2, color: 'text-[#238B6E]' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#66736E]">{stat.label}</span>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#17211E]">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Upcoming Events */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#17211E]">Upcoming Events</h2>
            <Link to="/organizer/events" className="text-xs font-bold text-[#0B5D4B] hover:underline">
              View All
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100 shadow-2xs">
            {events.slice(0, 3).map((evt) => (
              <div key={evt.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="gold">{evt.category}</Badge>
                    <span className="text-xs font-medium text-[#66736E]">{evt.date}</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#17211E] truncate">{evt.title}</h3>
                  <p className="text-xs text-[#66736E] truncate">{evt.venueName}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-[#17211E]">
                      {evt.registeredCount} / {evt.capacity}
                    </p>
                    <p className="text-[10px] text-[#66736E]">Registered</p>
                  </div>
                  <Link to={`/organizer/events/${evt.id}`}>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Recent Check-in Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-[#17211E]">Recent Entrance Check-ins</h2>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-4 shadow-2xs">
            <div className="space-y-3">
              {[
                { name: 'Kirubel Abebe', handle: '@kirubel_tech', time: '02:14 PM', event: 'React Workshop' },
                { name: 'Tigist Worku', handle: '@tigist_dev', time: '02:10 PM', event: 'React Workshop' },
                { name: 'Yared Solomon', handle: '@yared_ai', time: '01:58 PM', event: 'AI Meetup' },
                { name: 'Selam Tekle', handle: '@selam_design', time: '01:45 PM', event: 'Women in Tech' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-[#17211E]">{item.name}</p>
                    <p className="text-[10px] text-[#0B5D4B]">{item.handle} • {item.event}</p>
                  </div>
                  <span className="font-mono text-[10px] bg-emerald-50 text-[#238B6E] px-2 py-0.5 rounded-full font-semibold">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
            <Link to="/organizer/events/evt_react_workshop_2026/report" className="block pt-2">
              <Button fullWidth variant="ghost" size="sm" icon={<BarChart3 className="w-4 h-4" />}>
                View Sponsor Report Data
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
