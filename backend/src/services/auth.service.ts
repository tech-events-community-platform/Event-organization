import bcrypt from 'bcryptjs';
import { query } from '../config/db';
import { IUser, IUserSafe, UserRole } from '../types';
import { signAuthToken } from '../utils/jwt.util';

export class AuthService {
  static async registerUser(data: {
    email: string;
    password: string;
    full_name: string;
    role?: UserRole;
    phone?: string;
    bio?: string;
    organization?: string;
  }): Promise<{ user: IUserSafe; token: string }> {
    const {
      email,
      password,
      full_name,
      role = 'attendee',
      phone = null,
      bio = null,
      organization = null,
    } = data;

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

    const result = await query<IUser>(
      `INSERT INTO users (email, password_hash, full_name, role, phone, bio, organization)
       VALUES (LOWER($1), $2, $3, $4, $5, $6, $7)
       RETURNING id, email, full_name, role, phone, bio, organization, created_at, updated_at`,
      [email, passwordHash, full_name, role, phone, bio, organization]
    );

    const user = result.rows[0] as IUserSafe;
    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    });

    return { user, token };
  }

  static async loginUser(data: {
    email: string;
    password: string;
  }): Promise<{ user: IUserSafe; token: string }> {
    const { email, password } = data;

    const result = await query<IUser>(
      `SELECT id, email, password_hash, full_name, role, phone, bio, organization, created_at, updated_at
       FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    if (!result.rowCount || result.rowCount === 0) {
      const err: any = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      const err: any = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const { password_hash, ...userSafe } = user;
    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    });

    return { user: userSafe, token };
  }

  static async getCurrentUser(userId: string): Promise<IUserSafe> {
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
}

