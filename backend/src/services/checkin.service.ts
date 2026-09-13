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
        ci.id AS check_in_id,
        ci.approved_at AS check_in_time,
        ci.voided_at,
        t.id AS ticket_id,
        t.status AS ticket_status,
        COALESCE(
          json_agg(b.badge_code) FILTER (WHERE b.id IS NOT NULL AND b.revoked_at IS NULL),
          '[]'::json
        ) AS badges
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN check_ins ci ON ci.registration_id = r.id AND ci.voided_at IS NULL
      LEFT JOIN tickets t ON t.registration_id = r.id
      LEFT JOIN badge_awards b ON b.event_id = r.event_id AND b.user_id = u.id
      WHERE ${conditions.join(' AND ')}
      GROUP BY r.id, u.id, ci.id, t.id
      LIMIT 1
    `;

    const result = await query(queryTextStr, values);

    if (!result.rowCount || result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];
    const isCheckedIn = Boolean(row.check_in_id && !row.voided_at);

    return {
      id: row.attendee_id,
      registrationId: row.registration_id,
      attendeeId: row.attendee_id,
      name: row.name,
      email: row.email,
      registrationDate: new Date(row.registered_at).toISOString().split('T')[0],
      status: isCheckedIn ? 'Checked in' : 'Registered',
      isCheckedIn,
      checkInId: row.check_in_id || null,
      checkInTime: row.check_in_time
        ? new Date(row.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' EAT'
        : undefined,
      badges: row.badges || [],
      answers: typeof row.answers === 'string' ? JSON.parse(row.answers) : row.answers || {},
    };
  }

  static async markAttended(params: {
    eventId: string;
    attendeeId: string;
    approvedByOrganizerId: string;
    userRole?: UserRole;
  }) {
    const { eventId, attendeeId, approvedByOrganizerId, userRole } = params;

    const event = await EventService.getEventById(eventId);
    if (!event) {
      const err: any = new Error('Event not found.');
      err.statusCode = 404;
      throw err;
    }
    const realEventId = event.id;

    if (event.organizerId !== approvedByOrganizerId && userRole && userRole !== 'admin') {
      const err: any = new Error('Unauthorized. You are not the organizer of this event.');
      err.statusCode = 403;
      throw err;
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Fetch registration
      const regRes = await client.query(
        `SELECT id, user_id FROM registrations WHERE event_id = $1 AND user_id = $2 AND status = 'registered' FOR UPDATE`,
        [realEventId, attendeeId]
      );

      if (!regRes.rowCount || regRes.rowCount === 0) {
        const err: any = new Error('No active registration found for this attendee.');
        err.statusCode = 404;
        throw err;
      }

      const registration = regRes.rows[0];
      const now = new Date();

      // 2. Check if already has active check_in
      const existingCheckIn = await client.query(
        `SELECT id FROM check_ins WHERE registration_id = $1 AND voided_at IS NULL`,
        [registration.id]
      );

      let checkInId: string;
      if (existingCheckIn.rowCount && existingCheckIn.rowCount > 0) {
        checkInId = existingCheckIn.rows[0].id;
      } else {
        // Insert CheckIn row
        const ciRes = await client.query(
          `INSERT INTO check_ins (registration_id, event_id, user_id, approved_by, approved_at)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [registration.id, realEventId, attendeeId, approvedByOrganizerId, now]
        );
        checkInId = ciRes.rows[0].id;
      }

      // 3. Atomically award "Attended" badge (SRS Section 4 & 7.1)
      const badgeRes = await client.query(
        `INSERT INTO badge_awards (badge_code, badge_label, event_id, user_id, awarded_by, awarded_at)
         VALUES ('attended', 'Attended', $1, $2, $3, $4)
         ON CONFLICT (event_id, user_id, badge_code)
         DO UPDATE SET revoked_at = NULL, awarded_at = $4, revocation_reason = NULL
         RETURNING id, badge_code, badge_label, event_id, user_id, awarded_by, awarded_at`,
        [realEventId, attendeeId, approvedByOrganizerId, now]
      );

      // 4. Update ticket status if exists
      await client.query(
        `UPDATE tickets
         SET status = 'CHECKED_IN',
             checked_in_at = $1,
             checked_in_by = $2,
             updated_at = $1
         WHERE registration_id = $3`,
        [now, approvedByOrganizerId, registration.id]
      );

      await client.query('COMMIT');

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
        checkInId,
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

  static async undoCheckIn(params: {
    eventId: string;
    attendeeId: string;
    undoneByOrganizerId: string;
    userRole?: UserRole;
  }) {
    const { eventId, attendeeId, undoneByOrganizerId, userRole } = params;

    const event = await EventService.getEventById(eventId);
    if (!event) {
      const err: any = new Error('Event not found.');
      err.statusCode = 404;
      throw err;
    }
    const realEventId = event.id;

    if (event.organizerId !== undoneByOrganizerId && userRole && userRole !== 'admin') {
      const err: any = new Error('Unauthorized.');
      err.statusCode = 403;
      throw err;
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const now = new Date();

      // 1. Soft-void CheckIn row (set voided_at, do not hard delete)
      await client.query(
        `UPDATE check_ins
         SET voided_at = $1,
             voided_by = $2,
             updated_at = $1
         WHERE event_id = $3 AND user_id = $4 AND voided_at IS NULL`,
        [now, undoneByOrganizerId, realEventId, attendeeId]
      );

      // 2. Revoke Attended badge
      await client.query(
        `UPDATE badge_awards
         SET revoked_at = $1,
             revoked_by = $2,
             revocation_reason = 'Check-in undone by organizer',
             updated_at = $1
         WHERE event_id = $3 AND user_id = $4 AND badge_code = 'attended'`,
        [now, undoneByOrganizerId, realEventId, attendeeId]
      );

      // 3. Reset ticket status if exists
      await client.query(
        `UPDATE tickets
         SET status = 'ISSUED',
             checked_in_at = NULL,
             checked_in_by = NULL,
             updated_at = $1
         WHERE event_id = $2 AND user_id = $3`,
        [now, realEventId, attendeeId]
      );

      await client.query('COMMIT');

      const updatedAttendee = await this.lookupAttendee(realEventId, attendeeId);

      return {
        success: true,
        message: 'Check-in undone successfully.',
        rosterItem: updatedAttendee,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Backward compatibility alias for approveCheckIn
  static async approveCheckIn(params: {
    eventId: string;
    attendeeId: string;
    approvedByOrganizerId: string;
    userRole: UserRole;
  }) {
    return this.markAttended(params);
  }

  static async addManualAttendee(params: {
    eventId: string;
    organizerId: string;
    name: string;
    email: string;
    phone?: string;
    userRole?: UserRole;
  }) {
    const { eventId, organizerId, name, email, phone, userRole } = params;

    const event = await EventService.getEventById(eventId);
    if (!event) {
      const err: any = new Error('Event not found.');
      err.statusCode = 404;
      throw err;
    }
    const realEventId = event.id;

    if (event.organizerId !== organizerId && userRole && userRole !== 'admin') {
      const err: any = new Error('Unauthorized. You are not the organizer of this event.');
      err.statusCode = 403;
      throw err;
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const cleanPhone = phone?.trim() || null;

    if (!cleanName) {
      const err: any = new Error('Attendee name is required.');
      err.statusCode = 400;
      throw err;
    }
    if (!cleanEmail) {
      const err: any = new Error('Attendee email is required.');
      err.statusCode = 400;
      throw err;
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Find or create user
      let userId: string;
      const userLookup = await client.query('SELECT id, full_name, phone FROM users WHERE email = $1', [cleanEmail]);
      if (userLookup.rowCount && userLookup.rowCount > 0) {
        userId = userLookup.rows[0].id;
        if (cleanPhone && !userLookup.rows[0].phone) {
          await client.query('UPDATE users SET phone = $1, updated_at = NOW() WHERE id = $2', [cleanPhone, userId]);
        }
      } else {
        const dummyHash = '$2b$10$wT0o3q6/11fI0vL9fD9f1.xJ4Vb2c9P5lQ6kZ3eX4kL9wR4y7zT6e';
        const userInsert = await client.query(
          `INSERT INTO users (email, password_hash, full_name, role, phone, visibility, approval_status)
           VALUES ($1, $2, $3, 'attendee', $4, 'public', 'approved')
           RETURNING id`,
          [cleanEmail, dummyHash, cleanName, cleanPhone]
        );
        userId = userInsert.rows[0].id;
      }

      // 2. Find or create registration
      let registrationId: string;
      const regLookup = await client.query(
        `SELECT id FROM registrations WHERE event_id = $1 AND user_id = $2`,
        [realEventId, userId]
      );
      if (regLookup.rowCount && regLookup.rowCount > 0) {
        registrationId = regLookup.rows[0].id;
        await client.query(
          `UPDATE registrations SET status = 'registered', updated_at = NOW() WHERE id = $1`,
          [registrationId]
        );
      } else {
        const regInsert = await client.query(
          `INSERT INTO registrations (event_id, user_id, status, answers)
           VALUES ($1, $2, 'registered', $3)
           RETURNING id`,
          [realEventId, userId, JSON.stringify({ Phone: cleanPhone || 'N/A' })]
        );
        registrationId = regInsert.rows[0].id;
      }

      const now = new Date();

      // 3. Insert or update CheckIn row
      const checkInLookup = await client.query(
        `SELECT id FROM check_ins WHERE registration_id = $1`,
        [registrationId]
      );
      if (checkInLookup.rowCount && checkInLookup.rowCount > 0) {
        await client.query(
          `UPDATE check_ins SET voided_at = NULL, approved_by = $1, approved_at = $2, updated_at = $2 WHERE id = $3`,
          [organizerId, now, checkInLookup.rows[0].id]
        );
      } else {
        await client.query(
          `INSERT INTO check_ins (registration_id, event_id, user_id, approved_by, approved_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [registrationId, realEventId, userId, organizerId, now]
        );
      }

      // 4. Atomically award "Attended" badge
      await client.query(
        `INSERT INTO badge_awards (badge_code, badge_label, event_id, user_id, awarded_by, awarded_at)
         VALUES ('attended', 'Attended', $1, $2, $3, $4)
         ON CONFLICT (event_id, user_id, badge_code)
         DO UPDATE SET revoked_at = NULL, awarded_at = $4, revocation_reason = NULL`,
        [realEventId, userId, organizerId, now]
      );

      // 5. Create or update ticket
      const ticketLookup = await client.query(
        `SELECT id FROM tickets WHERE event_id = $1 AND user_id = $2`,
        [realEventId, userId]
      );
      if (ticketLookup.rowCount && ticketLookup.rowCount > 0) {
        await client.query(
          `UPDATE tickets SET status = 'CHECKED_IN', checked_in_at = $1, checked_in_by = $2, updated_at = $1 WHERE id = $3`,
          [now, organizerId, ticketLookup.rows[0].id]
        );
      } else {
        const ticketCode = `SHB-${Math.floor(1000 + Math.random() * 9000)}-2026`;
        await client.query(
          `INSERT INTO tickets (
            ticket_code, registration_id, event_id, user_id, qr_token, qr_code_data_url,
            status, checked_in_at, checked_in_by, is_paid, ticket_price, currency
          ) VALUES ($1, $2, $3, $4, $5, $6, 'CHECKED_IN', $7, $8, FALSE, 0, 'ETB')`,
          [ticketCode, registrationId, realEventId, userId, `shb_walkin_${Date.now()}`, '', now, organizerId]
        );
      }

      await client.query('COMMIT');

      const updatedAttendee = await this.lookupAttendee(realEventId, userId);

      return {
        success: true,
        message: `Successfully added ${cleanName} as an attended participant!`,
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
