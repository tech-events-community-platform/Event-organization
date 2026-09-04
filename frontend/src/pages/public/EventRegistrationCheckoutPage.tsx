import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Event } from '../../types/event';
import type { User } from '../../types/user';
import { Button } from '../../components/ui/Button';
import {
  ArrowLeft,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const EventRegistrationCheckoutPage: React.FC = () => {
  const { token, id } = useParams<{ token?: string; id?: string }>();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Guest attendee fields (if not authenticated)
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [confirmedEmail, setConfirmedEmail] = useState('');

  // Form states
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedPayment, setSelectedPayment] = useState<'telebirr' | 'cbe' | 'awash'>('telebirr');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventAndStatus = async () => {
      setLoading(true);
      try {
        let fetched: Event | null = null;
        if (token) {
          fetched = await api.events.getByShareToken(token);
        } else if (id) {
          fetched = await api.events.getById(id);
        }
        setEvent(fetched);

        if (fetched && user) {
          try {
            const ticket = await api.registration.getTicketByEvent(fetched.id, user.id);
            if (ticket) {
              setIsAlreadyRegistered(true);
              setConfirmedEmail(user.email);
            }
          } catch {
            // Not registered yet
          }
        }
      } catch (e) {
        console.error('Failed to load event:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndStatus();
  }, [token, id, user]);

  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!event) return;

    // Validate guest fields if logged out
    let attendeeToRegister: User;
    if (isAuthenticated && user) {
      attendeeToRegister = user;
    } else {
      if (!guestName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!guestEmail.trim() || !guestEmail.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      attendeeToRegister = {
        id: `guest_${Date.now()}`,
        name: guestName.trim(),
        email: guestEmail.trim(),
        role: 'ATTENDEE',
        memberSince: new Date().toISOString(),
      };
    }

    // Validate required custom questions
    for (const q of event.customQuestions || []) {
      if (q.isRequired && !answers[q.id]?.trim()) {
        setErrorMsg(`Please answer required question: "${q.questionText}"`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const paymentRef = event.isPaid ? `${selectedPayment}_${Date.now()}` : undefined;
      const res = await api.registration.registerForEvent({
        eventId: event.id,
        attendee: attendeeToRegister,
        answers,
        paymentReference: paymentRef,
      });

      if (res.ticket) {
        setConfirmedEmail(attendeeToRegister.email);
        setIsAlreadyRegistered(true);
        setIsConfirmed(true);
      }
    } catch (err: any) {
      const msg = err.message || 'Registration failed.';
      setErrorMsg(msg);
      if (msg.includes('already registered')) {
        setConfirmedEmail(attendeeToRegister.email);
        setIsAlreadyRegistered(true);
        setIsConfirmed(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCalendarTile = (dateStr?: string) => {
    if (!dateStr) return { month: 'EVENT', day: '•', weekday: '', fullDate: '' };
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const day = d.getDate();
        const weekday = d.toLocaleString('en-US', { weekday: 'long' });
        const fullDate = d.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        return { month, day, weekday, fullDate };
      }
    } catch {
      // ignore
    }
    return { month: 'EVENT', day: '•', weekday: '', fullDate: dateStr };
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-black/10 w-1/3 rounded-xl"></div>
          <div className="h-64 bg-black/5 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4 text-black">
        <AlertCircle className="w-12 h-12 text-[#AA767C] mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-black">Event Not Found</h2>
        <p className="text-xs text-gray-700">
          This event link may be invalid or no longer accepting registrations.
        </p>
        <Link to="/login">
          <Button variant="primary" size="sm">
            Back to Sheeba
          </Button>
        </Link>
      </div>
    );
  }

  const cal = getCalendarTile(event.date);
  const backUrl = `/e/${token || event.shareLinkToken || event.id}`;

  // Success / Confirmed Registration View (Uses tick.png, text black)
  if (isConfirmed || isAlreadyRegistered) {
    return (
      <div className="w-full py-16 px-4 flex items-center justify-center animate-fade-in">
        <div className="max-w-xl w-full mx-auto space-y-6 text-center">
          <img
            src="/tick.png"
            alt="Success"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto"
          />

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2A7B5F] block">
              Registration Confirmed
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-black">
              You have registered for this event!
            </h1>
            <p className="text-xs sm:text-sm text-black max-w-md mx-auto leading-relaxed">
              A confirmation email has been dispatched to <strong className="text-black">{confirmedEmail || user?.email || 'your email'}</strong>.
            </p>
          </div>

          {/* Logistics Line (Unboxed, location icon uses location.png, text black) */}
          <div className="pt-2 space-y-1 text-xs sm:text-sm text-black max-w-sm mx-auto">
            <p className="font-semibold text-black">
              {cal.weekday ? `${cal.weekday}, ${cal.fullDate}` : event.date} • {event.time || `${event.startTime} - ${event.endTime}`}
            </p>
            <p className="flex items-center justify-center gap-1.5 text-black">
              <img src="/location.png" alt="Location" className="w-4 h-4 object-contain shrink-0" />
              <span>{event.venueName ? `${event.venueName}, ` : ''}{event.location}</span>
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <Link to={`/app/ticket/${event.id}`}>
              <Button variant="primary" size="sm">
                View Entry Pass
              </Button>
            </Link>
            <Link to={backUrl}>
              <Button variant="outline" size="sm" className="border-gray-400 text-black hover:bg-black/5">
                Back to Event
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Registration Page (No white card backgrounds, text black, unboxed clarity)
  return (
    <div className="w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Navigation & Event Overview Header */}
      <div className="space-y-3">
        <Link
          to={backUrl}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-black" />
          <span>Back to Event Details</span>
        </Link>

        <div className="space-y-1 pt-1">
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-black">
            Event Registration
          </h1>
          <p className="text-sm font-medium text-black">
            {event.title}
          </p>
          <p className="text-xs text-gray-700 flex items-center gap-2 pt-0.5">
            <span>{cal.weekday ? `${cal.weekday}, ${cal.fullDate}` : event.date}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#AA767C]" />
              <span>{event.time || `${event.startTime} - ${event.endTime}`}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <img src="/location.png" alt="Location" className="w-3.5 h-3.5 object-contain" />
              <span>{event.venueName || event.location}</span>
            </span>
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3.5 bg-red-50/90 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* User Identity Info */}
        <div className="space-y-1.5 pb-2 border-b border-gray-300">
          <span className="text-[11px] uppercase font-bold tracking-wider text-gray-600 block">
            Attendee Information
          </span>
          {isAuthenticated && user ? (
            <p className="text-sm font-bold text-black">
              {user.name} ({user.email})
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-black">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 bg-white/70 border border-gray-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#63474D]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-black">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 bg-white/70 border border-gray-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#63474D]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Organizer Questions Section (Google Form Formality, Text Black, Unboxed) */}
        {event.customQuestions && event.customQuestions.length > 0 ? (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif font-bold text-lg text-black">
                Registration Questions
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Please complete the questions required by the event organizer.
              </p>
            </div>

            <div className="space-y-5">
              {event.customQuestions.map((q, index) => {
                const qType = q.type || 'text';
                return (
                  <div key={q.id} className="space-y-2">
                    <label className="block text-sm font-semibold text-black">
                      {index + 1}. {q.questionText} {q.isRequired && <span className="text-red-600">*</span>}
                    </label>

                    {qType === 'choice' && q.options && q.options.length > 0 ? (
                      <div className="space-y-2 pt-1 pl-1">
                        {q.options.map((opt, i) => (
                          <label
                            key={i}
                            className="flex items-center gap-3 text-sm text-black hover:text-gray-700 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`question_${q.id}`}
                              value={opt}
                              checked={answers[q.id] === opt}
                              onChange={() => handleAnswerChange(q.id, opt)}
                              className="w-4 h-4 text-[#63474D] focus:ring-[#63474D] cursor-pointer"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : qType === 'multi_choice' && q.options && q.options.length > 0 ? (
                      <div className="space-y-2 pt-1 pl-1">
                        {q.options.map((opt, i) => {
                          const currentSelections: string[] = answers[q.id]
                            ? answers[q.id].split(', ').filter(Boolean)
                            : [];
                          const isChecked = currentSelections.includes(opt);
                          return (
                            <label
                              key={i}
                              className="flex items-center gap-3 text-sm text-black hover:text-gray-700 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                value={opt}
                                checked={isChecked}
                                onChange={(e) => {
                                  let updated: string[];
                                  if (e.target.checked) {
                                    updated = [...currentSelections, opt];
                                  } else {
                                    updated = currentSelections.filter((x) => x !== opt);
                                  }
                                  handleAnswerChange(q.id, updated.join(', '));
                                }}
                                className="w-4 h-4 rounded text-[#63474D] focus:ring-[#63474D] cursor-pointer"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <input
                        type="text"
                        required={q.isRequired}
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Your answer"
                        className="w-full px-4 py-2.5 bg-white/70 border border-gray-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#63474D] shadow-xs"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-700 py-1">
            No additional registration questions are required for this event.
          </div>
        )}

        {/* Payment Section (ONLY displayed if the event is NOT free) */}
        {event.isPaid && (event.ticketPrice || 0) > 0 && (
          <div className="space-y-4 pt-4 border-t border-gray-300">
            <div>
              <h2 className="font-serif font-bold text-lg text-black">
                Payment Details
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                This is a paid event. Total admission fee: <strong className="text-black font-extrabold">{event.ticketPrice} ETB</strong>
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-black">
                Select your preferred payment method:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {[
                  { id: 'telebirr' as const, name: 'Telebirr', desc: 'Direct USSD or App transfer' },
                  { id: 'cbe' as const, name: 'CBE', desc: 'Commercial Bank of Ethiopia' },
                  { id: 'awash' as const, name: 'Awash', desc: 'Awash Birr / Online Banking' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedPayment(m.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedPayment === m.id
                        ? 'bg-[#63474D]/15 border-[#63474D] text-black shadow-sm ring-2 ring-[#63474D]/30'
                        : 'bg-white/40 border-gray-300 text-black hover:bg-white/60'
                    }`}
                  >
                    <p className="font-bold text-sm text-black">{m.name}</p>
                    <p className="text-[11px] text-gray-600 mt-1">{m.desc}</p>
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-gray-600 pt-2">
                Upon submission, instructions to finalize your {selectedPayment.toUpperCase()} payment will be verified for your entry pass.
              </p>
            </div>
          </div>
        )}

        {/* Submit Action */}
        <div className="pt-4 border-t border-gray-300 flex justify-start">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="px-8 py-3 text-xs font-bold rounded-xl shadow-md cursor-pointer"
          >
            Submit Registration
          </Button>
        </div>
      </form>
    </div>
  );
};
