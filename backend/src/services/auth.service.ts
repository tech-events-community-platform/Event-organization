import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { query } from '../config/db';
import { IUser, IUserSafe, UserRole } from '../types';
import { signAuthToken } from '../utils/jwt.util';
import { EmailService } from './email.service';
import { OAuth2Client } from 'google-auth-library';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      isActive: user.is_active !== false,
      approvalStatus: user.approval_status || (user.role?.toLowerCase() === 'organizer' ? 'pending' : 'approved'),
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
  }): Promise<{ user: any; token: string; isPendingApproval?: boolean; message?: string }> {
    const {
      email,
      password,
      full_name,
      phone = null,
      bio = null,
      organization = null,
    } = data;

    const normalizedRole = (data.role || 'attendee').toLowerCase();
    const isOrganizer = normalizedRole === 'organizer';
    const initialApprovalStatus = isOrganizer ? 'pending' : 'approved';
    const initialIsActive = !isOrganizer;

    // Check existing email
    const existing = await query<IUser>(
      'SELECT id, role, approval_status, is_active FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      const existingUser = existing.rows[0];
      const existingRole = (existingUser.role || 'attendee').toLowerCase();

      // If already registered with the same role, show error:
      if (existingRole === normalizedRole) {
        const err: any = new Error('You are already registered! Please sign in.');
        err.statusCode = 409;
        throw err;
      }

      // Vice versa: allow registration for the other role!
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const updated = await query<IUser>(
        `UPDATE users 
         SET role = $1,
             password_hash = COALESCE($2, password_hash),
             full_name = COALESCE($3, full_name),
             phone = COALESCE($4, phone),
             bio = COALESCE($5, bio),
             organization = COALESCE($6, organization),
             approval_status = $7,
             is_active = $8,
             updated_at = NOW()
         WHERE id = $9
         RETURNING id, email, full_name, role, phone, bio, organization, avatar_url, visibility, member_since, is_active, approval_status, created_at, updated_at`,
        [normalizedRole, passwordHash, full_name, phone, bio, organization, initialApprovalStatus, initialIsActive, existingUser.id]
      );

      const rawUser = updated.rows[0];
      if (isOrganizer) {
        const user = this.formatUserResponse(rawUser);
        return {
          user,
          token: '',
          isPendingApproval: true,
          message: 'you will be using this sytem in 1 hour',
        };
      }

      const token = signAuthToken({
        userId: rawUser.id,
        email: rawUser.email,
        role: rawUser.role as UserRole,
        fullName: rawUser.full_name,
      });
      const stats = await this.computeUserStats(rawUser.id);
      return {
        user: this.formatUserResponse(rawUser, stats),
        token,
      };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(full_name)}&background=63474D&color=fff`;

    const result = await query<IUser>(
      `INSERT INTO users (email, password_hash, full_name, role, phone, bio, organization, avatar_url, visibility, member_since, is_active, approval_status)
       VALUES (LOWER($1), $2, $3, $4, $5, $6, $7, $8, 'public', 'August 2026', $9, $10)
       RETURNING id, email, full_name, role, phone, bio, organization, avatar_url, visibility, member_since, is_active, approval_status, created_at, updated_at`,
      [email, passwordHash, full_name, normalizedRole, phone, bio, organization, avatarUrl, initialIsActive, initialApprovalStatus]
    );

    const rawUser = result.rows[0];

    // If organizer: registration goes to pending approval queue
    if (isOrganizer) {
      const user = this.formatUserResponse(rawUser);
      return {
        user,
        token: '',
        isPendingApproval: true,
        message: 'you will be using this sytem in 1 hour',
      };
    }

    // Attendee: immediate active login token
    const token = signAuthToken({
      userId: rawUser.id,
      email: rawUser.email,
      role: rawUser.role as UserRole,
      fullName: rawUser.full_name,
    });

    const user = this.formatUserResponse(rawUser);

    // Trigger separate "Welcome to Sheeba" email after account creation (Section 2)
    try {
      await EmailService.sendWelcomeEmail(rawUser.email, rawUser.full_name || 'Attendee');
    } catch (emailErr) {
      console.warn('Welcome email dispatch failed:', emailErr);
    }

    return { user, token, isPendingApproval: false };
  }

  static async loginUser(data: {
    email: string;
    password: string;
  }): Promise<{ user: any; token: string }> {
    const { email, password } = data;

    const result = await query<IUser>(
      `SELECT id, email, password_hash, full_name, role, phone, bio, organization, avatar_url, visibility, member_since, is_active, approval_status, created_at, updated_at
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

    const userRole = (rawUser.role || '').toLowerCase();
    const isPending = rawUser.approval_status === 'pending' || rawUser.approval_status === 'rejected';

    // Organizer pending approval check
    if (userRole === 'organizer' && (isPending || !rawUser.is_active)) {
      const err: any = new Error('you will be using this sytem in 1 hour');
      err.statusCode = 403;
      err.isPendingApproval = true;
      err.approvalStatus = rawUser.approval_status || 'pending';
      throw err;
    }

    if (!rawUser.is_active && userRole !== 'organizer') {
      const err: any = new Error('Your account has been deactivated. Please contact support.');
      err.statusCode = 403;
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
      `SELECT id, email, full_name, role, phone, bio, organization, avatar_url, visibility, member_since, is_active, approval_status, created_at, updated_at
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

  static async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const result = await query<IUser>(
      'SELECT id, email, full_name FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    if (result.rowCount && result.rowCount > 0) {
      const user = result.rows[0];
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

      await query(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, resetToken, expiresAt]
      );

      try {
        await EmailService.sendPasswordResetEmail(user.email, resetToken, user.full_name || 'Attendee');
      } catch (e) {
        console.warn('Password reset email dispatch error:', e);
      }
    }

    return {
      success: true,
      message: 'If an account exists with that email, a password reset link has been dispatched.',
    };
  }

  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const tokenRes = await query(
      'SELECT user_id, expires_at FROM password_reset_tokens WHERE token = $1',
      [token]
    );

    if (!tokenRes.rowCount || tokenRes.rowCount === 0) {
      const err: any = new Error('Invalid or expired password reset token.');
      err.statusCode = 400;
      throw err;
    }

    const { user_id, expires_at } = tokenRes.rows[0];
    if (new Date() > new Date(expires_at)) {
      const err: any = new Error('Password reset token has expired.');
      err.statusCode = 400;
      throw err;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, user_id]);
    await query('DELETE FROM password_reset_tokens WHERE token = $1', [token]);

    return {
      success: true,
      message: 'Password has been reset successfully. You may now log in.',
    };    
  }

  
  static async loginWithGoogle(credential: string, role?: string, mode: 'login' | 'register' = 'login') {
    // 1. Verify the ID token directly with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      const err: any = new Error('Invalid Google credential.');
      err.statusCode = 400;
      throw err;
    }

    if (!payload.email_verified) {
      const err: any = new Error('Google email is not verified.');
      err.statusCode = 400;
      throw err;
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase().trim();
    const fullName = payload.name || email.split('@')[0];
    const avatarUrl = payload.picture;

    // 2. Search database: first by google_id, then by email
    let userRes = await query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    let user = userRes.rows[0];

    if (!user) {
      const emailRes = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
      if (emailRes.rows.length > 0) {
        user = emailRes.rows[0];
        // Link Google ID to their existing account
        await query(
          'UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) WHERE id = $3',
          [googleId, avatarUrl, user.id]
        );
        user.google_id = googleId;
      }
    }

    // Check mode rules:
    // If attempting to login but user doesn't exist -> reject
    if (mode === 'login' && !user) {
      const err: any = new Error('You have not registered yet. Please register first.');
      err.statusCode = 404;
      throw err;
    }

    const requestedRole = (role || 'attendee').toLowerCase();

    // If attempting to register but user already exists:
    if (mode === 'register' && user) {
      const currentRole = (user.role || 'attendee').toLowerCase();

      // If already registered with the SAME role -> reject
      if (currentRole === requestedRole) {
        const err: any = new Error('You are already registered! Please sign in.');
        err.statusCode = 409;
        throw err;
      }

      // Vice versa: allow registration for the other role!
      const approvalStatus = requestedRole === 'organizer' ? 'pending' : 'approved';
      await query(
        'UPDATE users SET role = $1, approval_status = $2, updated_at = NOW() WHERE id = $3',
        [requestedRole, approvalStatus, user.id]
      );
      user.role = requestedRole;
      user.approval_status = approvalStatus;
    }

    // If registering and user does not exist, create the account
    if (!user) {
      const normalizedRole = (role || 'attendee').toLowerCase();
      const approvalStatus = normalizedRole === 'organizer' ? 'pending' : 'approved';
      const insertRes = await query(
        `INSERT INTO users (email, full_name, role, avatar_url, google_id, approval_status, member_since)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [email, fullName, normalizedRole, avatarUrl, googleId, approvalStatus, 'September 2026']
      );
      user = insertRes.rows[0];

      // Send welcome email
      EmailService.sendWelcomeEmail(email, fullName).catch((e) =>
        console.error('Welcome email dispatch failed:', e)
      );
    }

    // 3. Generate your Sheeba JWT token
    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      role: (user.role || 'attendee').toUpperCase() as UserRole,
      fullName: user.full_name,
    });
    const stats = await AuthService.computeUserStats(user.id);
    return {
      user: AuthService.formatUserResponse(user, stats),
      token,
    };
  } 
  
}
