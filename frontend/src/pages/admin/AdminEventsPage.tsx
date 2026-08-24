import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Event } from '../../types/event';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Search, PlusCircle, XCircle } from 'lucide-react';

export const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [cancelModalEvent, setCancelModalEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await api.getEvents();
      setEvents(data);
    };
    fetchEvents();
  }, []);

  const handleCancelEvent = async () => {
    if (!cancelModalEvent) return;
    const updated = await api.updateEventStatus(cancelModalEvent.id, 'Draft');
    setEvents(updated);
    setCancelModalEvent(null);
  };

  const filteredEvents = events.filter((evt) => {
    const matchesStatus = statusFilter === 'All' || evt.status === statusFilter;
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.organizer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#17211E]">Events Management</h1>
          <p className="text-xs text-[#66736E]">Manage events across the Sheba platform.</p>
        </div>
        <Link to="/organizer/events/create">
          <Button variant="primary" icon={<PlusCircle className="w-4 h-4" />}>
            Create Platform Event
          </Button>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search events by title, organizer, or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F7F8F5] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {['All', 'Upcoming', 'Live', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-[#0B5D4B] text-white shadow-xs'
                  : 'bg-[#F7F8F5] text-[#66736E] hover:bg-gray-200/60'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F7F8F5] border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-[#66736E]">
              <th className="py-3.5 px-5">Event</th>
              <th className="py-3.5 px-5">Organizer</th>
              <th className="py-3.5 px-5">Date & Time</th>
              <th className="py-3.5 px-5">Venue</th>
              <th className="py-3.5 px-5">Regs</th>
              <th className="py-3.5 px-5">Scans</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-[#17211E]">
            {filteredEvents.map((evt) => (
              <tr key={evt.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-3.5 px-5">
                  <p className="font-bold text-[#17211E]">{evt.title}</p>
                  <Badge variant="gold" className="text-[10px] mt-0.5">
                    {evt.category}
                  </Badge>
                </td>
                <td className="py-3.5 px-5 font-semibold text-[#0B5D4B]">{evt.organizer.name}</td>
                <td className="py-3.5 px-5 text-[#66736E]">{evt.date}</td>
                <td className="py-3.5 px-5 text-[#66736E] truncate max-w-[150px]">
                  {evt.venueName}
                </td>
                <td className="py-3.5 px-5 font-bold">{evt.registeredCount}</td>
                <td className="py-3.5 px-5 font-bold text-[#238B6E]">{evt.checkedInCount}</td>
                <td className="py-3.5 px-5">
                  <Badge variant={evt.status === 'Completed' ? 'gray' : 'green'}>
                    {evt.status}
                  </Badge>
                </td>
                <td className="py-3.5 px-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/admin/events/${evt.id}`}>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </Link>
                    <button
                      onClick={() => setCancelModalEvent(evt)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancel Event"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredEvents.map((evt) => (
          <div key={evt.id} className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <Badge variant="gold">{evt.category}</Badge>
              <Badge variant="green">{evt.status}</Badge>
            </div>
            <h3 className="font-bold text-base text-[#17211E]">{evt.title}</h3>
            <p className="text-[#0B5D4B] font-semibold">{evt.organizer.name}</p>
            <div className="flex justify-between text-[#66736E] pt-2 border-t border-gray-100">
              <span>Date: {evt.date}</span>
              <span>Regs: {evt.registeredCount}</span>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <Link to={`/admin/events/${evt.id}`}>
                <Button variant="outline" size="sm">
                  Admin Manage
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Cancel Event Confirmation Modal */}
      <Modal
        isOpen={!!cancelModalEvent}
        onClose={() => setCancelModalEvent(null)}
        title="Cancel Event Confirmation"
      >
        <div className="space-y-4 text-xs text-[#17211E]">
          <p className="leading-relaxed">
            Are you sure you want to cancel the event{' '}
            <strong className="text-red-600">&quot;{cancelModalEvent?.title}&quot;</strong>?
          </p>
          <p className="text-[#66736E]">
            This will update the event status across the Sheba platform.
          </p>
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setCancelModalEvent(null)}>
              No, Keep Event
            </Button>
            <Button variant="danger" size="sm" onClick={handleCancelEvent}>
              Yes, Cancel Event
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
