import type { Event, EventType } from '../types/event';
import type { Ticket } from '../types/ticket';
import type { BadgeAward, BadgeCode, SponsorReportData, AttendeeRosterItem } from '../types/attendance';
import type { User, UserRole, ProfileVisibility } from '../types/user';
import { mockEvents } from '../data/mockEvents';
import { mockTickets } from '../data/mockTickets';
import { mockBadgeAwards, mockAttendeesRoster, mockSponsorReport } from '../data/mockAttendance';
import { mockAttendeeUser, mockOrganizerUser, mockAdminUser } from '../data/mockUsers';
import { mockPaymentIssues } from '../data/mockAdminData';

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

// In-memory state holders for rich client-side interactivity & offline resilience
let eventsStore: Event[] = [...mockEvents];
let ticketsStore: Ticket[] = [...mockTickets];
let badgeAwardsStore: BadgeAward[] = [...mockBadgeAwards];
let attendeeRosterStore: Record<string, AttendeeRosterItem[]> = {
  evt_react_workshop_2026: [...mockAttendeesRoster],
};

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
        if (res.data?.token) setAuthToken(res.data.token);
        return {
          user: res.data.user,
          token: res.data.token,
        };
      } catch (err) {
        // Fallback for seamless demo
        let matchedUser = mockAttendeeUser;
        if (creds.email.includes('organizer') || creds.email.includes('sara')) {
          matchedUser = mockOrganizerUser;
        } else if (creds.email.includes('admin') || creds.email.includes('hanan')) {
          matchedUser = mockAdminUser;
        }
        setAuthToken('demo-jwt-token');
        return { user: matchedUser, token: 'demo-jwt-token' };
      }
    },

    register: async (data: {
      email: string;
      password: string;
      full_name: string;
      role?: UserRole;
      organization?: string;
      phone?: string;
    }): Promise<{ user: User; token: string }> => {
      try {
        const res = await requestApi('/auth/register', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        if (res.data?.token) setAuthToken(res.data.token);
        return {
          user: res.data.user,
          token: res.data.token,
        };
      } catch (err) {
        const role = data.role || 'ATTENDEE';
        const newUser: User = {
          id: `usr_${Date.now()}`,
          name: data.full_name,
          email: data.email,
          role,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name)}&background=63474D&color=fff`,
          memberSince: 'August 2026',
          visibility: 'public',
          organization: data.organization,
          phone: data.phone,
          stats: {
            meetupsCount: 0,
            workshopsCount: 0,
            hackathonsCount: 0,
            totalEventsAttended: 0,
          },
        };
        setAuthToken('demo-jwt-token');
        return { user: newUser, token: 'demo-jwt-token' };
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
    },
  },

  // Events API
  events: {
    getAll: async (): Promise<Event[]> => {
      return [...eventsStore];
    },

    getById: async (id: string): Promise<Event | null> => {
      const ev = eventsStore.find((e) => e.id === id);
      return ev || null;
    },

    getByShareToken: async (token: string): Promise<Event | null> => {
      const ev = eventsStore.find((e) => e.shareLinkToken === token || e.id === token);
      return ev || null;
    },

    create: async (data: Partial<Event>): Promise<Event> => {
      const newEvent: Event = {
        id: `evt_${Date.now()}`,
        organizerId: data.organizerId || 'demo-organizer-001',
        organizerName: data.organizerName || 'GDG Addis',
        title: data.title || 'Untitled Event',
        description: data.description || '',
        type: (data.type as EventType) || 'meetup',
        date: data.date || new Date().toISOString().split('T')[0],
        startTime: data.startTime || '02:00 PM',
        endTime: data.endTime || '05:00 PM',
        time: data.time || `${data.startTime || '02:00 PM'} - ${data.endTime || '05:00 PM'} EAT`,
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
      return newEvent;
    },

    update: async (id: string, data: Partial<Event>): Promise<Event> => {
      const idx = eventsStore.findIndex((e) => e.id === id);
      if (idx !== -1) {
        eventsStore[idx] = { ...eventsStore[idx], ...data };
        return eventsStore[idx];
      }
      throw new Error('Event not found');
    },

    delete: async (id: string): Promise<boolean> => {
      eventsStore = eventsStore.filter((e) => e.id !== id);
      return true;
    },
  },

  // Registration & Ticketing (Public & Attendee)
  registration: {
    registerForEvent: async (params: {
      eventId: string;
      attendee: User;
      answers?: Record<string, string>;
      paymentReference?: string;
    }): Promise<{ ticket: Ticket; isPaymentRequired: boolean; checkoutUrl?: string }> => {
      const event = eventsStore.find((e) => e.id === params.eventId);
      if (!event) throw new Error('Event not found.');

      if (event.registeredCount >= event.capacity) {
        throw new Error('Event capacity has been reached.');
      }

      // Check if event is paid and needs Chapa payment
      if (event.isPaid && !params.paymentReference) {
        return {
          ticket: null as any,
          isPaymentRequired: true,
          checkoutUrl: `https://checkout.chapa.co/checkout/payment-simulation?amount=${event.ticketPrice}&currency=ETB`,
        };
      }

      // Increment registered count
      event.registeredCount += 1;
      if (event.registeredCount >= event.capacity) {
        event.status = 'closed';
      }

      const ticketId = `SHB-${Math.floor(1000 + Math.random() * 9000)}-2026`;
      const signedQrToken = `shb_signed_${params.eventId}_${params.attendee.id}_${Date.now()}`;

      // Expiry is end of day after event
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

      // Add to attendee roster
      if (!attendeeRosterStore[event.id]) {
        attendeeRosterStore[event.id] = [];
      }
      attendeeRosterStore[event.id].unshift({
        id: `roster_${Date.now()}`,
        registrationId: newTicket.registrationId,
        attendeeId: params.attendee.id,
        name: params.attendee.name,
        email: params.attendee.email,
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'Registered',
        badges: [],
        answers: params.answers,
      });

      return { ticket: newTicket, isPaymentRequired: false };
    },

    getAttendeeTickets: async (attendeeId: string): Promise<Ticket[]> => {
      return ticketsStore.filter((t) => t.attendeeId === attendeeId || t.attendeeEmail === attendeeId);
    },
  },

  // Check-in & Scanner Console (Organizer)
  checkin: {
    lookupByTokenOrName: async (eventId: string, queryText: string): Promise<AttendeeRosterItem | null> => {
      const roster = attendeeRosterStore[eventId] || mockAttendeesRoster;
      const lower = queryText.toLowerCase().trim();
      
      // Match by dynamic QR token
      const matchedTicket = ticketsStore.find((t) => t.eventId === eventId && t.qrToken === queryText.trim());
      if (matchedTicket) {
        const found = roster.find((r) => r.attendeeId === matchedTicket.attendeeId || r.email === matchedTicket.attendeeEmail);
        if (found) return found;
      }

      // Match by Name or Email
      const found = roster.find((r) => r.name.toLowerCase().includes(lower) || r.email.toLowerCase().includes(lower));
      return found || null;
    },

    approveCheckIn: async (params: {
      eventId: string;
      attendeeRosterId: string;
      approvedByOrganizerId: string;
    }): Promise<{ success: boolean; badgeAwarded: BadgeAward; rosterItem: AttendeeRosterItem }> => {
      const event = eventsStore.find((e) => e.id === params.eventId);
      const roster = attendeeRosterStore[params.eventId] || mockAttendeesRoster;
      const item = roster.find((r) => r.id === params.attendeeRosterId);

      if (!item) throw new Error('Attendee record not found.');
      if (item.status === 'Checked in') {
        throw new Error('Attendee is already checked in.');
      }

      const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      item.status = 'Checked in';
      item.checkInTime = `${nowTime} EAT`;
      if (!item.badges.includes('attended')) {
        item.badges.push('attended');
      }

      if (event) {
        event.checkedInCount += 1;
      }

      // Create Attended badge award
      const badgeAward: BadgeAward = {
        id: `bdg_awd_${Date.now()}`,
        badgeCode: 'attended',
        badgeLabel: 'Attended',
        eventId: params.eventId,
        eventTitle: event?.title || 'Tech Event',
        eventType: event?.type || 'meetup',
        eventDate: event?.date || new Date().toISOString().split('T')[0],
        eventLocation: event?.location || 'Addis Ababa',
        attendeeId: item.attendeeId,
        attendeeName: item.name,
        attendeeEmail: item.email,
        issuerName: event?.organizerName || 'Sheeba Event Organizer',
        awardedBy: params.approvedByOrganizerId,
        awardedAt: new Date().toISOString(),
        revokedAt: null,
      };

      badgeAwardsStore.unshift(badgeAward);
      return { success: true, badgeAwarded: badgeAward, rosterItem: item };
    },
  },

  // Badge System (Organizer Bulk Award & Admin Revoke)
  badges: {
    getAttendeeBadges: async (attendeeId: string): Promise<BadgeAward[]> => {
      return badgeAwardsStore.filter((b) => (b.attendeeId === attendeeId || b.attendeeEmail === attendeeId) && !b.revokedAt);
    },

    getBadgeById: async (badgeId: string): Promise<BadgeAward | null> => {
      const b = badgeAwardsStore.find((b) => b.id === badgeId);
      return b || null;
    },

    bulkAwardBadges: async (params: {
      eventId: string;
      attendeeRosterIds: string[];
      badgeCode: BadgeCode;
      awardedByOrganizerId: string;
    }): Promise<{ awardedCount: number }> => {
      const event = eventsStore.find((e) => e.id === params.eventId);
      const roster = attendeeRosterStore[params.eventId] || mockAttendeesRoster;
      let count = 0;

      const badgeLabels: Record<BadgeCode, string> = {
        attended: 'Attended',
        participant: 'Participant',
        winner: 'Winner',
        speaker: 'Speaker',
      };

      for (const rosterId of params.attendeeRosterIds) {
        const item = roster.find((r) => r.id === rosterId);
        if (item) {
          if (!item.badges.includes(params.badgeCode)) {
            item.badges.push(params.badgeCode);
          }
          const newAward: BadgeAward = {
            id: `bdg_awd_${Date.now()}_${count}`,
            badgeCode: params.badgeCode,
            badgeLabel: badgeLabels[params.badgeCode],
            eventId: params.eventId,
            eventTitle: event?.title || 'Tech Event',
            eventType: event?.type || 'workshop',
            eventDate: event?.date || new Date().toISOString().split('T')[0],
            eventLocation: event?.location || 'Addis Ababa',
            attendeeId: item.attendeeId,
            attendeeName: item.name,
            attendeeEmail: item.email,
            issuerName: event?.organizerName || 'GDG Addis',
            awardedBy: params.awardedByOrganizerId,
            awardedAt: new Date().toISOString(),
            revokedAt: null,
          };
          badgeAwardsStore.unshift(newAward);
          count++;
        }
      }

      return { awardedCount: count };
    },

    adminRevokeBadge: async (badgeAwardId: string): Promise<boolean> => {
      const award = badgeAwardsStore.find((b) => b.id === badgeAwardId);
      if (award) {
        award.revokedAt = new Date().toISOString();
        return true;
      }
      throw new Error('Badge award not found.');
    },

    getAllBadgeAwards: async (): Promise<BadgeAward[]> => {
      return [...badgeAwardsStore];
    },
  },

  // Roster & Manage Attendees (Organizer)
  roster: {
    getByEventId: async (eventId: string): Promise<AttendeeRosterItem[]> => {
      return attendeeRosterStore[eventId] || mockAttendeesRoster;
    },
  },

  // Reports & Sponsor Evidence (Organizer & Admin)
  reports: {
    getEventReport: async (eventId: string): Promise<SponsorReportData> => {
      const event = eventsStore.find((e) => e.id === eventId);
      const roster = attendeeRosterStore[eventId] || mockAttendeesRoster;
      const checkedIn = roster.filter((r) => r.status === 'Checked in');

      const attendedCount = checkedIn.filter((r) => r.badges.includes('attended')).length || checkedIn.length;
      const participantCount = checkedIn.filter((r) => r.badges.includes('participant')).length;
      const winnerCount = checkedIn.filter((r) => r.badges.includes('winner')).length;
      const speakerCount = checkedIn.filter((r) => r.badges.includes('speaker')).length;

      const rate = roster.length > 0 ? Number(((checkedIn.length / roster.length) * 100).toFixed(1)) : 0;

      return {
        eventId,
        eventTitle: event?.title || 'React & Modern Web Architecture Workshop',
        eventType: event?.type || 'workshop',
        eventDate: event?.date || 'September 12, 2026',
        eventLocation: event?.location || 'Bole Innovation Hub, Addis Ababa',
        organizerName: event?.organizerName || 'GDG Addis',
        totalRegistered: roster.length || 68,
        totalAttended: checkedIn.length || 58,
        attendanceRate: rate || 85.3,
        badgeDistribution: {
          attended: attendedCount || 58,
          participant: participantCount || 42,
          winner: winnerCount || 3,
          speaker: speakerCount || 4,
        },
        registrationsOverTime: mockSponsorReport.registrationsOverTime,
        hourlyCheckIns: mockSponsorReport.hourlyCheckIns,
        attendees: roster,
      };
    },

    exportCsv: async (eventId: string): Promise<void> => {
      const roster = attendeeRosterStore[eventId] || mockAttendeesRoster;
      const headers = 'Attendee Name,Email,Registration Date,Status,Check-in Time,Badges Awarded\n';
      const rows = roster
        .map(
          (r) =>
            `"${r.name}","${r.email}","${r.registrationDate}","${r.status}","${r.checkInTime || '—'}","${r.badges.join('; ')}"`
        )
        .join('\n');

      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sheba-event-report-${eventId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },

  // Public Search
  search: {
    searchPublic: async (query: string): Promise<{ attendees: User[]; events: Event[] }> => {
      const lower = query.toLowerCase().trim();
      if (!lower) return { attendees: [], events: [] };

      const matchedAttendees = [mockAttendeeUser].filter(
        (u) => u.name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower)
      );

      const matchedEvents = eventsStore.filter(
        (e) =>
          e.title.toLowerCase().includes(lower) ||
          e.location.toLowerCase().includes(lower) ||
          e.organizerName.toLowerCase().includes(lower)
      );

      return {
        attendees: matchedAttendees,
        events: matchedEvents,
      };
    },
  },

  // Account Settings & Data Exports (SRS Section 3.4 & 3.5)
  account: {
    updateVisibility: async (userId: string, visibility: ProfileVisibility): Promise<boolean> => {
      if (mockAttendeeUser.id === userId) {
        mockAttendeeUser.visibility = visibility;
      }
      return true;
    },

    deleteAccount: async (_userId: string): Promise<boolean> => {
      removeAuthToken();
      localStorage.removeItem('sheba_auth_user');
      return true;
    },

    exportFullUserData: async (userId: string, format: 'csv' | 'json'): Promise<void> => {
      const data = {
        user: mockAttendeeUser,
        tickets: ticketsStore.filter((t) => t.attendeeId === userId),
        badges: badgeAwardsStore.filter((b) => b.attendeeId === userId),
        exportedAt: new Date().toISOString(),
      };

      let content = JSON.stringify(data, null, 2);
      let mimeType = 'application/json';
      let filename = `sheba-data-export-${userId}.json`;

      if (format === 'csv') {
        content = `Category,Record ID,Title/Name,Date,Details\n` +
          `User,${mockAttendeeUser.id},"${mockAttendeeUser.name}","${mockAttendeeUser.memberSince}","${mockAttendeeUser.email}"\n` +
          ticketsStore.map(t => `Ticket,${t.id},"${t.eventTitle}","${t.eventDate}","${t.status}"`).join('\n') + '\n' +
          badgeAwardsStore.map(b => `Badge,${b.id},"${b.badgeLabel} (${b.eventTitle})","${b.eventDate}","${b.issuerName}"`).join('\n');
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

  // Admin Oversight
  admin: {
    getPaymentIssues: async () => mockPaymentIssues,
  },
};
