import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Event } from '../../types/event';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, ArrowLeft, CheckCircle2, QrCode } from 'lucide-react';

interface MockAttendeeRow {
  id: string;
  name: string;
  telegramHandle: string;
  registrationDate: string;
  status: 'Checked In' | 'Registered' | 'Not Checked In';
  checkInTime?: string;
}

export const AttendeeListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const [attendees] = useState<MockAttendeeRow[]>([
    {
      id: 'att_101',
      name: 'Kirubel Abebe',
      telegramHandle: '@kirubel_tech',
      registrationDate: '2026-08-15',
      status: 'Checked In',
      checkInTime: '02:14 PM EAT',
    },
    {
      id: 'att_102',
      name: 'Tigist Worku',
      telegramHandle: '@tigist_dev',
      registrationDate: '2026-08-16',
      status: 'Checked In',
      checkInTime: '02:10 PM EAT',
    },
    {
      id: 'att_103',
      name: 'Yared Solomon',
      telegramHandle: '@yared_ai',
      registrationDate: '2026-08-18',
      status: 'Registered',
    },
    {
      id: 'att_104',
      name: 'Selam Tekle',
      telegramHandle: '@selam_design',
      registrationDate: '2026-08-20',
      status: 'Registered',
    },
    {
      id: 'att_105',
      name: 'Biniyam Haile',
      telegramHandle: '@biniyam_h',
      registrationDate: '2026-08-21',
      status: 'Not Checked In',
    },
  ]);

  useEffect(() => {
    if (id) {
      api.getEventById(id).then((e) => setEvent(e || null));
    }
  }, [id]);

  const filtered = attendees.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.telegramHandle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      <Link
        to={`/organizer/events/${id || 'evt_react_workshop_2026'}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5D4B] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Event Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#17211E]">Attendee Roster</h1>
          <p className="text-xs text-[#66736E]">
            {event ? event.title : 'Event'} — {attendees.length} Registered Attendees
          </p>
        </div>

        <Link to={`/organizer/events/${id || 'evt_react_workshop_2026'}/scanner`}>
          <Button variant="accent" size="sm" icon={<QrCode className="w-4 h-4" />}>
            Open Door Scanner
          </Button>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search attendee by name or @telegram handle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F7F8F5] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]"
          />
        </div>

        <div className="flex gap-2">
          {['All', 'Checked In', 'Registered', 'Not Checked In'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#0B5D4B] text-white shadow-xs'
                  : 'bg-[#F7F8F5] text-[#66736E] hover:bg-gray-200/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F7F8F5] border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-[#66736E]">
              <th className="py-3.5 px-5">Attendee</th>
              <th className="py-3.5 px-5">Registration Date</th>
              <th className="py-3.5 px-5">Check-in Status</th>
              <th className="py-3.5 px-5">Check-in Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-[#17211E]">
            {filtered.map((att) => (
              <tr key={att.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-3.5 px-5">
                  <p className="font-bold text-[#17211E]">{att.name}</p>
                  <p className="text-[#0B5D4B] text-[11px] font-semibold">{att.telegramHandle}</p>
                </td>
                <td className="py-3.5 px-5 text-[#66736E]">{att.registrationDate}</td>
                <td className="py-3.5 px-5">
                  <Badge
                    variant={
                      att.status === 'Checked In'
                        ? 'green'
                        : att.status === 'Registered'
                        ? 'gold'
                        : 'gray'
                    }
                    icon={att.status === 'Checked In' ? <CheckCircle2 className="w-3 h-3" /> : undefined}
                  >
                    {att.status}
                  </Badge>
                </td>
                <td className="py-3.5 px-5 font-mono text-[#66736E]">
                  {att.checkInTime || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filtered.map((att) => (
          <div key={att.id} className="bg-white p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#17211E]">{att.name}</p>
                <p className="text-[#0B5D4B] font-semibold">{att.telegramHandle}</p>
              </div>
              <Badge variant={att.status === 'Checked In' ? 'green' : 'gold'}>
                {att.status}
              </Badge>
            </div>
            <div className="flex justify-between text-[#66736E] pt-2 border-t border-gray-100 text-[11px]">
              <span>Reg: {att.registrationDate}</span>
              <span>Time: {att.checkInTime || 'Not checked in'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
