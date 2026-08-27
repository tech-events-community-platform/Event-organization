import { query } from '../config/db';
import { UserRole } from '../types';

export class ReportService {
  static async getEventReport(eventId: string, userId: string, userRole: UserRole) {
    // 1. Verify organizer ownership
    const eventRes = await query(
      `SELECT e.*, u.full_name AS organizer_name, u.email AS organizer_email, u.organization AS organizer_organization
       FROM events e
       JOIN users u ON e.organizer_id = u.id
       WHERE e.id = $1`,
      [eventId]
    );

    if (!eventRes.rowCount || eventRes.rowCount === 0) {
      const err: any = new Error('Event not found.');
      err.statusCode = 404;
      throw err;
    }

    const event = eventRes.rows[0];

    if (event.organizer_id !== userId && userRole !== 'admin') {
      const err: any = new Error('Forbidden. You are not authorized to view reports for this event.');
      err.statusCode = 403;
      throw err;
    }

    // 2. Aggregate counts
    const statsRes = await query(
      `SELECT 
        (SELECT COUNT(*)::INTEGER FROM registrations WHERE event_id = $1 AND status = 'registered') AS total_registered,
        (SELECT COUNT(*)::INTEGER FROM registrations WHERE event_id = $1 AND status = 'cancelled') AS total_cancelled,
        (SELECT COUNT(*)::INTEGER FROM tickets WHERE event_id = $1 AND status = 'CHECKED_IN') AS total_checked_in
      `,
      [eventId]
    );

    const stats = statsRes.rows[0];
    const totalRegistered = stats.total_registered;
    const totalCheckedIn = stats.total_checked_in;
    const totalCancelled = stats.total_cancelled;
    const attendanceRate = totalRegistered > 0
      ? Math.round((totalCheckedIn / totalRegistered) * 10000) / 100
      : 0;

    // 3. Hourly Check-in Breakdown
    const hourlyRes = await query(
      `SELECT 
        TO_CHAR(DATE_TRUNC('hour', checked_in_at), 'YYYY-MM-DD HH24:00') AS hour_interval,
        COUNT(*)::INTEGER AS count
       FROM tickets
       WHERE event_id = $1 AND status = 'CHECKED_IN' AND checked_in_at IS NOT NULL
       GROUP BY hour_interval
       ORDER BY hour_interval ASC`,
      [eventId]
    );

    // 4. Attendee List with Check-in Info
    const attendeesRes = await query(
      `SELECT 
        u.id AS user_id,
        u.full_name,
        u.email,
        u.phone,
        u.organization,
        r.id AS registration_id,
        r.status AS registration_status,
        r.registered_at,
        t.id AS ticket_id,
        t.status AS ticket_status,
        t.checked_in_at
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN tickets t ON r.id = t.registration_id
       WHERE r.event_id = $1
       ORDER BY r.registered_at DESC`,
      [eventId]
    );

    return {
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        event_date: event.event_date,
        location: event.location,
        capacity: event.capacity,
        status: event.status,
        organizer: {
          name: event.organizer_name,
          email: event.organizer_email,
          organization: event.organizer_organization,
        },
      },
      summary: {
        capacity: event.capacity,
        total_registered: totalRegistered,
        total_checked_in: totalCheckedIn,
        total_cancelled: totalCancelled,
        remaining_capacity: Math.max(0, event.capacity - totalRegistered),
        attendance_rate_percentage: attendanceRate,
      },
      hourly_checkins: hourlyRes.rows,
      attendees: attendeesRes.rows,
    };
  }

  static async exportEventReportCsv(
    eventId: string,
    userId: string,
    userRole: UserRole
  ): Promise<{ filename: string; csvContent: string }> {
    const report = await this.getEventReport(eventId, userId, userRole);

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const headers = [
      'Attendee Name',
      'Email',
      'Phone',
      'Organization',
      'Registration Status',
      'Registered At',
      'Attendance Status',
      'Checked-In At',
    ];

    const rows = report.attendees.map((a: any) => {
      return [
        escapeCsv(a.full_name),
        escapeCsv(a.email),
        escapeCsv(a.phone || 'N/A'),
        escapeCsv(a.organization || 'N/A'),
        escapeCsv(a.registration_status),
        escapeCsv(a.registered_at ? new Date(a.registered_at).toISOString() : 'N/A'),
        escapeCsv(a.ticket_status === 'CHECKED_IN' ? 'CHECKED IN' : a.ticket_status || 'NOT ISSUED'),
        escapeCsv(a.checked_in_at ? new Date(a.checked_in_at).toISOString() : 'N/A'),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const safeTitle = report.event.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const filename = `sheba_attendance_report_${safeTitle}_${new Date().toISOString().slice(0, 10)}.csv`;

    return { filename, csvContent };
  }
}

