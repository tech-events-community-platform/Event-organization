import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { EventType, RegistrationQuestion } from '../../types/event';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  CreditCard,
} from 'lucide-react';

export const CreateEventPage: React.FC = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    type: 'workshop' as EventType,
    date: '',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    location: '',
    capacity: 100,
    isPaid: false,
    ticketPrice: 0,
    description: '',
  });

  const [questions, setQuestions] = useState<Array<{ id: string; questionText: string; isRequired: boolean }>>([
    { id: 'q_init_1', questionText: 'What is your background or experience level with this topic?', isRequired: true },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: `q_${Date.now()}`, questionText: '', isRequired: false },
    ]);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleQuestionChange = (id: string, text: string, isRequired: boolean) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, questionText: text, isRequired } : q))
    );
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = 'Event title is required';
    if (!formData.date) errs.date = 'Single-day event date is required';
    if (!formData.location.trim()) errs.location = 'Venue or location is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (formData.capacity <= 0) errs.capacity = 'Capacity must be at least 1';
    if (formData.isPaid && formData.ticketPrice <= 0) {
      errs.ticketPrice = 'Paid tickets must specify a price in ETB (e.g. 150)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formattedQuestions: RegistrationQuestion[] = questions
        .filter((q) => q.questionText.trim().length > 0)
        .map((q, idx) => ({
          id: q.id,
          questionText: q.questionText.trim(),
          isRequired: q.isRequired,
          order: idx + 1,
        }));

      const newEvent = await api.events.create({
        title: formData.title,
        type: formData.type,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        time: `${formData.startTime} - ${formData.endTime} EAT`,
        location: formData.location,
        venueName: formData.location.split(',')[0],
        capacity: Number(formData.capacity),
        description: formData.description,
        isPaid: formData.isPaid,
        ticketPrice: formData.isPaid ? Number(formData.ticketPrice) : 0,
        currency: 'ETB',
        organizerId: user?.id || 'demo-organizer-001',
        organizerName: user?.organization || user?.name || 'GDG Addis',
        customQuestions: formattedQuestions,
      });

      setCreatedEvent(newEvent);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!createdEvent) return;
    const url = `${window.location.origin}/e/${createdEvent.shareLinkToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Success Created View with Share Link
  if (createdEvent) {
    const shareUrl = `${window.location.origin}/e/${createdEvent.shareLinkToken}`;
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6 text-center">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DDD7] shadow-sm space-y-6">
          <div className="w-16 h-16 bg-[#2A7B5F]/15 rounded-full flex items-center justify-center text-[#2A7B5F] mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <Badge variant="success" icon={<Sparkles className="w-3.5 h-3.5" />}>
              Single-Day Event Published
            </Badge>
            <h2 className="font-serif text-2xl font-extrabold text-[#2D1F23]">{createdEvent.title}</h2>
            <p className="text-xs text-[#756366]">
              Your shareable registration link is live. Anyone with this link can register and answer your custom questions.
            </p>
          </div>

          {/* Share Link Card */}
          <div className="bg-[#FAF7F5] p-5 rounded-2xl border border-[#E8DDD7] space-y-3 text-left">
            <label className="block text-xs font-bold text-[#2D1F23]">Shareable Registration Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3.5 py-2 bg-white border border-[#E8DDD7] rounded-xl text-xs font-mono text-[#63474D] focus:outline-none"
              />
              <Button
                type="button"
                variant="accent"
                size="sm"
                onClick={handleCopyShareLink}
                icon={copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              >
                {copiedLink ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to={`/e/${createdEvent.shareLinkToken}`} target="_blank" className="flex-1">
              <Button fullWidth variant="outline" icon={<ExternalLink className="w-4 h-4" />}>
                Preview Form
              </Button>
            </Link>
            <Link to="/organizer" className="flex-1">
              <Button fullWidth variant="primary">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">

      <div className="space-y-1">
        <Badge variant="primary">Single-Day Event Setup</Badge>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2D1F23]">Create Event</h1>
        <p className="text-xs text-[#756366]">
          Define event details, custom questions, and capacity. The system generates a shareable registration link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Event Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DDD7] shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-base text-[#2D1F23]">1. Event Information</h2>

          <div>
            <label className="block text-xs font-bold text-[#2D1F23] mb-1">Event Title *</label>
            <input
              type="text"
              placeholder="e.g. Ethiopia Rust & Systems Engineering Workshop"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
            />
            {errors.title && <p className="text-[11px] text-red-600 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D1F23] mb-1">Event Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                className="w-full px-3.5 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
              >
                <option value="workshop">Workshop (Hands-on)</option>
                <option value="hackathon">Hackathon (Single-Day Competition)</option>
                <option value="meetup">Meetup (Community Talk & Networking)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D1F23] mb-1">Single-Day Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
              />
              {errors.date && <p className="text-[11px] text-red-600 mt-1">{errors.date}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D1F23] mb-1">Start Time</label>
              <input
                type="text"
                placeholder="09:00 AM"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2D1F23] mb-1">End Time</label>
              <input
                type="text"
                placeholder="05:00 PM"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D1F23] mb-1">Location & Venue *</label>
            <input
              type="text"
              placeholder="e.g. Bole Innovation Hub, 4th Floor, Addis Ababa"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3.5 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
            />
            {errors.location && <p className="text-[11px] text-red-600 mt-1">{errors.location}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D1F23] mb-1">Capacity Limit *</label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              className="w-full px-3.5 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
            />
            <p className="text-[10px] text-[#756366] mt-1">Registration automatically closes when capacity is reached.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D1F23] mb-1">Description *</label>
            <textarea
              rows={3}
              placeholder="Describe agenda, prerequisites, and what attendees will learn..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
            ></textarea>
            {errors.description && <p className="text-[11px] text-red-600 mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Pricing & Chapa ETB Gateway */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DDD7] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-base text-[#2D1F23] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#63474D]" />
                2. Admission & Pricing (ETB Only)
              </h2>
              <p className="text-xs text-[#756366] mt-0.5">
                Single ticket price model with automatic Chapa 3% split settlement.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#756366]">{formData.isPaid ? 'Paid Event' : 'Free Event'}</span>
              <input
                type="checkbox"
                checked={formData.isPaid}
                onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                className="w-4 h-4 text-[#63474D] rounded"
              />
            </div>
          </div>

          {formData.isPaid && (
            <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-[#E8DDD7] space-y-3 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-[#2D1F23] mb-1">
                  Ticket Price (in Ethiopian Birr - ETB) *
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    min="1"
                    placeholder="250"
                    value={formData.ticketPrice || ''}
                    onChange={(e) => setFormData({ ...formData, ticketPrice: Number(e.target.value) })}
                    className="w-full pl-3.5 pr-14 py-2 bg-white border border-[#E8DDD7] rounded-xl text-xs font-bold text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#756366]">
                    ETB
                  </span>
                </div>
                {errors.ticketPrice && <p className="text-[11px] text-red-600 mt-1">{errors.ticketPrice}</p>}
              </div>

              <div className="text-[11px] text-[#756366] space-y-1 pt-1 border-t border-[#E8DDD7]">
                <p>• Sheba deducts a 3% platform commission + Chapa gateway fee automatically.</p>
                <p>• Net ticket revenue settles directly to your organizer account.</p>
              </div>
            </div>
          )}
        </div>

        {/* Custom Registration Questions Builder (SRS Section 4.6) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DDD7] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-base text-[#2D1F23] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#63474D]" />
                3. Custom Registration Questions
              </h2>
              <p className="text-xs text-[#756366] mt-0.5">
                Add questions that attendees must answer on the generated registration page.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleAddQuestion}
              variant="outline"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
            >
              Add Question
            </Button>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 bg-[#FAF7F5] rounded-2xl border border-[#E8DDD7] flex items-start gap-3"
              >
                <span className="text-xs font-bold text-[#63474D] mt-2 font-mono">Q{idx + 1}</span>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="Enter question text (e.g. GitHub profile link, dietary restrictions)..."
                    value={q.questionText}
                    onChange={(e) => handleQuestionChange(q.id, e.target.value, q.isRequired)}
                    className="w-full px-3.5 py-2 bg-white border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
                  />
                  <label className="flex items-center gap-2 text-xs text-[#756366] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={q.isRequired}
                      onChange={(e) => handleQuestionChange(q.id, q.questionText, e.target.checked)}
                      className="rounded text-[#63474D]"
                    />
                    <span>Required response</span>
                  </label>
                </div>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="p-2 text-red-400 hover:text-red-600 rounded-lg"
                    title="Remove Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
        >
          Publish Event & Generate Share Link
        </Button>
      </form>
    </div>
  );
};
