/**
 * Email Service for Sheeba Platform
 * Dispatches distinct emails for:
 * 1. Account creation ("Welcome to Sheeba! Your account has been created") - Section 2
 * 2. Registration confirmation ("You're registered for [Event Name]" with date, time, location) - Section 4
 * 3. Password reset request instructions
 */
export class EmailService {
  /**
   * Section 2: Triggered immediately when an account is created.
   */
  static async sendWelcomeEmail(toEmail: string, fullName: string): Promise<void> {
    const subject = 'Welcome to Sheeba!';
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2D1F23;">
        <h1 style="color: #63474D; font-size: 24px; margin-bottom: 16px;">Welcome to Sheeba!</h1>
        <p>Hello ${fullName},</p>
        <p>Your account has been created successfully.</p>
        <p>Sheeba is an event platform for verifiable attendance credentials and community tech events in Ethiopia. When you attend events, organizers issue authentic badges directly to your account upon door check-in.</p>
        <div style="margin: 24px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/app" style="background-color: #63474D; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Open Your Sheeba Dashboard
          </a>
        </div>
        <p style="font-size: 12px; color: #756366; margin-top: 32px;">Sheeba Platform • Ethiopian Tech Community Credentials</p>
      </div>
    `;

    console.log(`[EmailService] 📧 Sending Welcome Email to ${toEmail}`);
    console.log(`[EmailService] Subject: ${subject}`);
    // In production: dispatch via SMTP, Resend, SendGrid, or AWS SES
  }

  /**
   * Section 4: Triggered when registering for a specific event.
   * Distinct wording from account creation email. Includes event date, time, location.
   */
  static async sendRegistrationConfirmationEmail(
    toEmail: string,
    fullName: string,
    eventTitle: string,
    date: string,
    time: string,
    location: string
  ): Promise<void> {
    const subject = `You're registered for ${eventTitle}`;
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2D1F23;">
        <h1 style="color: #63474D; font-size: 24px; margin-bottom: 8px;">Registration Confirmed</h1>
        <h2 style="font-size: 20px; font-weight: bold; margin-top: 0; color: #2D1F23;">You're registered for ${eventTitle}</h2>
        <p>Hello ${fullName},</p>
        <p>Your registration is confirmed! Here are the event details:</p>
        
        <div style="background-color: #FAF7F5; border: 1px solid #E8DDD7; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 6px 0;"><strong>Event:</strong> ${eventTitle}</p>
          <p style="margin: 6px 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 6px 0;"><strong>Time:</strong> ${time}</p>
          <p style="margin: 6px 0;"><strong>Location:</strong> ${location}</p>
        </div>

        <p style="font-size: 14px; color: #63474D; font-weight: bold;">
          Important: Verified badges (Attended, Participant, Winner, Speaker) unlock when the organizer checks you in at the door!
        </p>

        <div style="margin: 24px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/badges" style="background-color: #63474D; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            View Your Badges & Passes
          </a>
        </div>
        <p style="font-size: 12px; color: #756366; margin-top: 32px;">Sheeba Platform • Ethiopian Tech Community Credentials</p>
      </div>
    `;

    console.log(`[EmailService] 📧 Sending Registration Confirmation to ${toEmail}`);
    console.log(`[EmailService] Subject: ${subject}`);
    console.log(`[EmailService] Logistics: ${date} at ${time}, ${location}`);
  }

  /**
   * Password reset request email
   */
  static async sendPasswordResetEmail(toEmail: string, resetToken: string, fullName: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const subject = 'Reset Your Sheeba Password';

    console.log(`[EmailService] 📧 Sending Password Reset to ${toEmail}`);
    console.log(`[EmailService] Reset Link: ${resetUrl}`);
  }
}
