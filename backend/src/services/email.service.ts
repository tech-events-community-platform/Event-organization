// @ts-ignore
import nodemailer from 'nodemailer';

/**
 * Email Service for Sheeba Platform
 * Supports:
 * - SMTP (Gmail, Brevo, AWS SES, etc.)
 * - Resend API (if RESEND_API_KEY provided)
 * - Development Console Logging fallback (so OTP is never lost during dev/testing)
 */
export class EmailService {
  private static getTransporter() {
    if (process.env.RESEND_API_KEY) {
      return nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY,
        },
      });
    }

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    return null;
  }

  private static async dispatchEmail(to: string, subject: string, html: string): Promise<void> {
    const fromAddress = process.env.EMAIL_FROM || 'Sheeba Platform <no-reply@sheeba.et>';
    const transporter = this.getTransporter();

    console.log(`\n======================================================`);
    console.log(`[EmailService] 📧 Dispatched Email to: ${to}`);
    console.log(`[EmailService] 📋 Subject: ${subject}`);
    console.log(`======================================================\n`);

    if (!transporter) {
      console.log(`[EmailService] (Local Dev Notice: No SMTP_HOST or RESEND_API_KEY set. Email content rendered in memory).`);
      return;
    }

    try {
      await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
      });
      console.log(`[EmailService] ✅ Email successfully delivered over SMTP/Resend to ${to}`);
    } catch (error) {
      console.warn(`[EmailService] ⚠️ Remote email delivery failed:`, (error as any)?.message || error);
    }
  }

  /**
   * Section 2: Triggered immediately when an attendee account is created.
   */
  static async sendWelcomeEmail(toEmail: string, fullName: string): Promise<void> {
    const subject = 'Welcome to Sheeba!';
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2D1F23; background-color: #FAF7F5; border-radius: 16px;">
        <h1 style="color: #63474D; font-size: 24px; margin-bottom: 16px;">Welcome to Sheeba!</h1>
        <p>Hello ${fullName},</p>
        <p>Your account has been created successfully.</p>
        <p>Sheeba is an event platform for verifiable attendance credentials and community tech events in Ethiopia.</p>
        <div style="margin: 24px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/app" style="background-color: #63474D; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Open Your Sheeba Dashboard
          </a>
        </div>
        <p style="font-size: 12px; color: #756366; margin-top: 32px;">Sheeba Platform • Ethiopian Tech Community Credentials</p>
      </div>
    `;

    await this.dispatchEmail(toEmail, subject, htmlBody);
  }

  /**
   * Section 4: Triggered when registering for a specific event.
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
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2D1F23; background-color: #FAF7F5; border-radius: 16px;">
        <h1 style="color: #63474D; font-size: 24px; margin-bottom: 8px;">Registration Confirmed</h1>
        <h2 style="font-size: 20px; font-weight: bold; margin-top: 0; color: #2D1F23;">You're registered for ${eventTitle}</h2>
        <p>Hello ${fullName},</p>
        <p>Your registration is confirmed! Here are the event details:</p>
        
        <div style="background-color: #FFFFFF; border: 1px solid #E8DDD7; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 6px 0;"><strong>Event:</strong> ${eventTitle}</p>
          <p style="margin: 6px 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 6px 0;"><strong>Time:</strong> ${time}</p>
          <p style="margin: 6px 0;"><strong>Location:</strong> ${location}</p>
        </div>

        <p style="font-size: 14px; color: #63474D; font-weight: bold;">
          Important: Verified badges unlock when the organizer checks you in at the door!
        </p>

        <div style="margin: 24px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/badges" style="background-color: #63474D; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            View Your Badges & Passes
          </a>
        </div>
        <p style="font-size: 12px; color: #756366; margin-top: 32px;">Sheeba Platform • Ethiopian Tech Community Credentials</p>
      </div>
    `;

    await this.dispatchEmail(toEmail, subject, htmlBody);
  }

  /**
   * Password reset request email (link-based)
   */
  static async sendPasswordResetEmail(toEmail: string, resetToken: string, fullName: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const subject = 'Reset Your Sheeba Password';
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2D1F23; background-color: #FAF7F5; border-radius: 16px;">
        <h2 style="color: #63474D;">Password Reset Request</h2>
        <p>Hello ${fullName},</p>
        <p>We received a request to reset your Sheeba account password. Click the link below to choose a new password:</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #63474D; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="font-size: 12px; color: #756366;">This link expires in 1 hour. If you did not make this request, you can safely ignore this email.</p>
      </div>
    `;

    await this.dispatchEmail(toEmail, subject, htmlBody);
  }

  /**
   * Sponsor OTP Code Email (6-digit verification code)
   */
  static async sendSponsorOtpEmail(toEmail: string, otpCode: string, fullName: string): Promise<void> {
    const subject = `Your Sheeba Password Reset Code: ${otpCode}`;
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #2D1F23; background-color: #FAF7F5; border-radius: 20px; border: 1px solid #E8DDD7;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 20px; font-weight: bold; color: #63474D; letter-spacing: 1px;">SHEEBA SPONSOR PORTAL</span>
        </div>
        <h2 style="color: #2D1F23; font-size: 22px; margin-top: 0;">Password Reset Verification</h2>
        <p>Hello ${fullName || 'Partner'},</p>
        <p style="color: #555; line-height: 1.5;">You requested to reset your password for your Sheeba Sponsor Account. Use the 6-digit verification code below to complete the reset:</p>
        
        <div style="background-color: #FFFFFF; border: 2px dashed #63474D; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #63474D;">
            ${otpCode}
          </span>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #756366;">Valid for 15 minutes</p>
        </div>

        <p style="font-size: 13px; color: #666; line-height: 1.5;">
          If you did not request this verification code, please ignore this email or contact support. Never share your OTP code with anyone.
        </p>
        <hr style="border: none; border-top: 1px solid #E8DDD7; margin: 28px 0;" />
        <p style="font-size: 11px; color: #99878B; text-align: center;">
          Sheeba Corporate Partnerships • Ethiopian Technology & Startup Ecosystem
        </p>
      </div>
    `;

    console.log(`\n======================================================`);
    console.log(`[Sponsor OTP Generated] 🔑 EMAIL: ${toEmail} | CODE: ${otpCode}`);
    console.log(`======================================================\n`);

    await this.dispatchEmail(toEmail, subject, htmlBody);
  }

  /**
   * Sponsor Application Received Email
   */
  static async sendSponsorApplicationReceivedEmail(toEmail: string, fullName: string, companyName: string): Promise<void> {
    const subject = `Sponsor Application Received: ${companyName}`;
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #2D1F23; background-color: #FAF7F5; border-radius: 20px; border: 1px solid #E8DDD7;">
        <h2 style="color: #63474D; font-size: 22px; margin-top: 0;">Sponsor Application Received</h2>
        <p>Hello ${fullName},</p>
        <p>Thank you for applying to partner with Sheeba on behalf of <strong>${companyName}</strong>.</p>
        <p>Your corporate sponsor application has been submitted and is currently being reviewed by the Sheeba Administration team. We review each sponsor profile to ensure aligned partnerships with tech events and hackathons across Ethiopia.</p>
        <div style="background-color: #FFFFFF; border: 1px solid #E8DDD7; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 13px;"><strong>Company:</strong> ${companyName}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Representative:</strong> ${fullName}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Status:</strong> Pending Administrator Review</p>
        </div>
        <p style="font-size: 13px; color: #555;">You will receive an email confirmation as soon as your account is approved and activated.</p>
        <p style="font-size: 12px; color: #756366; margin-top: 32px;">Sheeba Platform • Ethiopian Tech Community Credentials</p>
      </div>
    `;

    await this.dispatchEmail(toEmail, subject, htmlBody);
  }

  /**
   * Sponsor Account Approved Email
   */
  static async sendSponsorApprovalEmail(toEmail: string, fullName: string, companyName: string): Promise<void> {
    const subject = `🎉 Your Sheeba Sponsor Account Has Been Approved!`;
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #2D1F23; background-color: #FAF7F5; border-radius: 20px; border: 1px solid #E8DDD7;">
        <h2 style="color: #2A7B5F; font-size: 22px; margin-top: 0;">Welcome, Corporate Partner!</h2>
        <p>Hello ${fullName},</p>
        <p>Great news! Your sponsor account for <strong>${companyName}</strong> has been approved by Sheeba Administration.</p>
        <p>You can now sign in to your dedicated Sponsor Dashboard to explore sponsorship opportunities, view verified attendee analytics, and collaborate with top tech community organizers.</p>
        <div style="margin: 28px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/sponsor/auth" style="background-color: #63474D; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
            Access Sponsor Dashboard
          </a>
        </div>
        <p style="font-size: 12px; color: #756366; margin-top: 32px;">Sheeba Platform • Ethiopian Tech Community Credentials</p>
      </div>
    `;

    await this.dispatchEmail(toEmail, subject, htmlBody);
  }

  /**
   * Sponsor Account Rejected Email
   */
  static async sendSponsorRejectionEmail(toEmail: string, fullName: string, companyName: string): Promise<void> {
    const subject = `Update on Your Sheeba Sponsor Application`;
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #2D1F23; background-color: #FAF7F5; border-radius: 20px; border: 1px solid #E8DDD7;">
        <h2 style="color: #63474D; font-size: 22px; margin-top: 0;">Sponsor Application Update</h2>
        <p>Hello ${fullName},</p>
        <p>Thank you for your interest in partnering with Sheeba for <strong>${companyName}</strong>.</p>
        <p>After review, the Sheeba Administration was unable to approve your application at this time. If you believe this was an error or would like to submit additional information regarding your organization, please contact us directly at <a href="mailto:partnerships@sheeba.et">partnerships@sheeba.et</a>.</p>
        <p style="font-size: 12px; color: #756366; margin-top: 32px;">Sheeba Platform • Ethiopian Tech Community Credentials</p>
      </div>
    `;

    await this.dispatchEmail(toEmail, subject, htmlBody);
  }
}
