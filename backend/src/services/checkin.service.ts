import { getClient, query } from '../config/db';
import { verifyTicketToken } from '../utils/qr.util';
import { UserRole } from '../types';
import { BadgeService } from './badge.service';
import { EventService } from './event.service';

export class CheckinService {
  static async lookupAttendee(eventIdOrToken: string, queryText: string) {
    const event = await EventService.getEventById(eventIdOrToken);
    if (!event) return null;
    const realEventId = event.id;

    const isToken = queryText.startsWith('eyJ') || queryText.includes('shb_');
    let targetUserId: string | null = null;
    let targetTicketId: string | null = null;

    if (isToken) {
      try {
        const payload = verifyTicketToken(queryText.trim());
        targetUserId = payload.userId;
        targetTicketId = payload.ticketId;
      } catch {
        const tRes = await query('SELECT user_id, id FROM tickets WHERE event_id = $1 AND qr_token = $2', [realEventId, queryText.trim()]);
        if (tRes.rowCount && tRes.rowCount > 0) {
          targetUserId = tRes.rows[0].user_id;
          targetTicketId = tRes.rows[0].id;
        }
      }
    }

    const conditions: string[] = ['r.event_id = $1', "r.status = 'registered'"];
    const values: any[] = [realEventId];

    if (targetUserId) {
      conditions.push('u.id = $2');
      values.push(targetUserId);
    } else {
      conditions.push('(u.full_name ILIKE $2 OR u.email ILIKE $2)');
      values.push(`%${queryText.trim()}%`);
    }

    const queryTextStr = `
      SELECT 
        r.id AS registration_id,
        u.id AS attendee_id,
        u.full_name AS name,
        u.email,
        r.registered_at,
        r.answers,
        t.id AS ticket_id,
        t.status AS ticket_status,
        t.checked_in_at,
        COALESCE(
          json_agg(b.badge_code) FILTER (WHERE b.id IS NOT NULL AND b.revoked_at IS NULL),
          '[]'::json
        ) AS badges
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN tickets t ON t.registration_id = r.id
      LEFT JOIN badge_awards b ON b.event_id = r.event_id AND b.user_id = u.id
      WHERE ${conditions.join(' AND ')}
      GROUP BY r.id, u.id, t.id
      LIMIT 1
    `;

    const result = await query(queryTextStr, values);

    if (!result.rowCount || result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.attendee_id,
      registrationId: row.registration_id,
      attendeeId: row.attendee_id,
      name: row.name,
      email: row.email,
      registrationDate: new Date(row.registered_at).toISOString().split('T')[0],
      status: row.ticket_status === 'CHECKED_IN' ? 'Checked in' : 'Registered',
      checkInTime: row.checked_in_at
        ? new Date(row.checked_in_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' EAT'
        : undefined,
      badges: row.badges || [],
      answers: typeof row.answers === 'string' ? JSON.parse(row.answers) : row.answers || {},
    };
  }

  static async approveCheckIn(params: {
    eventId: string;
    attendeeId: string;
    approvedByOrganizerId: string;
    userRole: UserRole;
  }) {
    const { eventId, attendeeId, approvedByOrganizerId, userRole } = params;

    const event = await EventService.getEventById(eventId);
    if (!event) {
      const err: any = new Error('Event not found.');
      err.statusCode = 404;
      throw err;
    }
    const realEventId = event.id;

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Verify organizer permissions
      if (event.organizerId !== approvedByOrganizerId && userRole !== 'admin') {
        const err: any = new Error('Unauthorized. You are not the organizer of this event.');
        err.statusCode = 403;
        throw err;
      }

      // 2. Fetch attendee ticket
      const ticketRes = await client.query(
        'SELECT * FROM tickets WHERE event_id = $1 AND user_id = $2 FOR UPDATE',
        [realEventId, attendeeId]
      );

      if (!ticketRes.rowCount || ticketRes.rowCount === 0) {
        const err: any = new Error('Attendee ticket not found for this event.');
        err.statusCode = 404;
        throw err;
      }

      const ticket = ticketRes.rows[0];
      if (ticket.status === 'CHECKED_IN') {
        const err: any = new Error('Attendee is already checked in.');
        err.statusCode = 409;
        throw err;
      }

      // 3. Mark ticket checked in
      const now = new Date();
      await client.query(
        `UPDATE tickets
         SET status = 'CHECKED_IN',
             checked_in_at = $1,
             checked_in_by = $2,
             updated_at = $1
         WHERE id = $3`,
        [now, approvedByOrganizerId, ticket.id]
      );

      // 4. Automatically award "Attended" badge (SRS Section 6.5 & 7.1)
      const badgeRes = await client.query(
        `INSERT INTO badge_awards (badge_code, badge_label, event_id, user_id, awarded_by, awarded_at)
         VALUES ('attended', 'Attended', $1, $2, $3, $4)
         ON CONFLICT (event_id, user_id, badge_code) 
         DO UPDATE SET revoked_at = NULL, awarded_at = $4
         RETURNING id, badge_code, badge_label, event_id, user_id, awarded_by, awarded_at`,
        [realEventId, attendeeId, approvedByOrganizerId, now]
      );

      await client.query('COMMIT');

      // 5. Fetch updated attendee roster item
      const updatedAttendee = await this.lookupAttendee(realEventId, attendeeId);
      const rawBadge = badgeRes.rows[0];

      const badgeAwarded = BadgeService.formatBadge({
        ...rawBadge,
        event_title: event.title,
        event_type: event.type,
        event_date: event.date,
        event_location: event.location,
        attendee_name: updatedAttendee?.name,
        attendee_email: updatedAttendee?.email,
        issuer_name: event.venueName || event.organizerName || 'GDG Addis',
      });

      return {
        success: true,
        badgeAwarded,
        rosterItem: updatedAttendee,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
