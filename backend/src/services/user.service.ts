import { query } from '../config/db';
import { IUserSafe } from '../types';

export class UserService {
  static async getUserProfile(userId: string): Promise<IUserSafe> {
    const result = await query<IUserSafe>(
      `SELECT id, email, full_name, role, phone, bio, organization, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (!result.rowCount || result.rowCount === 0) {
      const err: any = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    return result.rows[0];
  }

  static async updateUserProfile(
    userId: string,
    data: {
      full_name?: string;
      phone?: string;
      bio?: string;
      organization?: string;
    }
  ): Promise<IUserSafe> {
    const fields: string[] = [];
    const values: any[] = [];
    let counter = 1;

    if (data.full_name !== undefined) {
      fields.push(`full_name = $${counter++}`);
      values.push(data.full_name);
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${counter++}`);
      values.push(data.phone);
    }
    if (data.bio !== undefined) {
      fields.push(`bio = $${counter++}`);
      values.push(data.bio);
    }
    if (data.organization !== undefined) {
      fields.push(`organization = $${counter++}`);
      values.push(data.organization);
    }

    if (fields.length === 0) {
      return this.getUserProfile(userId);
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const queryText = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${counter}
      RETURNING id, email, full_name, role, phone, bio, organization, created_at, updated_at
    `;

    const result = await query<IUserSafe>(queryText, values);

    if (!result.rowCount || result.rowCount === 0) {
      const err: any = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    return result.rows[0];
  }

  static async getUserAttendanceHistory(userId: string) {
    const result = await query(
      `SELECT 
        t.id AS ticket_id,
        t.status AS ticket_status,
        t.checked_in_at,
        t.qr_token,
        r.id AS registration_id,
        r.registered_at,
        e.id AS event_id,
        e.title AS event_title,
        e.description AS event_description,
        e.category AS event_category,
        e.event_date,
        e.location AS event_location,
        e.banner_url AS event_banner_url,
        u.full_name AS organizer_name
       FROM tickets t
       JOIN registrations r ON t.registration_id = r.id
       JOIN events e ON t.event_id = e.id
       JOIN users u ON e.organizer_id = u.id
       WHERE t.user_id = $1 AND t.status = 'CHECKED_IN'
       ORDER BY t.checked_in_at DESC`,
      [userId]
    );

    return result.rows;
  }
}

