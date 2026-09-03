import type { Event, EventType } from '../types/event';
import type { Ticket } from '../types/ticket';
import type { BadgeAward, BadgeCode, SponsorReportData, AttendeeRosterItem } from '../types/attendance';
import type { User, UserRole, ProfileVisibility } from '../types/user';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('sheba_auth_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('sheba_auth_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('sheba_auth_token');
};

// In-memory & local-storage state holders
const loadInitialEvents = (): Event[] => {
  try {
    const saved = localStorage.getItem('sheba_events_store');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse saved events:', e);
  }
  return [];
};

let eventsStore: Event[] = loadInitialEvents();
const saveEventsStore = () => {
  try {
    localStorage.setItem('sheba_events_store', JSON.stringify(eventsStore));
  } catch (e) {
    console.error('Failed to save events:', e);
  }
};

let ticketsStore: Ticket[] = [];
let badgeAwardsStore: BadgeAward[] = [];
let attendeeRosterStore: Record<string, AttendeeRosterItem[]> = {};

export async function requestApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else if (contentType && contentType.includes('text/csv')) {
    data = await response.blob();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      `HTTP ${response.status}: ${response.statusText}`;

    const errorObj: any = new Error(errorMsg);
    errorObj.status = response.status;
    errorObj.data = data;
    errorObj.isPendingApproval = data?.isPendingApproval || response.status === 403;
    throw errorObj;
  }

  return data;
}

export const api = {
  // Authentication
  auth: {
    login: async (creds: { email: string; password: string }): Promise<{ user: User; token: string }> => {
      try {
        const res = await requestApi('/auth/login', {
          method: 'POST',
          body: JSON.stringify(creds),
        });

        if (res.data?.token) {
          setAuthToken(res.data.token);
        }
        return {
          user: res.data.user,
          token: res.data.token,
        };
      } catch (err: any) {
        if (err.status === 401 || err.status === 403 || err.statusCode === 401 || err.statusCode === 403) {
          throw err;
        }
        console.warn('Backend login fallback to local session:', err.message);
        const localUser: User = {
          id: `usr_${Date.now()}`,
          name: creds.email.split('@')[0],
          email: creds.email,
          role: 'ATTENDEE',
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(creds.email)}&background=63474D&color=fff`,
          memberSince: 'September 2026',
        };
        const token = `local_jwt_${Date.now()}`;
        setAuthToken(token);
        return { user: localUser, token };
      }
    },

    register: async (data: {
      email: string;
      password: string;
      full_name: string;
      role?: UserRole;
      organization?: string;
      phone?: string;
      bio?: string;
    }): Promise<{ user: User; token?: string; isPendingApproval?: boolean; message?: string }> => {
      try {
        const res = await requestApi('/auth/register', {
          method: 'POST',
          body: JSON.stringify(data),
        });

        if (res.data?.token) {
          setAuthToken(res.data.token);
        }

        return {
          user: res.data.user,
          token: res.data.token,
          isPendingApproval: res.data.isPendingApproval || false,
          message: res.data.message || res.message,
        };
      } catch (err: any) {
        if (err.status === 409 || err.statusCode === 409 || err.message?.includes('already registered')) {
          throw err;
        }
        console.warn('Backend register fallback to local session:', err.message);
        const localUser: User = {
          id: `usr_${Date.now()}`,
          name: data.full_name,
          email: data.email,
          role: data.role || 'ATTENDEE',
          organization: data.organization,
          phone: data.phone,
          bio: data.bio,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name)}&background=63474D&color=fff`,
          memberSince: 'September 2026',
        };
        const token = `local_jwt_${Date.now()}`;
        setAuthToken(token);
        return {
          user: localUser,
          token,
          isPendingApproval: data.role === 'ORGANIZER',
          message: 'Account created successfully (Local Dev Mode)',
        };
      }
    },

    getMe: async (): Promise<User | null> => {
      try {
        const res = await requestApi('/users/profile');
        return res.data;
      } catch {
        const saved = localStorage.getItem('sheba_auth_user');
        return saved ? JSON.parse(saved) : null;
      }
    },

    logout: async (): Promise<void> => {
      removeAuthToken();
      try {
        await requestApi('/auth/logout', { method: 'POST' });
      } catch {
        // ignore
      }
    },

    forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
      try {
        const res = await requestApi('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email }),
        });
        return res.data || { success: true, message: 'Password reset link sent.' };
      } catch (e: any) {
        return { success: true, message: e.message || 'If an account exists, a reset link has been dispatched.' };
      }
    },

    resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
      const res = await requestApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
      return res.data || { success: true, message: 'Password reset successfully.' };
    },
  },

  // Events API
  events: {
    getAll: async (organizerId?: string): Promise<Event[]> => {
      try {
        const queryParam = organizerId ? `?organizerId=${encodeURIComponent(organizerId)}` : '';
        const res = await requestApi(`/events${queryParam}`);
        if (res.data && Array.isArray(res.data)) {
          if (!organizerId) {
            eventsStore = res.data;
            saveEventsStore();
          }
          return res.data;
        }
      } catch (e) {
        console.warn('Backend event fetch fallback:', e);
      }
      if (organizerId) {
        return eventsStore.filter((e) => e.organizerId === organizerId);
      }
      return [...eventsStore];
    },

    getById: async (id: string): Promise<Event | null> => {
      try {
        const res = await requestApi(`/events/${id}`);
        if (res.data) return res.data;
      } catch {
        // fallback
      }
      const ev = eventsStore.find((e) => e.id === id);
      return ev || null;
    },

    getByShareToken: async (token: string): Promise<Event | null> => {
      try {
        const res = await requestApi(`/events/share/${token}`);
        if (res.data) return res.data;
      } catch {
        // fallback
      }
      const ev = eventsStore.find((e) => e.shareLinkToken === token || e.id === token);
      return ev || null;
    },

    create: async (data: Partial<Event>): Promise<Event> => {
      try {
        const res = await requestApi('/events', {
          method: 'POST',
          body: JSON.stringify({
            title: data.title,
            description: data.description,
            type: data.type || 'workshop',
            date: data.date,
            startTime: data.startTime || '09:00 AM',
            endTime: data.endTime || '05:00 PM',
            location: data.location,
            venueName: data.venueName || data.location,
            capacity: Number(data.capacity) || 100,
            isPaid: Boolean(data.isPaid),
            ticketPrice: Number(data.ticketPrice) || 0,
            currency: 'ETB',
            customQuestions: data.customQuestions || [],
            bannerUrl: data.bannerUrl,
          }),
        });
        if (res.data) {
          eventsStore.unshift(res.data);
          saveEventsStore();
          return res.data;
        }
      } catch (e) {
        console.warn('Backend event creation fallback:', e);
      }

      const newEvent: Event = {
        id: `evt_${Date.now()}`,
        organizerId: data.organizerId || 'org-current',
        organizerName: data.organizerName || 'Organizer',
        title: data.title || 'Untitled Event',
        description: data.description || '',
        type: (data.type as EventType) || 'workshop',
        date: data.date || new Date().toISOString().split('T')[0],
        startTime: data.startTime || '09:00 AM',
        endTime: data.endTime || '05:00 PM',
        time: data.time || `${data.startTime || '09:00 AM'} - ${data.endTime || '05:00 PM'} EAT`,
        location: data.location || 'Addis Ababa',
        venueName: data.venueName || data.location || 'Addis Ababa Tech Hub',
        capacity: Number(data.capacity) || 100,
        registeredCount: 0,
        checkedInCount: 0,
        status: 'open',
        isPaid: Boolean(data.isPaid),
        ticketPrice: Number(data.ticketPrice) || 0,
        currency: 'ETB',
        shareLinkToken: `shb-${Math.random().toString(36).substring(2, 8)}`,
        customQuestions: data.customQuestions || [],
        bannerUrl: data.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        createdAt: new Date().toISOString(),
      };
      eventsStore.unshift(newEvent);
      saveEventsStore();
      return newEvent;
    },

    update: async (id: string, data: Partial<Event>): Promise<Event> => {
      const idx = eventsStore.findIndex((e) => e.id === id);
      if (idx !== -1) {
        eventsStore[idx] = { ...eventsStore[idx], ...data };
        saveEventsStore();
        return eventsStore[idx];
      }
      throw new Error('Event not found');
    },

    delete: async (id: string): Promise<boolean> => {
      try {
        await requestApi(`/events/${id}`, { method: 'DELETE' });
      } catch (e) {
        console.warn('Backend event delete fallback:', e);
      }
      eventsStore = eventsStore.filter((e) => e.id !== id);
      saveEventsStore();
      return true;
    },
  },

  // Registration & Ticketing
  registration: {
    registerForEvent: async (params: {
      eventId: string;
      attendee: User;
      answers?: Record<string, string>;
      paymentReference?: string;
    }): Promise<{ ticket: Ticket; isPaymentRequired: boolean; checkoutUrl?: string }> => {
      try {
        const res = await requestApi(`/events/${params.eventId}/register`, {
          method: 'POST',
          body: JSON.stringify({
            attendee: params.attendee,
            answers: params.answers,
            paymentReference: params.paymentReference,
          }),
        });
        if (res.data?.ticket) {
          ticketsStore.unshift(res.data.ticket);
          return res.data;
        }
      } catch (err: any) {
        if (err.status === 409 || err.statusCode === 409 || err.message?.includes('already registered')) {
          throw new Error('You are already registered for this event.');
        }
        if (err.status === 400 || err.message?.includes('capacity') || err.message?.includes('closed')) {
          throw new Error(err.message || 'Event registration failed.');
        }
        console.warn('Backend register fallback to local store:', err.message);
      }

      const event = eventsStore.find((e) => e.id === params.eventId);
      if (!event) throw new Error('Event not found.');

      if (event.registeredCount >= event.capacity) {
        throw new Error('Event capacity has been reached.');
      }

      if (event.isPaid && !params.paymentReference) {
        return {
          ticket: null as any,
          isPaymentRequired: true,
          checkoutUrl: `https://checkout.chapa.co/checkout/payment-simulation?amount=${event.ticketPrice}&currency=ETB`,
        };
      }

      event.registeredCount += 1;
      if (event.registeredCount >= event.capacity) {
        event.status = 'closed';
      }

      const ticketId = `SHB-${Math.floor(1000 + Math.random() * 9000)}-2026`;
      const signedQrToken = `shb_signed_${params.eventId}_${params.attendee.id}_${Date.now()}`;

      const eventDateObj = new Date(event.date);
      const nextDay = new Date(eventDateObj);
      nextDay.setDate(nextDay.getDate() + 1);

      const newTicket: Ticket = {
        id: ticketId,
        registrationId: `reg_${Date.now()}`,
        eventId: event.id,
        eventTitle: event.title,
        eventType: event.type,
        eventDate: event.date,
        eventTime: event.time,
        eventLocation: event.location,
        attendeeId: params.attendee.id,
        attendeeName: params.attendee.name,
        attendeeEmail: params.attendee.email,
        qrToken: signedQrToken,
        status: 'Valid',
        issuedAt: new Date().toISOString(),
        expiresAt: nextDay.toISOString(),
        isPaid: event.isPaid,
        ticketPrice: event.ticketPrice,
        currency: 'ETB',
      };

      ticketsStore.unshift(newTicket);

      if (!attendeeRosterStore[event.id]) {
        attendeeRosterStore[event.id] = [];
      }
      attendeeRosterStore[event.id].push({
        id: `roster_${Date.now()}`,
        registrationId: newTicket.registrationId,
        attendeeId: params.attendee.id,
        name: params.attendee.name,
        email: params.attendee.email,
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'Registered',
        badges: [],
      });

      return { ticket: newTicket, isPaymentRequired: false };
    },

    getMyTickets: async (attendeeId?: string): Promise<Ticket[]> => {
      try {
        const res = await requestApi('/tickets');
        if (res.data && Array.isArray(res.data)) {
          return res.data;
        }
      } catch {
        try {
          const userRes = await requestApi('/users/me/tickets');
          if (userRes.data && Array.isArray(userRes.data)) return userRes.data;
        } catch {
          // fallback
        }
      }
      return attendeeId ? ticketsStore.filter((t) => t.attendeeId === attendeeId) : ticketsStore;
    },

    getAttendeeTickets: async (attendeeId: string): Promise<Ticket[]> => {
      return api.registration.getMyTickets(attendeeId);
    },

    getTicketByEvent: async (eventId: string, attendeeId: string): Promise<Ticket | null> => {
      try {
        const res = await requestApi(`/tickets/${eventId}`);
        if (res.data) return res.data;
      } catch {
        // fallback
      }
      return (
        ticketsStore.find((t) => t.eventId === eventId && t.attendeeId === attendeeId) || null
      );
    },

    cancelRegistration: async (ticketId: string): Promise<boolean> => {
      const ticket = ticketsStore.find((t) => t.id === ticketId);
      if (ticket) {
        ticket.status = 'Cancelled';
        const ev = eventsStore.find((e) => e.id === ticket.eventId);
        if (ev && ev.registeredCount > 0) {
          ev.registeredCount -= 1;
          if (ev.status === 'closed') ev.status = 'open';
        }
        return true;
      }
      return false;
    },
  },

  // QR Scanning & Check-in (Organizer)
  checkIn: {
    verifyAndCheckInQr: async (params: {
      qrToken: string;
      eventId: string;
      organizerId: string;
    }): Promise<{
      success: boolean;
      message: string;
      alreadyCheckedIn?: boolean;
      ticket?: Ticket;
      rosterItem?: AttendeeRosterItem;
    }> => {
      const roster = attendeeRosterStore[params.eventId] || [];
      const ticket = ticketsStore.find((t) => t.qrToken === params.qrToken);
      const found = roster.find((r) => r.attendeeId === ticket?.attendeeId) || roster[0];

      if (!ticket && !found) {
        return {
          success: false,
          message: 'Invalid QR Ticket. No active registration matches this digital signature.',
        };
      }

      if (ticket && ticket.status === 'Checked in') {
        return {
          success: false,
          alreadyCheckedIn: true,
          message: `Already Checked-In at ${ticket.checkedInAt ? new Date(ticket.checkedInAt).toLocaleTimeString() : 'earlier'}.`,
          rosterItem: found,
          ticket,
        };
      }

      if (ticket) {
        ticket.status = 'Checked in';
        ticket.checkedInAt = new Date().toISOString();
      }

      if (found) {
        found.status = 'Checked in';
        found.checkInTime = new Date().toLocaleTimeString();
        if (!found.badges.includes('attended')) {
          found.badges.push('attended');
        }
      }

      const targetAttendeeId = ticket?.attendeeId || found?.attendeeId;
      if (targetAttendeeId) {
        try {
          await api.badges.awardBadge({
            eventId: params.eventId,
            attendeeId: targetAttendeeId,
            badgeCode: 'attended',
            awardedByOrganizerId: params.organizerId,
          });
        } catch {
          // ignore if already awarded
        }
      }

      const ev = eventsStore.find((e) => e.id === params.eventId);
      if (ev) {
        ev.checkedInCount = (ev.checkedInCount || 0) + 1;
      }

      return {
        success: true,
        message: `Check-in successful! Verified attendance badge awarded to ${ticket?.attendeeName || found?.name || 'Attendee'}.`,
        rosterItem: found,
        ticket,
      };
    },

    lookupByTokenOrName: async (eventId: string, query: string): Promise<AttendeeRosterItem | null> => {
      const roster = attendeeRosterStore[eventId] || [];
      const q = query.toLowerCase().trim();
      const match = roster.find(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.registrationId.toLowerCase().includes(q)
      );
      return match || null;
    },

    approveCheckIn: async (params: {
      eventId: string;
      attendeeRosterId: string;
      approvedByOrganizerId: string;
    }): Promise<{ success: boolean; message: string; badgeAwarded?: BadgeAward; rosterItem?: AttendeeRosterItem }> => {
      const roster = attendeeRosterStore[params.eventId] || [];
      const item = roster.find((r) => r.id === params.attendeeRosterId);
      if (item) {
        item.status = 'Checked in';
        item.checkInTime = new Date().toLocaleTimeString();
        if (!item.badges.includes('attended')) item.badges.push('attended');

        const ev = eventsStore.find((e) => e.id === params.eventId);
        if (ev) ev.checkedInCount = (ev.checkedInCount || 0) + 1;

        const badge = await api.badges.awardBadge({
          eventId: params.eventId,
          attendeeId: item.attendeeId,
          badgeCode: 'attended',
          awardedByOrganizerId: params.approvedByOrganizerId,
        });

        return {
          success: true,
          message: `Approved check-in for ${item.name}!`,
          badgeAwarded: badge,
          rosterItem: item,
        };
      }
      return { success: false, message: 'Attendee not found in roster.' };
    },

    verifyToken: async (qrToken: string, eventId: string): Promise<any> => {
      return api.checkIn.verifyAndCheckInQr({ qrToken, eventId, organizerId: 'current' });
    },

    manualCheckin: async (attendeeRosterId: string, eventId: string): Promise<boolean> => {
      return api.checkIn.manualCheckIn({ attendeeRosterId, eventId });
    },

    manualCheckIn: async (params: {
      attendeeRosterId: string;
      eventId: string;
    }): Promise<boolean> => {
      const roster = attendeeRosterStore[params.eventId] || [];
      const item = roster.find((r) => r.id === params.attendeeRosterId || r.attendeeId === params.attendeeRosterId);
      if (item && item.status !== 'Checked in') {
        item.status = 'Checked in';
        item.checkInTime = new Date().toLocaleTimeString();
        if (!item.badges.includes('attended')) item.badges.push('attended');

        const ev = eventsStore.find((e) => e.id === params.eventId);
        if (ev) ev.checkedInCount = (ev.checkedInCount || 0) + 1;
        return true;
      }
      return false;
    },
  },

  // Alias for checkin / scanner
  get checkin() {
    return this.checkIn;
  },

  // Badge Awards
  badges: {
    awardBadge: async (params: {
      eventId: string;
      attendeeId: string;
      badgeCode: BadgeCode;
      awardedByOrganizerId: string;
      reason?: string;
    }): Promise<BadgeAward> => {
      const badgeLabels: Record<BadgeCode, string> = {
        attended: 'Attended',
        participant: 'Participant',
        winner: 'Winner / Finalist',
        speaker: 'Keynote Speaker',
      };

      const newBadge: BadgeAward = {
        id: `bdg_${Date.now()}`,
        badgeCode: params.badgeCode,
        badgeLabel: badgeLabels[params.badgeCode] || 'Attended',
        eventId: params.eventId,
        eventTitle: 'Event Badge',
        eventType: 'workshop',
        eventDate: new Date().toISOString().split('T')[0],
        eventLocation: 'Addis Ababa',
        attendeeId: params.attendeeId,
        attendeeName: 'Attendee',
        attendeeEmail: 'attendee@sheba.et',
        issuerName: 'Event Organizer',
        awardedBy: params.awardedByOrganizerId,
        awardedAt: new Date().toISOString(),
        revokedAt: null,
      };

      badgeAwardsStore.push(newBadge);

      const roster = attendeeRosterStore[params.eventId] || [];
      const attendee = roster.find((r) => r.attendeeId === params.attendeeId);
      if (attendee && !attendee.badges.includes(params.badgeCode)) {
        attendee.badges.push(params.badgeCode);
      }

      return newBadge;
    },

    bulkAwardBadges: async (params: {
      eventId: string;
      attendeeRosterIds: string[];
      badgeCode: BadgeCode;
      awardedByOrganizerId: string;
    }): Promise<{ awardedCount: number }> => {
      let count = 0;
      const roster = attendeeRosterStore[params.eventId] || [];
      for (const rosterId of params.attendeeRosterIds) {
        const item = roster.find((r) => r.id === rosterId || r.attendeeId === rosterId);
        const attendeeId = item ? item.attendeeId : rosterId;
        await api.badges.awardBadge({
          eventId: params.eventId,
          attendeeId,
          badgeCode: params.badgeCode,
          awardedByOrganizerId: params.awardedByOrganizerId,
        });
        count++;
      }
      return { awardedCount: count };
    },

    revokeBadge: async (params: {
      badgeAwardId: string;
      reason?: string;
    }): Promise<boolean> => {
      const award = badgeAwardsStore.find((b) => b.id === params.badgeAwardId);
      if (award) {
        award.revokedAt = new Date().toISOString();
        return true;
      }
      return false;
    },

    getAttendeeBadges: async (attendeeId: string): Promise<BadgeAward[]> => {
      try {
        const res = await requestApi(`/badges/attendee/${attendeeId}`);
        if (res.data && Array.isArray(res.data)) return res.data;
      } catch {
        // fallback
      }
      return badgeAwardsStore.filter((b) => b.attendeeId === attendeeId && !b.revokedAt);
    },

    getAllBadgeAwards: async (): Promise<BadgeAward[]> => {
      return [...badgeAwardsStore];
    },

    getBadgeById: async (badgeId: string): Promise<BadgeAward | null> => {
      return badgeAwardsStore.find((b) => b.id === badgeId) || null;
    },

    adminRevokeBadge: async (badgeId: string): Promise<boolean> => {
      const award = badgeAwardsStore.find((b) => b.id === badgeId);
      if (award) {
        award.revokedAt = new Date().toISOString();
        return true;
      }
      return false;
    },

    getBadgeByVerificationToken: async (token: string): Promise<BadgeAward | null> => {
      return badgeAwardsStore.find((b) => b.id === token) || null;
    },
  },

  // Roster Alias
  roster: {
    getByEventId: async (eventId: string): Promise<AttendeeRosterItem[]> => {
      return attendeeRosterStore[eventId] || [];
    },
    getEventRoster: async (eventId: string): Promise<AttendeeRosterItem[]> => {
      return attendeeRosterStore[eventId] || [];
    },
  },

  // Organizer Reports & Sponsor Reports
  reports: {
    getAttendeeRoster: async (eventId: string): Promise<AttendeeRosterItem[]> => {
      return attendeeRosterStore[eventId] || [];
    },

    getEventReport: async (eventId: string): Promise<SponsorReportData> => {
      return api.reports.getSponsorReport(eventId);
    },

    getSponsorReport: async (eventId: string): Promise<SponsorReportData> => {
      const event = eventsStore.find((e) => e.id === eventId);
      const roster = attendeeRosterStore[eventId] || [];
      const totalTurnout = roster.filter((r) => r.status === 'Checked in').length;
      const turnoutRate = roster.length > 0 ? (totalTurnout / roster.length) * 100 : 0;

      return {
        eventId,
        eventTitle: event?.title || 'Tech Event',
        eventType: event?.type || 'workshop',
        eventDate: event?.date || new Date().toISOString().split('T')[0],
        eventLocation: event?.location || 'Addis Ababa',
        organizerName: event?.organizerName || 'Sheba Organizer',
        totalRegistered: roster.length,
        totalAttended: totalTurnout,
        attendanceRate: parseFloat(turnoutRate.toFixed(1)),
        badgeDistribution: {
          attended: roster.filter((r) => r.badges.includes('attended')).length,
          participant: roster.filter((r) => r.badges.includes('participant')).length,
          winner: roster.filter((r) => r.badges.includes('winner')).length,
          speaker: roster.filter((r) => r.badges.includes('speaker')).length,
        },
        registrationsOverTime: [],
        hourlyCheckIns: [],
        attendees: roster,
      };
    },

    exportCsv: async (eventId: string): Promise<void> => {
      return api.reports.exportSponsorReportCsv(eventId);
    },

    exportSponsorReportCsv: async (eventId: string): Promise<void> => {
      const roster = attendeeRosterStore[eventId] || [];
      const headers = ['Attendee Name', 'Email', 'Registered At', 'Checked In', 'Check-In Time', 'Badges'];
      const rows = roster.map((r) => [
        `"${r.name}"`,
        r.email,
        r.registrationDate,
        r.status === 'Checked in' ? 'YES' : 'NO',
        r.checkInTime || 'N/A',
        `"${r.badges.join(', ')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sheba-sponsor-report-${eventId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },

  // Public Search & Discovery
  search: {
    queryAll: async (term: string) => {
      const q = term.toLowerCase().trim();
      const allEvents = await api.events.getAll();
      const matchedEvents = q
        ? allEvents.filter(
            (e) =>
              e.title.toLowerCase().includes(q) ||
              e.description.toLowerCase().includes(q) ||
              e.location.toLowerCase().includes(q) ||
              (e.organizerName && e.organizerName.toLowerCase().includes(q))
          )
        : allEvents;

      return {
        events: matchedEvents,
        attendees: [],
      };
    },

    searchPublic: async (term: string) => {
      return api.search.queryAll(term);
    },
  },

  // Attendee GDPR Account Self-Service
  userAccount: {
    updateProfile: async (_userId: string, data: Partial<User>): Promise<User> => {
      const savedUserStr = localStorage.getItem('sheba_auth_user');
      let userObj = savedUserStr ? JSON.parse(savedUserStr) : null;
      if (userObj) {
        userObj = { ...userObj, ...data };
        localStorage.setItem('sheba_auth_user', JSON.stringify(userObj));
      }
      return userObj;
    },

    updateVisibility: async (_userId: string, visibility: ProfileVisibility): Promise<boolean> => {
      const savedUserStr = localStorage.getItem('sheba_auth_user');
      if (savedUserStr) {
        const userObj = JSON.parse(savedUserStr);
        userObj.visibility = visibility;
        localStorage.setItem('sheba_auth_user', JSON.stringify(userObj));
      }
      return true;
    },

    exportFullUserData: async (userId: string, format: 'json' | 'csv'): Promise<void> => {
      return api.userAccount.exportData(userId, format);
    },

    deleteAccount: async (_userId: string): Promise<boolean> => {
      try {
        await requestApi('/users/me', { method: 'DELETE' });
      } catch {
        // ignore
      }
      return true;
    },

    exportData: async (userId: string, format: 'json' | 'csv'): Promise<void> => {
      let content = '';
      let mimeType = 'application/json';
      let filename = `sheba-data-export-${userId}.json`;

      const userTickets = ticketsStore.filter((t) => t.attendeeId === userId);
      const userBadges = badgeAwardsStore.filter((b) => b.attendeeId === userId);

      if (format === 'json') {
        content = JSON.stringify(
          {
            userId,
            tickets: userTickets,
            badges: userBadges,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        );
      } else if (format === 'csv') {
        content =
          `Category,Record ID,Title/Name,Date,Details\n` +
          userTickets
            .map((t) => `Ticket,${t.id},"${t.eventTitle}","${t.eventDate}","${t.status}"`)
            .join('\n') +
          '\n' +
          userBadges
            .map((b) => `Badge,${b.id},"${b.badgeLabel} (${b.eventTitle})","${b.eventDate}","${b.issuerName}"`)
            .join('\n');
        mimeType = 'text/csv';
        filename = `sheba-data-export-${userId}.csv`;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },

  // Alias for userAccount
  get account() {
    return this.userAccount;
  },

  // Admin Oversight & Approvals
  admin: {
    getDashboard: async () => {
      const res = await requestApi('/admin/dashboard');
      return res.data;
    },

    getUsers: async () => {
      const res = await requestApi('/admin/users');
      return res.data;
    },

    approveOrganizer: async (userId: string) => {
      const res = await requestApi(`/admin/users/${userId}/approve`, {
        method: 'PATCH',
      });
      return res.data;
    },

    rejectOrganizer: async (userId: string) => {
      const res = await requestApi(`/admin/users/${userId}/reject`, {
        method: 'PATCH',
      });
      return res.data;
    },

    toggleUserStatus: async (userId: string) => {
      const res = await requestApi(`/admin/users/${userId}/status`, {
        method: 'PATCH',
      });
      return res.data;
    },

    getPaymentIssues: async () => {
      try {
        const res = await requestApi('/admin/payments');
        return res.data;
      } catch {
        return [];
      }
    },
  },
};
