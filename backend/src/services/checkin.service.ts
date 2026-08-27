import { getClient, query } from '../config/db';
import { verifyTicketToken } from '../utils/qr.util';
import { UserRole } from '../types';

export class CheckinService {
  static async verifyAndCheckIn(
    qrToken: string,
    scannedByUserId: string,
    userRole: UserRole,
    targetEventId?: string
  ) {
    // 1. Verify cryptographic signature of the QR token
    let payload;
    try {
      payload = verifyTicketToken(qrToken);
    } catch (error: any) {
      const err: any = new Error('Invalid or corrupted QR ticket token.');
      err.statusCode = 400;
      throw err;
    }

    const { ticketId, eventId, userId } = payload;

    // If organizer specified a specific event to check against
    if (targetEventId && targetEventId !== eventId) {
      const err: any = new Error('QR ticket is not for this event.');
      err.statusCode = 400;
      throw err;
    }

    const client = await getClient();

    try {
      await client.query('BEGIN');

      // 2. Lock ticket record for check-in to guarantee atomicity and duplicate protection
      const ticketRes = await client.query(
        `SELECT 
          t.*,
          e.title AS event_title,
          e.organizer_id,
          e.event_date,
          e.location AS event_location,
          e.status AS event_status,
          u.full_name AS attendee_name,
          u.email AS attendee_email,
          u.phone AS attendee_phone,
          u.organization AS attendee_organization
         FROM tickets t
         JOIN events e ON t.event_id = e.id
         JOIN users u ON t.user_id = u.id
         WHERE t.id = $1
         FOR UPDATE OF t`,
        [ticketId]
      );

      if (!ticketRes.rowCount || ticketRes.rowCount === 0) {
        const err: any = new Error('Ticket not found in system database.');
        err.statusCode = 404;
        throw err;
      }

      const ticketData = ticketRes.rows[0];

      // 3. Verify organizer permissions (only event organizer or admin can check in attendees)
      if (ticketData.organizer_id !== scannedByUserId && userRole !== 'admin') {
        const err: any = new Error('Unauthorized. You are not the organizer of this event.');
        err.statusCode = 403;
        throw err;
      }

      // 4. Validate Event Status
      if (ticketData.event_status === 'cancelled') {
        const err: any = new Error('Event has been cancelled. Cannot check in attendees.');
        err.statusCode = 400;
        throw err;
      }

      // 5. Check Ticket Status
      if (ticketData.status === 'CHECKED_IN') {
        const checkinTime = new Date(ticketData.checked_in_at).toLocaleTimeString();
        const checkinDate = new Date(ticketData.checked_in_at).toLocaleDateString();
        const err: any = new Error(
          `Already Checked In! This ticket was already verified on ${checkinDate} at ${checkinTime}.`
        );
        err.statusCode = 409;
        err.alreadyCheckedIn = true;
        err.checked_in_at = ticketData.checked_in_at;
        err.attendee = {
          full_name: ticketData.attendee_name,
          email: ticketData.attendee_email,
        };
        throw err;
      }

      if (ticketData.status === 'CANCELLED') {
        const err: any = new Error('This ticket has been cancelled and is no longer valid.');
        err.statusCode = 400;
        throw err;
      }

      if (ticketData.status === 'EXPIRED') {
        const err: any = new Error('This ticket has expired.');
        err.statusCode = 400;
        throw err;
      }

      // 6. Update Ticket Status to CHECKED_IN
      const now = new Date();
      const updatedRes = await client.query(
        `UPDATE tickets
         SET status = 'CHECKED_IN',
             checked_in_at = $1,
             checked_in_by = $2,
             updated_at = $1
         WHERE id = $3
         RETURNING id, status, checked_in_at, checked_in_by, updated_at`,
        [now, scannedByUserId, ticketId]
      );

      await client.query('COMMIT');

      const updatedTicket = updatedRes.rows[0];

      return {
        check_in_status: 'SUCCESS',
        attendee: {
          id: ticketData.user_id,
          full_name: ticketData.attendee_name,
          email: ticketData.attendee_email,
          phone: ticketData.attendee_phone,
          organization: ticketData.attendee_organization,
        },
        event: {
          id: ticketData.event_id,
          title: ticketData.event_title,
          event_date: ticketData.event_date,
          location: ticketData.event_location,
        },
        ticket: {
          id: updatedTicket.id,
          status: updatedTicket.status,
          checked_in_at: updatedTicket.checked_in_at,
          checked_in_by: updatedTicket.checked_in_by,
        },
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

