import { query, getClient } from '../config/db';
import { IEvent, EventStatus, UserRole } from '../types';
import { generateTicketToken, generateQrDataUrl } from '../utils/qr.util';

export class EventService {
  static async createEvent(
    organizerId: string,
    data: {
      title: string;
      description: string;
      category?: string;
      event_date: string;
      end_date?: string;
      location: string;
      capacity: number;
      banner_url?: string;
      status?: EventStatus;
    }
  ): Promise<IEvent> {
    const {
      title,
      description,
      category = 'General',
      event_date,
      end_date = null,
      location,
      capacity,
      banner_url = null,
      status = 'published',
    } = data;

    const result = await query<IEvent>(
      `INSERT INTO events (
        organizer_id, title, description, category, event_date, end_date, location, capacity, status, banner_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        organizerId,
        title,
        description,
        category,
        new Date(event_date),
        end_date ? new Date(end_date) : null,
        location,
        capacity,
        status,
        banner_url,
      ]
    );

    return result.rows[0];
  }

  static async getEvents(filters: {
    search?: string;
    category?: string;
    status?: string;
    organizerId?: string;
    upcomingOnly?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const {
      search,
      category,
      status = 'published',
      organizerId,
      upcomingOnly = false,
      limit = 50,
      offset = 0,
    } = filters;

    const conditions: string[] = [];
    const values: any[] = [];
    let counter = 1;

    if (organizerId) {
      conditions.push(`e.organizer_id = $${counter++}`);
      values.push(organizerId);
    } else if (status) {
      conditions.push(`e.status = $${counter++}`);
      values.push(status);
    }

    if (category) {
      conditions.push(`LOWER(e.category) = LOWER($${counter++})`);
      values.push(category);
    }

    if (search) {
      conditions.push(`(e.title ILIKE $${counter} OR e.description ILIKE $${counter} OR e.location ILIKE $${counter})`);
      values.push(`%${search}%`);
      counter++;
    }

    if (upcomingOnly) {
      conditions.push(`e.event_date >= NOW()`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        e.*,
        u.full_name AS organizer_name,
        u.email AS organizer_email,
        u.organization AS organizer_organization,
        COALESCE(r.registered_count, 0)::INTEGER AS registered_count,
        COALESCE(t.checked_in_count, 0)::INTEGER AS checked_in_count
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      LEFT JOIN (
        SELECT event_id, COUNT(*) AS registered_count 
        FROM registrations 
        WHERE status = 'registered' 
        GROUP BY event_id
      ) r ON e.id = r.event_id
      LEFT JOIN (
        SELECT event_id, COUNT(*) AS checked_in_count 
        FROM tickets 
        WHERE status = 'CHECKED_IN' 
        GROUP BY event_id
      ) t ON e.id = t.event_id
      ${whereClause}
      ORDER BY e.event_date ASC
      LIMIT $${counter++} OFFSET $${counter++}
    `;

    values.push(limit, offset);

    const result = await query(sql, values);
    return result.rows;
  }

  static async getEventById(eventId: string): Promise<IEvent> {
    const sql = `
      SELECT 
        e.*,
        u.full_name AS organizer_name,
        u.email AS organizer_email,
        u.organization AS organizer_organization,
        COALESCE(r.registered_count, 0)::INTEGER AS registered_count,
        COALESCE(t.checked_in_count, 0)::INTEGER AS checked_in_count
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      LEFT JOIN (
        SELECT event_id, COUNT(*) AS registered_count 
        FROM registrations 
        WHERE status = 'registered' 
        GROUP BY event_id
      ) r ON e.id = r.event_id
      LEFT JOIN (
        SELECT event_id, COUNT(*) AS checked_in_count 
        FROM tickets 
        WHERE status = 'CHECKED_IN' 
        GROUP BY event_id
      ) t ON e.id = t.event_id
      WHERE e.id = $1
    `;

    const result = await query<IEvent>(sql, [eventId]);

    if (!result.rowCount || result.rowCount === 0) {
      const err: any = new Error('Event not found.');
      err.statusCode = 404;
      throw err;
    }

    return result.rows[0];
  }

  static async updateEvent(
    eventId: string,
    userId: string,
    userRole: UserRole,
    data: Partial<{
      title: string;
      description: string;
      category: string;
      event_date: string;
      end_date: string;
      location: string;
      capacity: number;
      banner_url: string;
      status: EventStatus;
    }>
  ): Promise<IEvent> {
    // Check ownership
    const event = await this.getEventById(eventId);
    if (event.organizer_id !== userId && userRole !== 'admin') {
      const err: any = new Error('Forbidden. You are not authorized to update this event.');
      err.statusCode = 403;
      throw err;
    }

    const fields: string[] = [];
    const values: any[] = [];
    let counter = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${counter++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${counter++}`);
      values.push(data.description);
    }
    if (data.category !== undefined) {
      fields.push(`category = $${counter++}`);
      values.push(data.category);
    }
    if (data.event_date !== undefined) {
      fields.push(`event_date = $${counter++}`);
      values.push(new Date(data.event_date));
    }
    if (data.end_date !== undefined) {
      fields.push(`end_date = $${counter++}`);
      values.push(data.end_date ? new Date(data.end_date) : null);
    }
    if (data.location !== undefined) {
      fields.push(`location = $${counter++}`);
      values.push(data.location);
    }
    if (data.capacity !== undefined) {
      fields.push(`capacity = $${counter++}`);
      values.push(data.capacity);
    }
    if (data.banner_url !== undefined) {
      fields.push(`banner_url = $${counter++}`);
      values.push(data.banner_url);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${counter++}`);
      values.push(data.status);
    }

    if (fields.length === 0) {
      return event;
    }

    fields.push(`updated_at = NOW()`);
    values.push(eventId);

    const queryText = `
      UPDATE events
      SET ${fields.join(', ')}
      WHERE id = $${counter}
      RETURNING *
    `;

    const result = await query<IEvent>(queryText, values);
    return result.rows[0];
  }

  static async deleteEvent(
    eventId: string,
    userId: string,
    userRole: UserRole
  ): Promise<void> {
    const event = await this.getEventById(eventId);
    if (event.organizer_id !== userId && userRole !== 'admin') {
      const err: any = new Error('Forbidden. You are not authorized to delete this event.');
      err.statusCode = 403;
      throw err;
    }

    await query('DELETE FROM events WHERE id = $1', [eventId]);
  }

  static async registerForEvent(eventId: string, userId: string) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // 1. Check event exists and lock for capacity check
      const eventRes = await client.query<IEvent>(
        `SELECT * FROM events WHERE id = $1 FOR UPDATE`,
        [eventId]
      );

      if (!eventRes.rowCount || eventRes.rowCount === 0) {
        const err: any = new Error('Event not found.');
        err.statusCode = 404;
        throw err;
      }

      const event = eventRes.rows[0];

      if (event.status !== 'published') {
        const err: any = new Error('Event is not available for registration.');
        err.statusCode = 400;
        throw err;
      }

      // 2. Check if already registered
      const regRes = await client.query(
        `SELECT id, status FROM registrations WHERE event_id = $1 AND user_id = $2`,
        [eventId, userId]
      );

      if (regRes.rowCount && regRes.rowCount > 0) {
        const existing = regRes.rows[0];
        if (existing.status === 'registered') {
          const err: any = new Error('You are already registered for this event.');
          err.statusCode = 409;
          throw err;
        } else {
          // Reactivate cancelled registration
          await client.query(
            `UPDATE registrations SET status = 'registered', updated_at = NOW() WHERE id = $1`,
            [existing.id]
          );
        }
      }

      // 3. Check capacity limit
      const countRes = await client.query(
        `SELECT COUNT(*)::INTEGER AS total FROM registrations WHERE event_id = $1 AND status = 'registered'`,
        [eventId]
      );
      const currentCount = countRes.rows[0].total;

      if (currentCount >= event.capacity) {
        const err: any = new Error('Event registration is full. Capacity limit reached.');
        err.statusCode = 400;
        throw err;
      }

      let registrationId: string;

      if (!regRes.rowCount || regRes.rowCount === 0) {
        // 4. Create new registration
        const newReg = await client.query(
          `INSERT INTO registrations (event_id, user_id, status)
           VALUES ($1, $2, 'registered')
           RETURNING id, event_id, user_id, status, registered_at`,
          [eventId, userId]
        );
        registrationId = newReg.rows[0].id;
      } else {
        registrationId = regRes.rows[0].id;
      }

      // 5. Generate / Issue Ticket
      const ticketRes = await client.query(
        `SELECT * FROM tickets WHERE registration_id = $1`,
        [registrationId]
      );

      let ticket;

      if (ticketRes.rowCount && ticketRes.rowCount > 0) {
        ticket = ticketRes.rows[0];
        if (ticket.status === 'CANCELLED') {
          const qrToken = generateTicketToken(ticket.id, eventId, userId);
          const qrDataUrl = await generateQrDataUrl(qrToken);
          const updatedTicket = await client.query(
            `UPDATE tickets SET status = 'ISSUED', qr_token = $1, qr_code_data_url = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
            [qrToken, qrDataUrl, ticket.id]
          );
          ticket = updatedTicket.rows[0];
        }
      } else {
        // Pre-generate UUID for ticket
        const ticketIdRes = await client.query(`SELECT gen_random_uuid() AS id`);
        const ticketId = ticketIdRes.rows[0].id;

        const qrToken = generateTicketToken(ticketId, eventId, userId);
        const qrDataUrl = await generateQrDataUrl(qrToken);

        const newTicket = await client.query(
          `INSERT INTO tickets (id, registration_id, event_id, user_id, qr_token, qr_code_data_url, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'ISSUED')
           RETURNING *`,
          [ticketId, registrationId, eventId, userId, qrToken, qrDataUrl]
        );
        ticket = newTicket.rows[0];
      }

      await client.query('COMMIT');

      return {
        registration_id: registrationId,
        event,
        ticket,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getUserRegistration(eventId: string, userId: string) {
    const sql = `
      SELECT 
        r.id AS registration_id,
        r.status AS registration_status,
        r.registered_at,
        e.id AS event_id,
        e.title AS event_title,
        e.description AS event_description,
        e.event_date,
        e.location AS event_location,
        t.id AS ticket_id,
        t.qr_token,
        t.qr_code_data_url,
        t.status AS ticket_status,
        t.checked_in_at
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      LEFT JOIN tickets t ON r.id = t.registration_id
      WHERE r.event_id = $1 AND r.user_id = $2
    `;

    const result = await query(sql, [eventId, userId]);

    if (!result.rowCount || result.rowCount === 0) {
      return null;
    }

    return result.rows[0];
  }

  static async cancelRegistration(eventId: string, userId: string) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      const regRes = await client.query(
        `SELECT id FROM registrations WHERE event_id = $1 AND user_id = $2 AND status = 'registered'`,
        [eventId, userId]
      );

      if (!regRes.rowCount || regRes.rowCount === 0) {
        const err: any = new Error('No active registration found for this event.');
        err.statusCode = 404;
        throw err;
      }

      const regId = regRes.rows[0].id;

      await client.query(
        `UPDATE registrations SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
        [regId]
      );

      await client.query(
        `UPDATE tickets SET status = 'CANCELLED', updated_at = NOW() WHERE registration_id = $1`,
        [regId]
      );

      await client.query('COMMIT');
      return { message: 'Registration cancelled successfully.' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

