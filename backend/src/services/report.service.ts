import { query } from '../config/db';
import { UserRole, SponsorReportData } from '../types';
import { EventService } from './event.service';

export class ReportService {
  static async getEventReport(eventId: string, userId?: string, userRole?: UserRole): Promise<SponsorReportData> {
    const event = await EventService.getEventById(eventId);
    if (!event) {
      const err: any = new Error('Event not found.');
      err.statusCode = 404;
      throw err;
    }

    if (userId && userRole && event.organizerId !== userId && userRole !== 'admin') {
      const err: any = new Error('Forbidden. You are not authorized to view reports for this event.');
      err.statusCode = 403;
      throw err;
    }

    // 1. Roster and Badges
    const roster = await EventService.getEventRoster(event.id);
    const checkedIn = roster.filter((r) => r.status === 'Checked in');

    // 2. Badge breakdown
    const badgesRes = await query(
      `SELECT badge_code, COUNT(*)::INTEGER AS count
       FROM badge_awards
       WHERE event_id = $1 AND revoked_at IS NULL
       GROUP BY badge_code`,
      [event.id]
    );

    const badgeCounts: Record<string, number> = {
      attended: 0,
      participant: 0,
      winner: 0,
      speaker: 0,
    };

    for (const b of badgesRes.rows) {
      badgeCounts[b.badge_code] = parseInt(b.count, 10);
    }

    // Ensure attended badge matches checked in if none recorded
    if (badgeCounts.attended === 0 && checkedIn.length > 0) {
      badgeCounts.attended = checkedIn.length;
    }

    // 3. Registrations over time (velocity)
    const velocityRes = await query(
      `SELECT 
        TO_CHAR(registered_at, 'Mon DD') AS reg_date,
        COUNT(*)::INTEGER AS count
       FROM registrations
       WHERE event_id = $1 AND status = 'registered'
       GROUP BY reg_date, DATE_TRUNC('day', registered_at)
       ORDER BY DATE_TRUNC('day', registered_at) ASC`,
      [event.id]
    );

    const registrationsOverTime = velocityRes.rows.length > 0
      ? velocityRes.rows.map((r) => ({ date: r.reg_date, count: parseInt(r.count, 10) }))
      : [{ date: event.date, count: roster.length || 1 }];

    // 4. Hourly check-in distribution
    const hourlyRes = await query(
      `SELECT 
        TO_CHAR(checked_in_at, 'HH12:00 AM') AS checkin_hour,
        COUNT(*)::INTEGER AS count
       FROM tickets
       WHERE event_id = $1 AND status = 'CHECKED_IN' AND checked_in_at IS NOT NULL
       GROUP BY checkin_hour
       ORDER BY checkin_hour ASC`,
      [event.id]
    );

    const hourlyCheckIns = hourlyRes.rows.map((h) => ({
      hour: h.checkin_hour,
      count: parseInt(h.count, 10),
    }));

    const attendanceRate = roster.length > 0
      ? parseFloat(((checkedIn.length / roster.length) * 100).toFixed(1))
      : 0;

    return {
      eventId: event.id,
      eventTitle: event.title,
      eventType: event.type,
      eventDate: event.date,
      eventLocation: event.location,
      organizerName: event.organizerName,
      totalRegistered: roster.length,
      totalAttended: checkedIn.length,
      attendanceRate,
      badgeDistribution: {
        attended: badgeCounts.attended,
        participant: badgeCounts.participant,
        winner: badgeCounts.winner,
        speaker: badgeCounts.speaker,
      },
      registrationsOverTime,
      hourlyCheckIns,
      attendees: roster,
    };
  }

  static async exportEventReportCsv(
    eventId: string,
    userId?: string,
    userRole?: UserRole
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
      'Registration Date',
      'Status',
      'Check-in Time',
      'Badges Awarded',
    ];

    const rows = report.attendees.map((a) => {
      return [
        escapeCsv(a.name),
        escapeCsv(a.email),
        escapeCsv(a.registrationDate),
        escapeCsv(a.status),
        escapeCsv(a.checkInTime || '—'),
        escapeCsv(a.badges.join('; ')),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const safeTitle = report.eventTitle.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const filename = `sheba_sponsor_report_${safeTitle}_${new Date().toISOString().slice(0, 10)}.csv`;

    return { filename, csvContent };
  }
}
