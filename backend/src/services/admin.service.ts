import { query } from '../config/db';

export class AdminService {
  static async getDashboardMetrics() {
    const countsRes = await query(`
      SELECT 
        (SELECT COUNT(*)::INTEGER FROM events) AS total_events,
        (SELECT COUNT(*)::INTEGER FROM users WHERE role = 'attendee') AS total_attendees,
        (SELECT COUNT(*)::INTEGER FROM users WHERE role = 'organizer') AS total_organizers,
        (SELECT COUNT(*)::INTEGER FROM users WHERE role = 'organizer' AND approval_status = 'pending') AS pending_organizers,
        (SELECT COUNT(*)::INTEGER FROM registrations WHERE status = 'registered') AS total_registrations,
        (SELECT COUNT(*)::INTEGER FROM tickets WHERE status = 'CHECKED_IN') AS total_check_ins,
        (SELECT COUNT(*)::INTEGER FROM badge_awards WHERE revoked_at IS NULL) AS total_badges
    `);

    const row = countsRes.rows[0];
    const totalRegistrations = parseInt(row.total_registrations || '0', 10);
    const totalCheckIns = parseInt(row.total_check_ins || '0', 10);
    const turnoutRate = totalRegistrations > 0
      ? parseFloat(((totalCheckIns / totalRegistrations) * 100).toFixed(1))
      : 0;

    return {
      totalEvents: parseInt(row.total_events || '0', 10),
      totalAttendees: parseInt(row.total_attendees || '0', 10),
      totalOrganizers: parseInt(row.total_organizers || '0', 10),
      pendingOrganizers: parseInt(row.pending_organizers || '0', 10),
      totalRegistrations,
      totalCheckIns,
      turnoutRate,
      totalBadges: parseInt(row.total_badges || '0', 10),
    };
  }

  static async getUsersList() {
    const attendeesRes = await query(`
      SELECT 
        u.id, u.full_name, u.email, u.phone, u.role, u.is_active, u.approval_status, u.created_at,
        COUNT(DISTINCT r.id)::INTEGER AS events_registered,
        COUNT(DISTINCT CASE WHEN t.status = 'CHECKED_IN' THEN t.id END)::INTEGER AS events_attended
      FROM users u
      LEFT JOIN registrations r ON u.id = r.user_id AND r.status = 'registered'
      LEFT JOIN tickets t ON u.id = t.user_id
      WHERE u.role = 'attendee'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    const organizersRes = await query(`
      SELECT 
        u.id, u.full_name, u.email, u.phone, u.organization, u.role, u.is_active, u.approval_status, u.created_at,
        COUNT(DISTINCT e.id)::INTEGER AS events_count,
        COUNT(DISTINCT CASE WHEN t.status = 'CHECKED_IN' THEN t.id END)::INTEGER AS total_check_ins
      FROM users u
      LEFT JOIN events e ON u.id = e.organizer_id
      LEFT JOIN tickets t ON e.id = t.event_id
      WHERE u.role = 'organizer'
      GROUP BY u.id
      ORDER BY 
        CASE WHEN u.approval_status = 'pending' THEN 0 ELSE 1 END,
        u.created_at DESC
    `);

    const attendees = attendeesRes.rows.map((u) => ({
      id: u.id,
      name: u.full_name,
      email: u.email,
      phone: u.phone,
      role: 'ATTENDEE',
      eventsRegistered: u.events_registered || 0,
      eventsAttended: u.events_attended || 0,
      status: u.is_active ? 'Active' : 'Inactive',
      approvalStatus: u.approval_status || 'approved',
      registeredAt: u.created_at,
    }));

    const organizers = organizersRes.rows.map((o) => ({
      id: o.id,
      name: o.full_name,
      email: o.email,
      phone: o.phone,
      organization: o.organization || o.full_name,
      eventsCount: o.events_count || 0,
      totalCheckIns: o.total_check_ins || 0,
      status: o.approval_status === 'pending'
        ? 'Pending Approval'
        : o.is_active
        ? 'Active'
        : 'Inactive',
      approvalStatus: o.approval_status || 'pending',
      isActive: o.is_active,
      registeredAt: o.created_at,
    }));

    return { attendees, organizers };
  }

  static async approveOrganizer(userId: string) {
    const res = await query(
      `UPDATE users
       SET approval_status = 'approved',
           is_active = TRUE,
           updated_at = NOW()
       WHERE id = $1 AND role = 'organizer'
       RETURNING id, full_name, email, role, is_active, approval_status`,
      [userId]
    );

    if (!res.rowCount || res.rowCount === 0) {
      const err: any = new Error('Organizer account not found.');
      err.statusCode = 404;
      throw err;
    }

    return res.rows[0];
  }

  static async rejectOrganizer(userId: string) {
    const res = await query(
      `UPDATE users
       SET approval_status = 'rejected',
           is_active = FALSE,
           updated_at = NOW()
       WHERE id = $1 AND role = 'organizer'
       RETURNING id, full_name, email, role, is_active, approval_status`,
      [userId]
    );

    if (!res.rowCount || res.rowCount === 0) {
      const err: any = new Error('Organizer account not found.');
      err.statusCode = 404;
      throw err;
    }

    return res.rows[0];
  }

  static async toggleUserStatus(userId: string) {
    const res = await query(
      `UPDATE users
       SET is_active = NOT is_active,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, full_name, email, is_active, approval_status`,
      [userId]
    );

    if (!res.rowCount || res.rowCount === 0) {
      const err: any = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    return res.rows[0];
  }

  static async getPaymentIssues() {
    const res = await query(`
      SELECT 
        p.*,
        e.title AS event_title,
        u.email AS attendee_email
      FROM payments p
      JOIN events e ON p.event_id = e.id
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    return res.rows.map((p) => ({
      id: p.id,
      transactionId: p.transaction_id,
      eventTitle: p.event_title,
      attendeeEmail: p.attendee_email,
      amount: parseFloat(p.amount),
      commissionAmount: parseFloat(p.commission_amount),
      organizerPayout: parseFloat(p.organizer_payout),
      currency: p.currency,
      status: p.status,
      createdAt: p.created_at,
    }));
  }
}
