import bcrypt from 'bcryptjs';
import { query } from '../config/db';
import { IUser, IUserSafe, UserRole } from '../types';
import { signAuthToken } from '../utils/jwt.util';

export class AuthService {
  static formatUserResponse(user: any, stats?: any) {
    return {
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: (user.role || 'attendee').toUpperCase(),
      avatarUrl: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=63474D&color=fff`,
      memberSince: user.member_since || 'August 2026',
      visibility: user.visibility || 'public',
      organization: user.organization || undefined,
      phone: user.phone || undefined,
      bio: user.bio || undefined,
      stats: stats || {
        meetupsCount: 0,
        workshopsCount: 0,
        hackathonsCount: 0,
        totalEventsAttended: 0,
      },
    };
  }

  static async computeUserStats(userId: string) {
    const statsRes = await query(
      `SELECT 
        COUNT(CASE WHEN e.event_type = 'meetup' THEN 1 END) as meetups_count,
        COUNT(CASE WHEN e.event_type = 'workshop' THEN 1 END) as workshops_count,
        COUNT(CASE WHEN e.event_type = 'hackathon' THEN 1 END) as hackathons_count,
        COUNT(t.id) as total_attended
       FROM tickets t
       JOIN events e ON t.event_id = e.id
       WHERE t.user_id = $1 AND t.status = 'CHECKED_IN'`,
      [userId]
    );

    const row = statsRes.rows[0] || {};
    return {
      meetupsCount: parseInt(row.meetups_count || '0', 10),
      workshopsCount: parseInt(row.workshops_count || '0', 10),
      hackathonsCount: parseInt(row.hackathons_count || '0', 10),
      totalEventsAttended: parseInt(row.total_attended || '0', 10),
    };
  }

  static async registerUser(data: {
    email: string;
    password: string;
    full_name: string;
    role?: UserRole | string;
    phone?: string;
    bio?: string;
    organization?: string;
  }): Promise<{ user: any; token: string }> {
    const {
      email,
      password,
      full_name,
      phone = null,
      bio = null,
      organization = null,
    } = data;

    const normalizedRole = (data.role || 'attendee').toLowerCase();

    // Check existing email
    const existing = await query<IUser>(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      const err: any = new Error('An account with this email already exists.');
      err.statusCode = 409;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(full_name)}&background=63474D&color=fff`;

    const result = await query<IUser>(
      `INSERT INTO users (email, password_hash, full_name, role, phone, bio, organization, avatar_url, visibility, member_since)
       VALUES (LOWER($1), $2, $3, $4, $5, $6, $7, $8, 'public', 'August 2026')
       RETURNING id, email, full_name, role, phone, bio, organization, avatar_url, visibility, member_since, created_at, updated_at`,
      [email, passwordHash, full_name, normalizedRole, phone, bio, organization, avatarUrl]
    );

    const rawUser = result.rows[0];
    const token = signAuthToken({
      userId: rawUser.id,
      email: rawUser.email,
      role: rawUser.role as UserRole,
      fullName: rawUser.full_name,
    });

    const user = this.formatUserResponse(rawUser);
    return { user, token };
  }

  static async loginUser(data: {
    email: string;
    password: string;
  }): Promise<{ user: any; token: string }> {
    const { email, password } = data;

    const result = await query<IUser>(
      `SELECT id, email, password_hash, full_name, role, phone, bio, organization, avatar_url, visibility, member_since, created_at, updated_at
       FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    if (!result.rowCount || result.rowCount === 0) {
      const err: any = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const rawUser = result.rows[0];
    const isMatch = await bcrypt.compare(password, rawUser.password_hash);

    if (!isMatch) {
      const err: any = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const stats = await this.computeUserStats(rawUser.id);
    const token = signAuthToken({
      userId: rawUser.id,
      email: rawUser.email,
      role: rawUser.role as UserRole,
      fullName: rawUser.full_name,
    });

    const user = this.formatUserResponse(rawUser, stats);
    return { user, token };
  }

  static async getCurrentUser(userId: string): Promise<any> {
    const result = await query<IUser>(
      `SELECT id, email, full_name, role, phone, bio, organization, avatar_url, visibility, member_since, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (!result.rowCount || result.rowCount === 0) {
      const err: any = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    const rawUser = result.rows[0];
    const stats = await this.computeUserStats(rawUser.id);
    return this.formatUserResponse(rawUser, stats);
  }
}
