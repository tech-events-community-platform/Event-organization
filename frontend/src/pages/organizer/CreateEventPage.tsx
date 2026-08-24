import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { EventCategory } from '../../types/event';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';

export const CreateEventPage: React.FC = () => {

  const [formData, setFormData] = useState({
    title: '',
    category: 'Frontend' as EventCategory,
    date: '',
    time: '02:00 PM - 05:00 PM EAT',
    location: '',
    venueName: '',
    capacity: 100,
    description: '',
    skillsFocus: 'React, TypeScript, Tailwind CSS',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successEventId, setSuccessEventId] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = 'Event title is required';
    if (!formData.date) errs.date = 'Event date is required';
    if (!formData.location.trim()) errs.location = 'Location details are required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (formData.capacity <= 0) errs.capacity = 'Capacity must be at least 1';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const skillsArray = formData.skillsFocus.split(',').map((s: string) => s.trim()).filter(Boolean);
      const newEvent = await api.createEvent({
        title: formData.title,
        category: formData.category,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        venueName: formData.venueName || formData.location,
        capacity: Number(formData.capacity),
        description: formData.description,
        status: 'Upcoming',
        bannerUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        skillsFocus: skillsArray,
        whatToKnow: [
          'Bring your QR ticket pass on Telegram for entry verification.',
          'Please arrive 15 minutes prior to start time.',
        ],
      });
      setSuccessEventId(newEvent.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successEventId) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6 text-center">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg space-y-4">
          <div className="w-16 h-16 bg-[#238B6E]/10 rounded-full flex items-center justify-center text-[#238B6E] mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <Badge variant="gold" icon={<Sparkles className="w-3.5 h-3.5" />}>
            Event Created Successfully!
          </Badge>
          <h2 className="text-2xl font-extrabold text-[#17211E]">{formData.title}</h2>
          <p className="text-xs text-[#66736E]">
            Your event is live on Sheba. Attendees can now register and generate QR passes.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link to={`/organizer/events/${successEventId}`} className="flex-1">
              <Button fullWidth variant="primary">
                Open Event Dashboard
              </Button>
            </Link>
            <Link to="/organizer/events" className="flex-1">
              <Button fullWidth variant="outline">
                Back to All Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <Link
        to="/organizer/events"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5D4B] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Event List
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md space-y-6">
        <div>
          <Badge variant="green">Event Configuration</Badge>
          <h1 className="text-2xl font-extrabold text-[#17211E] mt-1">Create New Tech Event</h1>
          <p className="text-xs text-[#66736E]">
            Fill in the details to publish your event pass on Sheba infrastructure.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17211E]">
              Event Title *
            </label>
            <input
              type="text"
              placeholder="e.g. React & Modern Frontend Workshop"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2.5 bg-[#F7F8F5] border rounded-xl text-sm ${
                errors.title ? 'border-red-500' : 'border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]`}
            />
            {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title}</p>}
          </div>

          {/* Category & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17211E]">
                Event Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as EventCategory })
                }
                className="w-full px-4 py-2.5 bg-[#F7F8F5] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]"
              >
                {['Frontend', 'AI & ML', 'Women in Tech', 'Hackathon', 'Open Source', 'Cloud & DevOps', 'Mobile'].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17211E]">
                Attendee Capacity *
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-[#F7F8F5] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]"
              />
              {errors.capacity && <p className="text-xs text-red-500 font-medium">{errors.capacity}</p>}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17211E]">
                Event Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-4 py-2.5 bg-[#F7F8F5] border rounded-xl text-sm ${
                  errors.date ? 'border-red-500' : 'border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]`}
              />
              {errors.date && <p className="text-xs text-red-500 font-medium">{errors.date}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17211E]">
                Time Schedule
              </label>
              <input
                type="text"
                placeholder="e.g. 02:00 PM - 05:30 PM EAT"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F7F8F5] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]"
              />
            </div>
          </div>

          {/* Location & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17211E]">
                Venue Name
              </label>
              <input
                type="text"
                placeholder="e.g. Bole Innovation Hub, 4th Floor"
                value={formData.venueName}
                onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F7F8F5] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17211E]">
                Address / City *
              </label>
              <input
                type="text"
                placeholder="e.g. Bole Medhanialem, Addis Ababa"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={`w-full px-4 py-2.5 bg-[#F7F8F5] border rounded-xl text-sm ${
                  errors.location ? 'border-red-500' : 'border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]`}
              />
              {errors.location && <p className="text-xs text-red-500 font-medium">{errors.location}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17211E]">
              Description *
            </label>
            <textarea
              rows={4}
              placeholder="Describe the agenda, tech stack focus, and target audience..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-2.5 bg-[#F7F8F5] border rounded-xl text-sm ${
                errors.description ? 'border-red-500' : 'border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]`}
            />
            {errors.description && <p className="text-xs text-red-500 font-medium">{errors.description}</p>}
          </div>

          {/* Self-Reported Tag Topics */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17211E]">
              Self-Reported Tag Topics (Comma separated)
            </label>
            <input
              type="text"
              placeholder="React, TypeScript, Tailwind CSS"
              value={formData.skillsFocus}
              onChange={(e) => setFormData({ ...formData, skillsFocus: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#F7F8F5] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Link to="/organizer/events">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={isSubmitting} variant="primary" size="lg">
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
