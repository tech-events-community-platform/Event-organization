import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Event } from '../../types/event';
import type { AdminActivityRecord } from '../../data/mockAdminData';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Users,
  Building2,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  PlusCircle,
  Activity,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [activities, setActivities] = useState<AdminActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const evts = await api.getEvents();
      const acts = await api.getAdminActivity();
      setEvents(evts);
      setActivities(acts);
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalUsers = 1248;
  const totalOrganizers = 18;
  const totalEvents = events.length;
  const totalRegistrations = events.reduce((acc, curr) => acc + curr.registeredCount, 0);
  const totalCheckIns = events.reduce((acc, curr) => acc + curr.checkedInCount, 0);
  const attendanceRate =
    totalRegistrations > 0
      ? ((totalCheckIns / totalRegistrations) * 100).toFixed(1)
      : '84.2';

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="gold" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Platform Administration Console
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17211E] tracking-tight mt-1">
            Admin Dashboard
          </h1>
          <p className="text-xs text-[#66736E]">Monitor and manage the Sheba platform.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/events">
            <Button variant="primary" size="sm" icon={<PlusCircle className="w-4 h-4" />}>
              Platform Event Roster
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Platform Statistics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-blue-600' },
          { label: 'Organizers', value: totalOrganizers, icon: Building2, color: 'text-[#D6A84F]' },
          { label: 'Total Events', value: totalEvents, icon: Calendar, color: 'text-[#0B5D4B]' },
          { label: 'Registrations', value: totalRegistrations, icon: TrendingUp, color: 'text-indigo-600' },
          { label: 'Total Check-ins', value: totalCheckIns, icon: CheckCircle2, color: 'text-[#238B6E]' },
          { label: 'Turnout Rate', value: `${attendanceRate}%`, icon: ShieldCheck, color: 'text-[#D6A84F]' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#66736E]">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-[#17211E]">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Layout: Recent Events & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Events */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#17211E]">Platform Recent Events</h2>
            <Link to="/admin/events" className="text-xs font-bold text-[#0B5D4B] hover:underline">
              View All Events
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100 shadow-2xs">
            {loading ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading events...</div>
            ) : (
              events.map((evt) => (
                <div key={evt.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="gold">{evt.category}</Badge>
                      <span className="text-xs text-[#66736E]">{evt.date}</span>
                    </div>
                    <h3 className="font-bold text-sm text-[#17211E] truncate">{evt.title}</h3>
                    <p className="text-xs text-[#0B5D4B] font-semibold">{evt.organizer.name}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right hidden sm:block">
                      <span className="font-bold text-[#17211E]">
                        {evt.registeredCount} / {evt.capacity}
                      </span>
                      <p className="text-[10px] text-[#66736E]">Regs</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <span className="font-bold text-[#238B6E]">{evt.checkedInCount}</span>
                      <p className="text-[10px] text-[#66736E]">Scans</p>
                    </div>
                    <Link to={`/admin/events/${evt.id}`}>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Platform Activity Feed & Overview */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-[#17211E] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#0B5D4B]" />
              Recent Platform Activity
            </h2>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3 shadow-2xs">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="pb-3 border-b border-gray-100 last:border-0 last:pb-0 space-y-1 text-xs"
                >
                  <p className="font-bold text-[#17211E]">{act.message}</p>
                  <span className="text-[10px] text-[#66736E] font-mono">{act.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Overview Info */}
          <div className="bg-[#064638] text-white p-6 rounded-2xl space-y-3 shadow-sm border border-[#0B5D4B]">
            <Badge variant="gold">Infrastructure Health</Badge>
            <h3 className="font-bold text-base text-white">Ethiopia Platform Node Active</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              All entrance QR verification endpoints and Telegram RSVP hooks operating at 100% uptime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
