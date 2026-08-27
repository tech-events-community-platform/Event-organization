import type { Event, EventStatus } from '../types/event';
import type { Ticket } from '../types/ticket';
import type { VerifiedAttendance, SponsorReportData } from '../types/attendance';
import type { User, UserRole } from '../types/user';

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

// Generic HTTP Request Handler
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

// Data Model Transformers
export const transformUser = (raw: any): User => {
  if (!raw) {
    return {
      id: '',
      name: 'Guest User',
      telegramHandle: '@guest',
      role: 'ATTENDEE',
      memberSince: '2026',
    };
  }

  const roleStr = raw.role ? raw.role.toUpperCase() : 'ATTENDEE';
  let mappedRole: UserRole = 'ATTENDEE';
  if (roleStr === 'ORGANIZER') mappedRole = 'ORGANIZER';
  else if (roleStr === 'ADMIN') mappedRole = 'ADMIN';

  return {
    id: raw.id,
    name: raw.full_name || raw.name || 'User',
    email: raw.email,
    phone: raw.phone,
    organization: raw.organization,
    telegramHandle: raw.phone || raw.email || '@user',
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(raw.full_name || 'User')}&background=0D8ABC&color=fff`,
    role: mappedRole,
    memberSince: raw.created_at ? new Date(raw.created_at).getFullYear().toString() : '2026',
    bio: raw.bio || '',
  };
};

export const transformEvent = (raw: any): Event => {
  const eventDateObj = raw.event_date ? new Date(raw.event_date) : new Date();
  const endDateObj = raw.end_date ? new Date(raw.end_date) : null;

  const startTimeStr = eventDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTimeStr = endDateObj ? endDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const timeStr = endTimeStr ? `${startTimeStr} - ${endTimeStr}` : `${startTimeStr} EAT`;

  let mappedStatus: EventStatus = 'Upcoming';
  if (raw.status === 'completed') mappedStatus = 'Completed';
  else if (raw.status === 'draft' || raw.status === 'cancelled') mappedStatus = 'Draft';
  else mappedStatus = 'Upcoming';

  return {
    id: raw.id,
    title: raw.title || 'Untitled Event',
    organizer: {
      id: raw.organizer_id || 'org_unknown',
      name: raw.organizer_organization || raw.organizer_name || 'Event Organizer',
      verified: true,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(raw.organizer_organization || raw.organizer_name || 'Org')}&background=6366F1&color=fff`,
    },
    date: raw.event_date ? raw.event_date.split('T')[0] : new Date().toISOString().split('T')[0],
    time: timeStr,
    location: raw.location || 'Addis Ababa',
    venueName: raw.location ? raw.location.split(',')[0] : 'Venue Location',
    category: (raw.category as any) || 'Technology',
    description: raw.description || '',
    capacity: Number(raw.capacity) || 100,
    registeredCount: Number(raw.registered_count ?? raw.registeredCount ?? 0),
    checkedInCount: Number(raw.checked_in_count ?? raw.checkedInCount ?? 0),
    status: mappedStatus,
    bannerUrl: raw.banner_url || raw.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    whatToKnow: [
      'Verified QR ticket check-in required at venue entry.',
      'Open for tech leaders, community developers, and attendees.',
      'Interactive sessions and verified participation badge issued.'
    ],
    skillsFocus: [raw.category || 'Tech Community'],
    isFeatured: true,
  };
};

export const transformTicket = (raw: any): Ticket => {
  let mappedStatus: any = 'Valid';
  if (raw.status === 'CHECKED_IN') mappedStatus = 'Checked in';
  else if (raw.status === 'CANCELLED') mappedStatus = 'Cancelled';
  else if (raw.status === 'EXPIRED') mappedStatus = 'Expired';
  else mappedStatus = 'Valid';

  const eventDateObj = raw.event_date ? new Date(raw.event_date) : new Date();

  return {
    id: raw.id || `SHB-${raw.registration_id ? raw.registration_id.slice(0, 4) : 'TICKET'}`,
    eventId: raw.event_id,
    userId: raw.user_id,
    attendeeName: raw.attendee_name || 'Attendee',
    telegramHandle: raw.attendee_email || '@attendee',
    eventTitle: raw.event_title || 'Sheba Verified Event',
    eventDate: raw.event_date ? raw.event_date.split('T')[0] : '',
    eventTime: eventDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    eventLocation: raw.event_location || 'Addis Ababa',
    status: mappedStatus,
    issuedAt: raw.created_at || new Date().toISOString(),
    checkedInAt: raw.checked_in_at || undefined,
    qrPayload: raw.qr_token || raw.id,
    qrCodeDataUrl: raw.qr_code_data_url || undefined,
  };
};

export const transformAttendance = (raw: any): VerifiedAttendance => {
  return {
    id: raw.ticket_id || raw.registration_id || `att_${Math.random()}`,
    eventId: raw.event_id,
    eventTitle: raw.event_title || 'Sheba Event',
    eventDate: raw.event_date ? raw.event_date.split('T')[0] : '',
    organizerName: raw.organizer_name || 'Verified Organizer',
    attendeeId: raw.user_id || '',
    attendeeName: raw.attendee_name || 'Attendee',
    telegramHandle: raw.attendee_email || '',
    verifiedAt: raw.checked_in_at || raw.registered_at || new Date().toISOString(),
    status: raw.ticket_status === 'CHECKED_IN' ? 'Checked in' : 'Registered',
    checkInTime: raw.checked_in_at ? new Date(raw.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
  };
};

export const transformReport = (raw: any): SponsorReportData => {
  const event = raw.event || {};
  const summary = raw.summary || {};

  const hourly = (raw.hourly_checkins || []).map((item: any) => ({
    time: item.hour_interval ? item.hour_interval.split(' ')[1] || item.hour_interval : '09:00',
    count: Number(item.count || 0),
  }));

  return {
    eventId: event.id || '',
    eventTitle: event.title || 'Event Attendance Report',
    eventDate: event.event_date ? event.event_date.split('T')[0] : '',
    organizerName: event.organizer?.name || event.organizer?.organization || 'Organizer',
    totalRegistered: Number(summary.total_registered || 0),
    totalAttended: Number(summary.total_checked_in || 0),
    attendanceRate: Number(summary.attendance_rate_percentage || 0),
    hourlyCheckIns: hourly,
    selfReportedSkills: [
      { skill: 'Verified Attendance', count: Number(summary.total_checked_in || 0), percentage: 100 },
    ],
    attendees: raw.attendees || [],
  };
};

// Clean Real API Layer
export const api = {
  // Authentication
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const res = await requestApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (res.data?.token) {
        setAuthToken(res.data.token);
      }
      return {
        user: transformUser(res.data?.user),
        token: res.data?.token,
      };
    },

    register: async (userData: {
      email: string;
      password: string;
      full_name: string;
      role?: string;
      phone?: string;
      bio?: string;
      organization?: string;
    }) => {
      const res = await requestApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...userData,
          role: (userData.role || 'attendee').toLowerCase(),
        }),
      });
      if (res.data?.token) {
        setAuthToken(res.data.token);
      }
      return {
        user: transformUser(res.data?.user),
        token: res.data?.token,
      };
    },

    getMe: async (): Promise<User | null> => {
      try {
        const res = await requestApi('/auth/me');
        return transformUser(res.data);
      } catch {
        removeAuthToken();
        return null;
      }
    },

    logout: async (): Promise<void> => {
      try {
        await requestApi('/auth/logout', { method: 'POST' });
      } catch {
        // Ignore network errors on logout
      } finally {
        removeAuthToken();
      }
    },
  },

  // Events
  events: {
    getAll: async (params?: {
      search?: string;
      category?: string;
      status?: string;
      organizerId?: string;
      upcomingOnly?: boolean;
    }): Promise<Event[]> => {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category && params.category !== 'All') queryParams.append('category', params.category);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.organizerId) queryParams.append('organizerId', params.organizerId);
      if (params?.upcomingOnly) queryParams.append('upcomingOnly', 'true');

      const path = `/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await requestApi(path);
      return (res.data || []).map(transformEvent);
    },

    getById: async (id: string): Promise<Event> => {
      const res = await requestApi(`/events/${id}`);
      return transformEvent(res.data);
    },

    create: async (eventData: Partial<Event>): Promise<Event> => {
      const payload = {
        title: eventData.title,
        description: eventData.description,
        category: eventData.category || 'General',
        event_date: eventData.date ? new Date(eventData.date).toISOString() : new Date().toISOString(),
        location: eventData.location || eventData.venueName || 'Addis Ababa',
        capacity: Number(eventData.capacity) || 100,
        banner_url: eventData.bannerUrl,
        status: eventData.status === 'Draft' ? 'draft' : 'published',
      };

      const res = await requestApi('/events', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return transformEvent(res.data);
    },

    update: async (id: string, eventData: Partial<Event>): Promise<Event> => {
      const payload: any = {};
      if (eventData.title !== undefined) payload.title = eventData.title;
      if (eventData.description !== undefined) payload.description = eventData.description;
      if (eventData.category !== undefined) payload.category = eventData.category;
      if (eventData.date !== undefined) payload.event_date = new Date(eventData.date).toISOString();
      if (eventData.location !== undefined) payload.location = eventData.location;
      if (eventData.capacity !== undefined) payload.capacity = Number(eventData.capacity);
      if (eventData.bannerUrl !== undefined) payload.banner_url = eventData.bannerUrl;
      if (eventData.status !== undefined) {
        payload.status = eventData.status === 'Draft' ? 'draft' : 'published';
      }

      const res = await requestApi(`/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      return transformEvent(res.data);
    },

    delete: async (id: string): Promise<void> => {
      await requestApi(`/events/${id}`, { method: 'DELETE' });
    },

    register: async (eventId: string): Promise<{ registrationId: string; ticket: Ticket }> => {
      const res = await requestApi(`/events/${eventId}/register`, { method: 'POST' });
      return {
        registrationId: res.data?.registration_id,
        ticket: transformTicket(res.data?.ticket),
      };
    },

    getRegistration: async (eventId: string) => {
      const res = await requestApi(`/events/${eventId}/registration`);
      return res.data;
    },

    cancelRegistration: async (eventId: string) => {
      const res = await requestApi(`/events/${eventId}/register`, { method: 'DELETE' });
      return res;
    },
  },

  // Tickets
  tickets: {
    getForEvent: async (eventId: string): Promise<Ticket> => {
      const res = await requestApi(`/tickets/${eventId}`);
      return transformTicket(res.data);
    },
  },

  // Check-In
  checkin: {
    verify: async (qrToken: string, eventId?: string): Promise<{
      result: 'SUCCESS' | 'DUPLICATE' | 'INVALID';
      message: string;
      ticket?: any;
      attendee?: any;
    }> => {
      try {
        const res = await requestApi('/checkin/verify', {
          method: 'POST',
          body: JSON.stringify({ qr_token: qrToken, event_id: eventId }),
        });
        return {
          result: 'SUCCESS',
          message: res.message || 'Check-in verified successfully!',
          ticket: res.data?.ticket,
          attendee: res.data?.attendee,
        };
      } catch (err: any) {
        if (err.status === 409 || err.data?.error === 'ALREADY_CHECKED_IN') {
          return {
            result: 'DUPLICATE',
            message: err.message || 'Already checked in!',
            attendee: err.data?.data?.attendee,
          };
        }
        return {
          result: 'INVALID',
          message: err.message || 'Invalid or expired QR ticket token.',
        };
      }
    },
  },

  // Reports
  reports: {
    getEventReport: async (eventId: string): Promise<SponsorReportData> => {
      const res = await requestApi(`/reports/events/${eventId}`);
      return transformReport(res.data);
    },

    exportCsv: async (eventId: string): Promise<void> => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/reports/events/${eventId}/export`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to export CSV report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sheba_attendance_report_${eventId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
  },

  // User Profile & Attendance History
  users: {
    getProfile: async (): Promise<User> => {
      const res = await requestApi('/users/me');
      return transformUser(res.data);
    },

    updateProfile: async (data: {
      full_name?: string;
      phone?: string;
      bio?: string;
      organization?: string;
    }): Promise<User> => {
      const res = await requestApi('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return transformUser(res.data);
    },

    getAttendanceHistory: async (): Promise<VerifiedAttendance[]> => {
      const res = await requestApi('/users/me/attendance');
      return (res.data || []).map(transformAttendance);
    },
  },

  // Backward-compatible Top Level Methods used across existing components
  getEvents: async (): Promise<Event[]> => {
    return api.events.getAll();
  },

  getEventById: async (id: string): Promise<Event | undefined> => {
    try {
      return await api.events.getById(id);
    } catch {
      return undefined;
    }
  },

  createEvent: async (eventData: Omit<Event, 'id' | 'registeredCount' | 'checkedInCount' | 'organizer'>): Promise<Event> => {
    return api.events.create(eventData);
  },

  getTickets: async (): Promise<Ticket[]> => {
    try {
      const history = await api.users.getAttendanceHistory();
      return history.map((h) => ({
        id: h.id,
        eventId: h.eventId,
        userId: h.attendeeId,
        attendeeName: h.attendeeName,
        telegramHandle: h.telegramHandle,
        eventTitle: h.eventTitle,
        eventDate: h.eventDate,
        eventTime: h.checkInTime || '09:00 AM',
        eventLocation: 'Addis Ababa',
        status: h.status === 'Checked in' ? 'Checked in' : 'Valid',
        issuedAt: h.verifiedAt,
        checkedInAt: h.checkInTime,
        qrPayload: h.id,
      }));
    } catch {
      return [];
    }
  },

  getTicketForEvent: async (eventId: string, _userId?: string): Promise<Ticket | undefined> => {
    try {
      return await api.tickets.getForEvent(eventId);
    } catch {
      return undefined;
    }
  },

  registerForEvent: async (eventId: string, _userId?: string, _userName?: string, _telegramHandle?: string): Promise<Ticket> => {
    const res = await api.events.register(eventId);
    return res.ticket;
  },

  verifyTicketQR: async (qrPayload: string, eventId?: string): Promise<{
    result: 'SUCCESS' | 'DUPLICATE' | 'INVALID';
    message: string;
    ticket?: Ticket;
  }> => {
    const res = await api.checkin.verify(qrPayload, eventId);
    return {
      result: res.result,
      message: res.message,
      ticket: res.ticket ? transformTicket(res.ticket) : undefined,
    };
  },

  getAttendanceHistory: async (_userId?: string): Promise<VerifiedAttendance[]> => {
    return api.users.getAttendanceHistory();
  },

  getSponsorReport: async (eventId: string): Promise<SponsorReportData> => {
    try {
      return await api.reports.getEventReport(eventId);
    } catch {
      return {
        eventId,
        eventTitle: 'Event Report',
        eventDate: new Date().toISOString().split('T')[0],
        organizerName: 'Organizer',
        totalRegistered: 0,
        totalAttended: 0,
        attendanceRate: 0,
        hourlyCheckIns: [],
        selfReportedSkills: [],
      };
    }
  },

  // Admin fallbacks (backend lacks admin user/organizer listing routes)
  getAdminUsers: async () => [],
  toggleUserStatus: async (_userId?: string) => [],
  getAdminOrganizers: async () => [],
  toggleOrganizerStatus: async (_orgId?: string) => [],
  getAdminActivity: async () => [],
  updateEventStatus: async (eventId: string, status: EventStatus) => {
    return api.events.update(eventId, { status });
  },
};
