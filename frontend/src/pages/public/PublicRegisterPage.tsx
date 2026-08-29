import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Event } from '../../types/event';
import type { Ticket } from '../../types/ticket';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  QrCode,
  ArrowLeft,
} from 'lucide-react';

export const PublicRegisterPage: React.FC = () => {
  const { token, id } = useParams<{ token?: string; id?: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAgeAttested, setIsAgeAttested] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [issuedTicket, setIssuedTicket] = useState<Ticket | null>(null);

  // Chapa payment modal simulation state
  const [showChapaModal, setShowChapaModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Telebirr' | 'CBE_Birr' | 'Local_Card'>('Telebirr');

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        let fetched: Event | null = null;
        if (token) {
          fetched = await api.events.getByShareToken(token);
        } else if (id) {
          fetched = await api.events.getById(id);
        }
        setEvent(fetched);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [token, id]);

  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    if (!isAgeAttested) {
      setErrorMsg('You must confirm you are 18+ to complete registration.');
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

    // If paid event, trigger Chapa checkout modal
    if (event.isPaid && event.ticketPrice > 0) {
      setShowChapaModal(true);
      return;
    }

    // Free event registration
    setIsSubmitting(true);
    try {
      const res = await api.registration.registerForEvent({
        eventId: event.id,
        attendee: user,
        answers,
      });
      setIssuedTicket(res.ticket);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmChapaPayment = async () => {
    if (!event || !user) return;
    setIsSubmitting(true);
    try {
      const res = await api.registration.registerForEvent({
        eventId: event.id,
        attendee: user,
        answers,
        paymentReference: `CHP_TX_${Date.now()}`,
      });
      setShowChapaModal(false);
      setIssuedTicket(res.ticket);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment processing failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-[#E8DDD7]/50 rounded-3xl"></div>
          <div className="h-8 bg-[#E8DDD7]/50 w-3/4 rounded-xl"></div>
          <div className="h-20 bg-[#E8DDD7]/50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#AA767C] mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-[#2D1F23]">Event Link Not Found</h2>
        <p className="text-xs text-[#756366]">
          This registration link may be invalid, closed, or the event was removed by the organizer.
        </p>
        <Link to="/">
          <Button variant="outline" size="sm">
            Return to Home
          </Button>
        </Link>
      </div>
    );
  }

  // Registration Complete Screen
  if (issuedTicket) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DDD7] shadow-sm space-y-6 text-center">
          <div className="w-16 h-16 bg-[#2A7B5F]/15 rounded-full flex items-center justify-center text-[#2A7B5F] mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <Badge variant="success" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
              Registration Confirmed & Dynamic QR Pass Issued
            </Badge>
            <h2 className="font-serif text-2xl font-extrabold text-[#2D1F23]">{event.title}</h2>
            <p className="text-xs text-[#756366]">
              Confirmation email sent to <strong>{issuedTicket.attendeeEmail}</strong>
            </p>
          </div>

          {/* Dynamic Pass Preview Card */}
          <div className="bg-[#FAF7F5] p-5 rounded-2xl border border-[#E8DDD7] space-y-3 text-left">
            <div className="flex items-center justify-between text-xs font-semibold text-[#63474D]">
              <span>PASS ID: {issuedTicket.id}</span>
              <span className="text-[#2A7B5F] font-bold">STATUS: VALID</span>
            </div>
            <div className="space-y-1 text-xs text-[#2D1F23]">
              <p className="font-bold">{issuedTicket.attendeeName}</p>
              <p className="text-[#756366] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {issuedTicket.eventDate} • {issuedTicket.eventTime}
              </p>
              <p className="text-[#756366] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {issuedTicket.eventLocation}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8DDD7] text-center space-y-2">
              <QrCode className="w-32 h-32 mx-auto text-[#63474D]" />
              <p className="text-[10px] text-[#756366]">Dynamic QR Pass (Evaluated server-side at door)</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to="/app/events" className="flex-1">
              <Button fullWidth variant="primary">
                View My Tickets Wallet
              </Button>
            </Link>
            <Link to="/app/profile" className="flex-1">
              <Button fullWidth variant="outline">
                View My Profile & Badges
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isFull = event.registeredCount >= event.capacity || event.status === 'closed';

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#63474D] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Sheba Platform
      </Link>

      {/* Event Header Banner */}
      <div className="bg-white rounded-3xl overflow-hidden border border-[#E8DDD7] shadow-xs">
        {event.bannerUrl && (
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-48 sm:h-56 object-cover"
          />
        )}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="primary" className="uppercase font-mono">
              {event.type}
            </Badge>
            <span className="text-xs font-bold text-[#63474D]">
              {event.isPaid ? `${event.ticketPrice} ETB` : 'FREE ADMISSION'}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2D1F23]">
            {event.title}
          </h1>

          <p className="text-xs font-semibold text-[#AA767C]">
            Hosted by {event.organizerName}
          </p>

          <p className="text-xs text-[#756366] leading-relaxed">
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
                <Users className="w-3 h-3 text-[#63474D]" /> Capacity
              </span>
              <p className="font-semibold">
                {event.registeredCount} / {event.capacity} Registered
              </p>
            </div>
          </div>

          <div className="text-xs text-[#756366] flex items-center gap-1.5 pt-1">
            <MapPin className="w-4 h-4 text-[#63474D] flex-shrink-0" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DDD7] shadow-xs space-y-6">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#2D1F23]">
            Attendee Registration Form
          </h2>
          <p className="text-xs text-[#756366]">
            Complete the questions set by the organizer to secure your verified entry pass.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="p-5 bg-[#FAF7F5] rounded-2xl border border-[#E8DDD7] text-center space-y-3">
            <p className="text-xs text-[#756366]">
              Sheba registration requires an Attendee Account to associate your verified credentials & dynamic QR ticket pass.
            </p>
            <Link to="/login">
              <Button variant="primary" size="sm">
                Sign In / Register Attendee Account
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="p-3.5 bg-[#FAF7F5] rounded-xl border border-[#E8DDD7] text-xs space-y-1">
              <span className="text-[10px] text-[#756366] uppercase font-bold">Registering As</span>
              <p className="font-bold text-[#2D1F23]">{user?.name} ({user?.email})</p>
            </div>

            {/* Custom Organizer Questions */}
            {event.customQuestions && event.customQuestions.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#756366]">
                  Organizer Custom Questions
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
                      placeholder="Your response..."
                      className="w-full px-3.5 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#63474D]"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 18+ Self-Attestation */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#756366]">
                <input
                  type="checkbox"
                  checked={isAgeAttested}
                  onChange={(e) => setIsAgeAttested(e.target.checked)}
                  className="mt-0.5 rounded text-[#63474D] focus:ring-[#63474D]"
                />
                <span>
                  I self-attest that I am <strong>18 years of age or older</strong> and will present this digital ticket pass at check-in.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              fullWidth
              variant={isFull ? 'ghost' : 'primary'}
              size="lg"
              disabled={isFull || isSubmitting}
              isLoading={isSubmitting}
            >
              {isFull
                ? 'Event Registration Closed (Capacity Reached)'
                : event.isPaid
                ? `Proceed to Payment (${event.ticketPrice} ETB via Chapa)`
                : 'Confirm Free Registration & Get QR Pass'}
            </Button>
          </form>
        )}
      </div>

      {/* Chapa Split Payment Modal */}
      {showChapaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#E8DDD7] shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DDD7]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2A7B5F] flex items-center justify-center text-white font-bold text-xs">
                  C
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2D1F23]">Chapa Ethiopia Checkout</h3>
                  <p className="text-[10px] text-[#756366]">Split-Payment Gateway (ETB Currency)</p>
                </div>
              </div>
              <Badge variant="success">Secured</Badge>
            </div>

            <div className="space-y-3 bg-[#FAF7F5] p-4 rounded-2xl border border-[#E8DDD7] text-xs">
              <div className="flex justify-between">
                <span className="text-[#756366]">Event Ticket</span>
                <span className="font-bold text-[#2D1F23]">{event.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#756366]">Ticket Price</span>
                <span className="font-bold text-[#2D1F23]">{event.ticketPrice} ETB</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#756366] pt-1 border-t border-[#E8DDD7]">
                <span>Sheba Platform Fee (3% split)</span>
                <span>{(event.ticketPrice * 0.03).toFixed(2)} ETB</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#756366]">
                <span>Organizer Settlement</span>
                <span>{(event.ticketPrice * 0.97).toFixed(2)} ETB</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#2D1F23]">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Telebirr', 'CBE_Birr', 'Local_Card'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all ${
                      paymentMethod === method
                        ? 'border-[#63474D] bg-[#63474D] text-white shadow-xs'
                        : 'border-[#E8DDD7] bg-[#FAF7F5] text-[#756366] hover:bg-white'
                    }`}
                  >
                    {method === 'Telebirr' ? 'Telebirr' : method === 'CBE_Birr' ? 'CBE Birr' : 'Debit Card'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => setShowChapaModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                fullWidth
                isLoading={isSubmitting}
                onClick={handleConfirmChapaPayment}
                icon={<CreditCard className="w-4 h-4" />}
              >
                Pay {event.ticketPrice} ETB
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
