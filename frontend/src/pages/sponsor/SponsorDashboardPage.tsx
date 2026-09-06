import React, { useState, useEffect } from 'react';
import type { Event, SponsorshipStatus } from '../../types/event';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Handshake,
  Calendar,
  MapPin,
  ShieldCheck,
  Search,
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle2,
  Filter,
  Sparkles,
  Building,
} from 'lucide-react';

export const SponsorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | SponsorshipStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Sponsoring an Event
  const [sponsorModalEvent, setSponsorModalEvent] = useState<Event | null>(null);
  const [sponsorTier, setSponsorTier] = useState<'PLATINUM' | 'GOLD' | 'SILVER' | 'CUSTOM'>('GOLD');
  const [customAmount, setCustomAmount] = useState<string>('50000');
  const [isSubmittingPledge, setIsSubmittingPledge] = useState<boolean>(false);
  const [pledgeSuccessMsg, setPledgeSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await api.events.getAll();
        setEvents(data);
      } catch (err) {
        console.error('Failed to load events for sponsor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getTierAmount = (tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'CUSTOM'): number => {
    switch (tier) {
      case 'PLATINUM': return 150000;
      case 'GOLD': return 75000;
      case 'SILVER': return 35000;
      case 'CUSTOM': return parseInt(customAmount, 10) || 0;
    }
  };

  const handleConfirmSponsorship = async () => {
    if (!sponsorModalEvent) return;
    const amount = getTierAmount(sponsorTier);
    if (amount <= 0) return;

    setIsSubmittingPledge(true);
    try {
      // Simulate API call to register sponsorship pledge
      await new Promise((resolve) => setTimeout(resolve, 800));

      const updatedEvents = events.map((e) => {
        if (e.id === sponsorModalEvent.id) {
          const goal = e.sponsorshipGoal || 100000;
          const currentRaised = e.sponsorshipRaised || 0;
          const newRaised = currentRaised + amount;
          const newStatus: SponsorshipStatus =
            newRaised >= goal ? 'Fully Sponsored' : 'Partially Sponsored';

          return {
            ...e,
            sponsorshipRaised: newRaised,
            sponsorshipStatus: newStatus,
          };
        }
        return e;
      });

      setEvents(updatedEvents);
      setPledgeSuccessMsg(
        `Thank you! Your sponsorship pledge of ${amount.toLocaleString()} ETB for "${sponsorModalEvent.title}" has been recorded.`
      );
      setSponsorModalEvent(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingPledge(false);
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesFilter =
      selectedFilter === 'ALL' || evt.sponsorshipStatus === selectedFilter;
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.organizerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalGoal = events.reduce((sum, e) => sum + (e.sponsorshipGoal || 0), 0);
  const totalRaised = events.reduce((sum, e) => sum + (e.sponsorshipRaised || 0), 0);
  const openSeekingCount = events.filter(
    (e) => e.sponsorshipStatus === 'Looking for Sponsors' || e.sponsorshipStatus === 'Partially Sponsored'
  ).length;

  const getStatusBadge = (status?: SponsorshipStatus) => {
    switch (status) {
      case 'Looking for Sponsors':
        return <Badge variant="accent" icon={<Sparkles className="w-3 h-3" />}>Looking for Sponsors</Badge>;
      case 'Partially Sponsored':
        return <Badge variant="secondary" icon={<TrendingUp className="w-3 h-3" />}>Partially Sponsored</Badge>;
      case 'Fully Sponsored':
        return <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3" />}>Fully Sponsored</Badge>;
      default:
        return <Badge variant="gray">Open for Partners</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Hero Header */}
      <div className="bg-gradient-to-r from-[#153E2A] via-[#1b4b34] to-[#8BA448] text-white rounded-3xl p-6 sm:p-10 shadow-md space-y-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-[#F9FF46]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9FF46]/20 border border-[#F9FF46]/30 text-[#F9FF46] text-xs font-bold shadow-2xs">
              <Building className="w-3.5 h-3.5" />
              <span>Sponsor Portal • {user?.organization || 'Partner Organization'}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Sponsor Ethiopian Tech Events & Developer Communities
            </h1>
            <p className="text-xs sm:text-sm text-white/90 font-light leading-relaxed">
              Empower hackathons, workshops, and meetups across Addis Ababa. Connect your brand with verified developer talent and receive transparent turnout analytics.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col gap-2 min-w-[200px] shrink-0 text-center sm:text-left">
            <span className="text-[11px] text-[#F9FF46] font-mono font-bold uppercase tracking-wider">
              Ecosystem Funding Progress
            </span>
            <div className="text-2xl font-serif font-extrabold text-white">
              {totalRaised.toLocaleString()} <span className="text-xs font-sans font-normal">ETB</span>
            </div>
            <p className="text-[11px] text-white/80">
              Out of {totalGoal.toLocaleString()} ETB requested across active events
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {pledgeSuccessMsg && (
        <div className="p-4 bg-[#153E2A]/10 border border-[#153E2A]/30 rounded-2xl text-xs font-semibold text-[#153E2A] flex items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#8BA448] shrink-0" />
            <span>{pledgeSuccessMsg}</span>
          </div>
          <button
            onClick={() => setPledgeSuccessMsg(null)}
            className="text-xs font-bold hover:underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Seeking Sponsors</span>
            <Sparkles className="w-4 h-4 text-[#8BA448]" />
          </div>
          <p className="font-serif font-bold text-2xl text-[#153E2A]">{openSeekingCount} Events</p>
          <p className="text-[11px] text-gray-500">Ready for partner proposals</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Total Funding Needed</span>
            <DollarSign className="w-4 h-4 text-[#153E2A]" />
          </div>
          <p className="font-serif font-bold text-2xl text-[#153E2A]">
            {(totalGoal - totalRaised).toLocaleString()} ETB
          </p>
          <p className="text-[11px] text-gray-500">Remaining open goal</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Verified Turnout Reports</span>
            <Award className="w-4 h-4 text-[#8BA448]" />
          </div>
          <p className="font-serif font-bold text-2xl text-[#153E2A]">100% Sponsor Ready</p>
          <p className="text-[11px] text-gray-500">Includes QR attendance roster</p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by event name, organizer, or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#153E2A] shadow-2xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0 text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0 mr-1 hidden sm:block" />
          {(['ALL', 'Looking for Sponsors', 'Partially Sponsored', 'Fully Sponsored'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === filter
                  ? 'bg-[#153E2A] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter === 'ALL' ? 'All Sponsorship Events' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Events List / Cards Layout */}
      {loading ? (
        <div className="p-12 text-center text-sm text-gray-400 animate-pulse border border-dashed border-gray-200 rounded-3xl">
          Loading sponsorship opportunities...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-gray-200 rounded-3xl space-y-3">
          <Handshake className="w-12 h-12 text-[#8BA448] mx-auto" />
          <h3 className="font-serif font-bold text-lg text-[#153E2A]">No Matching Events Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search query or filter selection to explore other sponsorship opportunities.
          </p>
          <Button variant="outline" size="sm" onClick={() => { setSelectedFilter('ALL'); setSearchQuery(''); }}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((event) => {
            const goal = event.sponsorshipGoal || 100000;
            const raised = event.sponsorshipRaised || 0;
            const percentage = Math.min(100, Math.round((raised / goal) * 100));
            const isFullySponsored = event.sponsorshipStatus === 'Fully Sponsored' || percentage >= 100;

            return (
              <div
                key={event.id}
                className="bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-[#153E2A]/40 transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Event Image Banner with Status Badge */}
                {event.bannerUrl && (
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    <img
                      src={event.bannerUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4 justify-between">
                      <Badge variant="outline" className="uppercase font-mono text-[10px] bg-white/90 text-[#153E2A] border-none shadow-sm">
                        {event.type}
                      </Badge>
                      <div>{getStatusBadge(event.sponsorshipStatus)}</div>
                    </div>
                  </div>
                )}

                {/* Event Details Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    {/* Organizer Header */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <img
                        src={event.organizerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={event.organizerName}
                        className="w-6 h-6 rounded-full object-cover border border-[#8BA448]/40 shrink-0"
                      />
                      <span className="font-bold text-[#153E2A] truncate">{event.organizerName}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#8BA448] shrink-0" />
                    </div>

                    {/* Event Title */}
                    <h3 className="font-serif font-bold text-xl text-[#153E2A] group-hover:text-[#8BA448] transition-colors leading-tight line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-light">
                      {event.description}
                    </p>
                  </div>

                  {/* Logistics: Date & Location */}
                  <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#153E2A] shrink-0" />
                      <span className="truncate">{event.date} • {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#153E2A] shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Sponsorship Goal & Progress Bar */}
                  <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-gray-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#153E2A]">Sponsorship Goal: {goal.toLocaleString()} ETB</span>
                      <span className="text-[#8BA448] font-bold">{percentage}% Raised</span>
                    </div>

                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#8BA448] to-[#153E2A] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>Raised: {raised.toLocaleString()} ETB</span>
                      <span>Needed: {Math.max(0, goal - raised).toLocaleString()} ETB</span>
                    </div>
                  </div>

                  {/* Prominent Action Button */}
                  <div className="pt-1">
                    <Button
                      fullWidth
                      variant={isFullySponsored ? 'outline' : 'primary'}
                      size="md"
                      disabled={isFullySponsored}
                      onClick={() => setSponsorModalEvent(event)}
                      icon={<Handshake className="w-4 h-4 text-[#F9FF46]" />}
                    >
                      {isFullySponsored ? 'Fully Sponsored' : 'Sponsor Event'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Sponsorship Pledge Modal */}
      {sponsorModalEvent && (
        <Modal
          isOpen={!!sponsorModalEvent}
          onClose={() => setSponsorModalEvent(null)}
          title={`Sponsor: ${sponsorModalEvent.title}`}
        >
          <div className="space-y-5">
            <div className="p-4 bg-[#153E2A]/10 border border-[#153E2A]/20 rounded-2xl space-y-1">
              <p className="text-xs font-bold text-[#153E2A]">Organizer: {sponsorModalEvent.organizerName}</p>
              <p className="text-xs text-gray-600">{sponsorModalEvent.date} • {sponsorModalEvent.location}</p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-800">Select Sponsorship Package</label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'PLATINUM', label: 'Platinum Tier', amount: '150,000 ETB', desc: 'Keynote banner & logo' },
                  { id: 'GOLD', label: 'Gold Tier', amount: '75,000 ETB', desc: 'Booth space & digital pass logo' },
                  { id: 'SILVER', label: 'Silver Tier', amount: '35,000 ETB', desc: 'Community supporter credit' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSponsorTier(tier.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      sponsorTier === tier.id
                        ? 'border-[#153E2A] bg-[#153E2A] text-white shadow-xs'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-white'
                    }`}
                  >
                    <p className="font-bold text-xs">{tier.label}</p>
                    <p className={`text-xs font-extrabold mt-1 ${sponsorTier === tier.id ? 'text-[#F9FF46]' : 'text-[#153E2A]'}`}>
                      {tier.amount}
                    </p>
                    <p className={`text-[10px] mt-1 ${sponsorTier === tier.id ? 'text-white/80' : 'text-gray-500'}`}>
                      {tier.desc}
                    </p>
                  </button>
                ))}
              </div>

              {/* Custom amount field if CUSTOM selected */}
              {sponsorTier === 'CUSTOM' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Enter Custom Pledge Amount (ETB)</label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#153E2A]"
                    placeholder="e.g. 50000"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-3">
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => setSponsorModalEvent(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                isLoading={isSubmittingPledge}
                onClick={handleConfirmSponsorship}
                icon={<Handshake className="w-4 h-4 text-[#F9FF46]" />}
              >
                Confirm Sponsorship ({getTierAmount(sponsorTier).toLocaleString()} ETB)
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
