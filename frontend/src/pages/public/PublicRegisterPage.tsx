import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Event } from '../../types/event';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  Award,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  ArrowLeft,
  Ticket as TicketIcon,
} from 'lucide-react';

export const PublicRegisterPage: React.FC = () => {
  const { token, id } = useParams<{ token?: string; id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  // View state: 'details' (Section 1) | 'form' (Section 3) | 'confirmed' (Section 4)
  const [viewStep, setViewStep] = useState<'details' | 'form' | 'confirmed'>('details');

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentPath = location.pathname + location.search;

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
            }
          } catch {
            // Not registered
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isAuthenticated || !user) {
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}&mode=signup`);
      return;
    }

    if (!event) return;

    // Check required custom questions
    for (const q of event.customQuestions || []) {
      if (q.isRequired && !answers[q.id]?.trim()) {
        setErrorMsg(`Please answer the required question: "${q.questionText}"`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await api.registration.registerForEvent({
        eventId: event.id,
        attendee: user,
        answers,
      });

      if (res.ticket) {
        setIsAlreadyRegistered(true);
        setViewStep('confirmed');
      }
    } catch (err: any) {
      const msg = err.message || 'Registration failed.';
      setErrorMsg(msg);
      if (msg.includes('already registered')) {
        setIsAlreadyRegistered(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-56 bg-[#E8DDD7]/50 rounded-3xl"></div>
          <div className="h-8 bg-[#E8DDD7]/50 w-3/4 rounded-xl"></div>
          <div className="h-20 bg-[#E8DDD7]/50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#AA767C] mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-[#2D1F23]">Event Not Found</h2>
        <p className="text-xs text-[#756366]">
          This event link may be invalid, closed, or the event was removed by the organizer.
        </p>
        <Link to="/login">
          <Button variant="outline" size="sm">
            Sign In to Sheba
          </Button>
        </Link>
      </div>
    );
  }

  const isFull = Boolean(
    event.isFull || (event.capacity > 0 && event.registeredCount >= event.capacity) || event.status === 'closed'
  );

  const posterImage = event.posterImageUrl || event.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

  // SECTION 4: Registration Confirmation View
  if (viewStep === 'confirmed') {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-[#E8DDD7] shadow-sm text-center space-y-5">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-widest font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Registration Confirmed
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2D1F23] pt-2">
              You're registered for {event.title}
            </h1>
            <p className="text-xs text-[#756366]">
              A confirmation email has been dispatched to <strong>{user?.email}</strong>.
            </p>
          </div>

          {/* Logistics Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#FAF7F5] rounded-2xl border border-[#E8DDD7] text-left text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#756366] block">Date</span>
              <p className="font-semibold text-[#2D1F23]">{event.date}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#756366] block">Time</span>
              <p className="font-semibold text-[#2D1F23]">{event.time}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#756366] block">Location</span>
              <p className="font-semibold text-[#2D1F23] truncate">{event.location}</p>
            </div>
          </div>

          {/* Badges Explanation Note (Section 4 & 5 connection) */}
          <div className="p-4 rounded-2xl bg-[#63474D]/5 border border-[#63474D]/15 text-left flex items-start gap-3">
            <Award className="w-5 h-5 text-[#63474D] shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-[#2D1F23]">Verified Badges Unlock at the Door</p>
              <p className="text-[#756366] leading-relaxed text-[11px]">
                When you arrive at the event, the organizer will scan your check-in pass. Your official, authentic <strong>Attended</strong> badge (and any Participant, Winner, or Speaker awards) will automatically appear in your Badges collection.
              </p>
            </div>
          </div>

          {/* Prominent CTA into Badges Page (Section 4 requirement) */}
          <div className="space-y-2 pt-2">
            <Link to="/app/badges">
              <Button fullWidth variant="primary" size="lg" className="py-3.5 flex items-center justify-center gap-2">
                <Award className="w-4 h-4 text-[#FFA686]" />
                <span>View Your Badges</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link to={`/app/ticket/${event.id}`}>
              <Button fullWidth variant="outline" size="sm" className="flex items-center justify-center gap-2 text-xs">
                <TicketIcon className="w-3.5 h-3.5 text-[#63474D]" />
                <span>View Entry QR Pass</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
      {/* Event Header Banner (Section 1) */}
      <div className="bg-white rounded-3xl overflow-hidden border border-[#E8DDD7] shadow-xs">
        {posterImage && (
          <img
            src={posterImage}
            alt={event.title}
            className="w-full h-52 sm:h-64 object-cover"
          />
        )}

        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="primary" className="uppercase font-mono">
              {event.type}
            </Badge>
            <span className="text-xs font-bold text-[#63474D] bg-[#FAF7F5] px-2.5 py-1 rounded-lg border border-[#E8DDD7]">
              FREE ADMISSION
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2D1F23]">
            {event.title}
          </h1>

          <p className="text-xs font-semibold text-[#AA767C]">
            Hosted by {event.organizerName}
          </p>

          <p className="text-xs text-[#756366] leading-relaxed whitespace-pre-line">
            {event.description}
          </p>

          {/* Logistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-[#2D1F23]">
            <div className="p-3 rounded-xl bg-[#FAF7F5] border border-[#E8DDD7] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#756366] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#63474D]" /> Date
              </span>
              <p className="font-semibold">{event.date}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF7F5] border border-[#E8DDD7] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#756366] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#63474D]" /> Time
              </span>
              <p className="font-semibold">{event.time}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF7F5] border border-[#E8DDD7] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#756366] flex items-center gap-1">
                <Users className="w-3 h-3 text-[#63474D]" /> Status
              </span>
              <p className="font-semibold">
                {isFull ? (
                  <span className="text-red-700 font-bold">Registration full</span>
                ) : (
                  <span>Registration Open</span>
                )}
              </p>
            </div>
          </div>

          <div className="text-xs text-[#756366] flex items-center gap-1.5 pt-1">
            <MapPin className="w-4 h-4 text-[#63474D] shrink-0" />
            <span>{event.location}</span>
          </div>

          {/* SECTION 1: Primary Action Button with 4 Strict States */}
          {viewStep === 'details' && (
            <div className="pt-4 border-t border-[#E8DDD7]">
              {/* State 4: Event Full */}
              {isFull ? (
                <div className="p-3.5 bg-gray-100 rounded-2xl text-center text-xs font-bold text-gray-500 border border-gray-200">
                  Registration full
                </div>
              ) : isAlreadyRegistered ? (
                /* State 3: Logged in and already registered -> replace Register button with badges CTA */
                <div className="space-y-2">
                  <Link to="/app/badges">
                    <Button
                      fullWidth
                      variant="primary"
                      size="lg"
                      className="py-3.5 flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white"
                    >
                      <Award className="w-4 h-4 text-[#FFA686]" />
                      <span>You're registered — view your badges</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <p className="text-[11px] text-center text-[#756366]">
                    You have already secured entry for this event. No duplicate registration needed.
                  </p>
                </div>
              ) : !isAuthenticated ? (
                /* State 1: Not logged in -> button reads "Register", clicking sends to Sign In / Sign Up */
                <Button
                  fullWidth
                  variant="primary"
                  size="lg"
                  className="py-3.5"
                  onClick={() =>
                    navigate(`/login?redirect=${encodeURIComponent(currentPath)}&mode=signup`)
                  }
                >
                  Register
                </Button>
              ) : (
                /* State 2: Logged in, not registered -> button reads "Register", clicking opens Registration Form */
                <Button
                  fullWidth
                  variant="primary"
                  size="lg"
                  className="py-3.5"
                  onClick={() => setViewStep('form')}
                >
                  Register
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: Registration Form (Shown once authenticated attendee clicks Register) */}
      {viewStep === 'form' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DDD7] shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8DDD7]">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2D1F23]">
                Event Registration Form
              </h2>
              <p className="text-xs text-[#756366]">
                Provide your details for verified door check-in & credential issuance.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setViewStep('details')}
              className="text-xs text-[#756366] hover:text-[#2D1F23] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="p-3.5 bg-[#FAF7F5] rounded-xl border border-[#E8DDD7] text-xs space-y-0.5">
              <span className="text-[10px] text-[#756366] uppercase font-bold">Registering As</span>
              <p className="font-bold text-[#2D1F23]">
                {user?.name} ({user?.email})
              </p>
            </div>

            {/* Custom Organizer Questions (Section 3: Free text fields) */}
            {event.customQuestions && event.customQuestions.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#756366]">
                  Organizer Questions
                </h3>
                {event.customQuestions.map((q) => (
                  <div key={q.id} className="space-y-1">
                    <label className="block text-xs font-bold text-[#2D1F23]">
                      {q.questionText} {q.isRequired && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      required={q.isRequired}
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      placeholder="Your answer..."
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
                    />
                  </div>
                ))}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              variant="primary"
              size="lg"
              className="py-3.5 mt-2"
              isLoading={isSubmitting}
              disabled={isSubmitting || isFull}
            >
              Complete Registration
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
