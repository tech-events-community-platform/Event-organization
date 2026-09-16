import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Phone,
  Mail,
  Send,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  ChevronRight,
  Building2,
  AlertCircle,
  X,
  Share2,
} from 'lucide-react';
import { api } from '../../services/api';
import type { ISponsorshipApplication } from '../../types/sponsorship';

const CATEGORIES = [
  'All Categories',
  'Technology & AI',
  'Finance & Fintech',
  'Startup & Entrepreneurship',
  'Creative & Media',
  'Education & Youth',
  'Health & Wellness',
  'Cultural & Arts',
];

export const SponsorExplorePage: React.FC = () => {
  const [applications, setApplications] = useState<ISponsorshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<ISponsorshipApplication | null>(null);

  // Modal interaction state
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [pledgedAmount, setPledgedAmount] = useState<number | undefined>(undefined);
  const [sponsorNotes, setSponsorNotes] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory !== 'All Categories') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await api.sponsorship.exploreApplications(params);
      setApplications(data);
    } catch (err: any) {
      console.error('Failed to load marketplace applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadApplications();
  };

  const openAppDetails = (app: ISponsorshipApplication) => {
    setSelectedApp(app);
    setSelectedPackage(app.packages?.[0]?.name || '');
    setPledgedAmount(app.packages?.[0]?.amount || app.funding_goal);
    setSponsorNotes('');
    setFeedbackMessage(null);
  };

  const handleExpressInterestOrDecline = async (status: 'INTERESTED' | 'DECLINED') => {
    if (!selectedApp) return;
    try {
      setActionLoading(true);
      setFeedbackMessage(null);

      await api.sponsorship.expressInterestOrDecline({
        applicationId: selectedApp.id,
        status,
        package_name: selectedPackage,
        pledged_amount: pledgedAmount,
        sponsor_notes: sponsorNotes,
      });

      setFeedbackMessage({
        type: 'success',
        text:
          status === 'INTERESTED'
            ? 'Added to your Deals & Pledges as Interested! Use the contact info below to coordinate directly with the organizer.'
            : 'Marked as Declined. You can review this anytime in Deals & Pledges.',
      });

      // Reload applications to update interested count
      loadApplications();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Failed to update deal status.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#2D1F23] via-[#4A3238] to-[#63474D] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-[#FFA686]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[#FFA686] text-xs font-semibold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5" />
            Sponsorship Marketplace
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
            Discover Upcoming Events Seeking Backing
          </h1>
          <p className="text-white/80 text-sm sm:text-base mt-2 leading-relaxed">
            Browse proposed and upcoming events from trusted organizers across Ethiopia. Support initiatives aligned with your brand, express interest, and reach out directly to coordinate.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by event title, location, or audience..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/15 backdrop-blur-md text-white placeholder-white/60 text-sm rounded-xl border border-white/20 focus:outline-none focus:bg-white/25 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#FFA686] hover:bg-[#ff956e] text-[#2D1F23] font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer shrink-0"
            >
              Search Pitches
            </button>
          </form>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#63474D] text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-stone-100 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Pitches Feed */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100">
          <div className="animate-spin w-8 h-8 border-3 border-[#63474D] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm font-medium">Loading sponsorship opportunities...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-300">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No events found in this category</h3>
          <p className="text-sm text-gray-500 mt-1">Try searching for a different keyword or selecting "All Categories".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <div
              key={app.id}
              onClick={() => openAppDetails(app)}
              className="bg-white rounded-3xl p-6 border border-[#AA767C]/15 shadow-sm hover:shadow-md hover:border-[#63474D]/40 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFA686]/20 text-[#63474D] border border-[#FFA686]/30">
                    {app.category}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-500">
                    {app.event_type}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#63474D] transition-colors line-clamp-2">
                  {app.event_title}
                </h3>

                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <span>By {app.organizer_organization || app.organizer_name || 'Verified Organizer'}</span>
                </p>

                <p className="text-xs text-gray-600 mt-3 line-clamp-3 leading-relaxed">
                  {app.description}
                </p>

                <div className="space-y-2 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-[#63474D]" />
                      Date:
                    </span>
                    <span className="font-semibold text-gray-800">{app.expected_date}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-[#63474D]" />
                      Location:
                    </span>
                    <span className="font-semibold text-gray-800">{app.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <Users className="w-3.5 h-3.5 text-[#63474D]" />
                      Expected Turnout:
                    </span>
                    <span className="font-semibold text-gray-800">
                      {app.expected_attendees.toLocaleString()} guests
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Funding Goal</p>
                  <p className="text-base font-serif font-bold text-[#63474D]">
                    {app.funding_goal.toLocaleString()} {app.currency}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1 text-xs font-bold text-[#63474D] group-hover:translate-x-0.5 transition-transform">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-[#2D1F23] to-[#402a30] text-white sticky top-0 z-20 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFA686]/20 text-[#FFA686] border border-[#FFA686]/30">
                    {selectedApp.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white">
                    {selectedApp.event_type}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  {selectedApp.event_title}
                </h2>
                <p className="text-xs text-white/70 mt-1">
                  Organized by {selectedApp.organizer_organization || selectedApp.organizer_name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Feedback alert */}
              {feedbackMessage && (
                <div
                  className={`p-4 rounded-2xl text-sm font-medium flex items-start gap-3 ${
                    feedbackMessage.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {feedbackMessage.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  )}
                  <div>{feedbackMessage.text}</div>
                </div>
              )}

              {/* Event Quick Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/80 text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">Date</span>
                  <span className="font-bold text-gray-900">{selectedApp.expected_date}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Location</span>
                  <span className="font-bold text-gray-900">{selectedApp.location}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Audience</span>
                  <span className="font-bold text-gray-900">{selectedApp.expected_attendees.toLocaleString()} pax</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Goal</span>
                  <span className="font-bold text-[#63474D]">
                    {selectedApp.funding_goal.toLocaleString()} {selectedApp.currency}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Event Concept & Value Proposition
                </h4>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {selectedApp.description}
                </p>
              </div>

              {/* Target Demographics */}
              {selectedApp.target_audience && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Target Demographic
                  </h4>
                  <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-800 font-medium">
                    {selectedApp.target_audience}
                  </div>
                </div>
              )}

              {/* Available Packages */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#63474D]" />
                  Available Sponsorship Packages
                </h4>

                <div className="space-y-3">
                  {selectedApp.packages?.map((pkg, idx) => (
                    <label
                      key={idx}
                      className={`block p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedPackage === pkg.name
                          ? 'border-[#63474D] bg-[#63474D]/5 ring-2 ring-[#63474D]/10'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="tier"
                            checked={selectedPackage === pkg.name}
                            onChange={() => {
                              setSelectedPackage(pkg.name);
                              setPledgedAmount(pkg.amount);
                            }}
                            className="text-[#63474D] focus:ring-[#63474D]"
                          />
                          <div>
                            <span className="text-sm font-bold text-gray-900">{pkg.name}</span>
                            <p className="text-xs text-gray-600 mt-0.5">{pkg.perks}</p>
                          </div>
                        </div>

                        <span className="font-serif font-bold text-sm text-[#63474D] whitespace-nowrap ml-3">
                          {pkg.amount.toLocaleString()} {selectedApp.currency}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Direct Organizer Contact Card */}
              <div className="bg-[#FAF7F5] border-2 border-[#63474D]/20 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#63474D] text-[#FFA686] flex items-center justify-center font-bold text-xs">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Direct Organizer Contact</h4>
                      <p className="text-[11px] text-gray-500">Reach out directly to confirm terms & finalize sponsorship</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Verified Organizer
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <a
                    href={`tel:${selectedApp.contact_phone}`}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-gray-200 hover:border-[#63474D] hover:text-[#63474D] transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[#63474D]" />
                    <div className="min-w-0">
                      <span className="block text-[10px] text-gray-400 font-bold uppercase">Call Phone</span>
                      <span className="text-xs font-semibold text-gray-900 truncate block">{selectedApp.contact_phone}</span>
                    </div>
                  </a>

                  <a
                    href={`mailto:${selectedApp.contact_email}?subject=Sponsorship%20Inquiry%20-%20${encodeURIComponent(selectedApp.event_title)}`}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-gray-200 hover:border-[#63474D] hover:text-[#63474D] transition-colors"
                  >
                    <Mail className="w-4 h-4 text-[#63474D]" />
                    <div className="min-w-0">
                      <span className="block text-[10px] text-gray-400 font-bold uppercase">Email</span>
                      <span className="text-xs font-semibold text-gray-900 truncate block">{selectedApp.contact_email}</span>
                    </div>
                  </a>

                  {selectedApp.contact_telegram ? (
                    <a
                      href={
                        selectedApp.contact_telegram.startsWith('http')
                          ? selectedApp.contact_telegram
                          : `https://t.me/${selectedApp.contact_telegram.replace('@', '')}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-gray-200 hover:border-[#63474D] hover:text-[#63474D] transition-colors"
                    >
                      <Send className="w-4 h-4 text-[#63474D]" />
                      <div className="min-w-0">
                        <span className="block text-[10px] text-gray-400 font-bold uppercase">Telegram</span>
                        <span className="text-xs font-semibold text-gray-900 truncate block">{selectedApp.contact_telegram}</span>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-white/50 border border-dashed border-gray-200 text-gray-400 text-xs">
                      <span>Representative: {selectedApp.contact_name}</span>
                    </div>
                  )}
                </div>

                {selectedApp.pitch_deck_url && (
                  <div className="pt-2">
                    <a
                      href={selectedApp.pitch_deck_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#63474D] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Organizer Pitch Deck / Presentation PDF</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Sponsor Internal Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Internal Notes / Terms for Deals & Pledges (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Budget approved for Gold Tier, awaiting call with Sara on Thursday..."
                  value={sponsorNotes}
                  onChange={(e) => setSponsorNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#63474D] outline-none"
                />
              </div>

              {/* Action Buttons: Strictly INTERESTED and DECLINED */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleExpressInterestOrDecline('DECLINED')}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 text-gray-400" />
                  <span>Decline</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleExpressInterestOrDecline('INTERESTED')}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#63474D] hover:bg-[#4E373C] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#FFA686]" />
                  <span>Mark as Interested</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
