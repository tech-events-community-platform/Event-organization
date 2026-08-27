import { query, getClient } from '../config/db';
import { ITicket } from '../types';
import { generateTicketToken, generateQrDataUrl } from '../utils/qr.util';

export class TicketService {
  static async issueTicket(eventId: string, userId: string): Promise<ITicket> {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // 1. Verify user is registered
      const regRes = await client.query(
        `SELECT id, status FROM registrations WHERE event_id = $1 AND user_id = $2 AND status = 'registered'`,
        [eventId, userId]
      );

      if (!regRes.rowCount || regRes.rowCount === 0) {
        const err: any = new Error('User is not registered for this event. Please register first.');
        err.statusCode = 400;
        throw err;
      }

      const registrationId = regRes.rows[0].id;

      // 2. Check if ticket already exists
      const existingTicketRes = await client.query(
        `SELECT * FROM tickets WHERE registration_id = $1`,
        [registrationId]
      );

      if (existingTicketRes.rowCount && existingTicketRes.rowCount > 0) {
        const ticket = existingTicketRes.rows[0];
        if (ticket.status === 'ISSUED' || ticket.status === 'CHECKED_IN') {
          await client.query('COMMIT');
          return ticket;
        }

        // Re-issue if was cancelled
        const qrToken = generateTicketToken(ticket.id, eventId, userId);
        const qrDataUrl = await generateQrDataUrl(qrToken);

        const updateRes = await client.query(
          `UPDATE tickets SET status = 'ISSUED', qr_token = $1, qr_code_data_url = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
          [qrToken, qrDataUrl, ticket.id]
        );

        await client.query('COMMIT');
        return updateRes.rows[0];
      }

      // Generate new ticket
      const ticketIdRes = await client.query(`SELECT gen_random_uuid() AS id`);
      const ticketId = ticketIdRes.rows[0].id;

      const qrToken = generateTicketToken(ticketId, eventId, userId);
      const qrDataUrl = await generateQrDataUrl(qrToken);

      const newTicketRes = await client.query(
        `INSERT INTO tickets (id, registration_id, event_id, user_id, qr_token, qr_code_data_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'ISSUED')
         RETURNING *`,
        [ticketId, registrationId, eventId, userId, qrToken, qrDataUrl]
      );

      await client.query('COMMIT');
      return newTicketRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getTicketByEventAndUser(eventId: string, userId: string) {
    const sql = `
      SELECT 
        t.*,
        e.title AS event_title,
        e.description AS event_description,
        e.event_date,
        e.end_date,
        e.location AS event_location,
        e.banner_url AS event_banner_url,
        u.full_name AS attendee_name,
        u.email AS attendee_email,
        org.full_name AS organizer_name
      FROM tickets t
      JOIN events e ON t.event_id = e.id
      JOIN users u ON t.user_id = u.id
      JOIN users org ON e.organizer_id = org.id
      WHERE t.event_id = $1 AND t.user_id = $2
    `;

    const result = await query(sql, [eventId, userId]);

    if (!result.rowCount || result.rowCount === 0) {
      const err: any = new Error('Ticket not found for this event.');
      err.statusCode = 404;
      throw err;
    }

    return result.rows[0];
  }

  static async getTicketById(ticketId: string) {
    const sql = `
      SELECT 
        t.*,
        e.title AS event_title,
        e.event_date,
        e.location AS event_location,
        u.full_name AS attendee_name,
        u.email AS attendee_email
      FROM tickets t
      JOIN events e ON t.event_id = e.id
      JOIN users u ON t.user_id = u.id
      WHERE t.id = $1
    `;

    const result = await query(sql, [ticketId]);

    if (!result.rowCount || result.rowCount === 0) {
      const err: any = new Error('Ticket not found.');
      err.statusCode = 404;
      throw err;
    }

    return result.rows[0];
  }
}

