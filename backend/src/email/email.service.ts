import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_SMTP_USERNAME'),
        pass: this.configService.get<string>('MAIL_SMTP_PASSWORD'),
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    try {
      const mailOptions = {
        from: this.configService.get<string>('MAIL_SMTP_FROM'),
        to,
        subject,
        text,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully', result.messageId);
      return result;
    } catch (error) {
      console.log('Error sending email', error);
      throw error;
    }
  }

  // VERIFICATION EMAIL
  async sendVerificationEmail(user: User, token: string) {
    const subject = 'Verify Your Account | ArtistePilot';

    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}&userId=${user.id}`;

    const text = `Please click on the link to verify your password: ${verificationUrl}`;

    const html = `
    <h1>Verify Email</h1>
    <p>Click the link below to verify your account</p>
    <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Verify Email</a>
    <p>If you didn't request this, please ignore this email.</p>
    `;

    return this.sendMail(user.email, subject, text, html);
  }

  // PASSWORD RESET EMAIL
  async sendPasswordResetEmail(user: User, resetToken: string) {
    const subject = 'Password Reset Request | ArtistePilot';
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
    const text = `Please click the following link to reset your password: ${resetUrl}`;
    const html = `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    return this.sendMail(user.email, subject, text, html);
  }

  // PASSWORD RESET CONFIRMATION EMAIL
  async sendPasswordResetSuccessConfirmationEmail(user: User) {
    const subject = 'Password Reset Successful | ArtistePilot';
    const displayName = user.firstName;
    const text = `Hello ${displayName}, your password has been successfully reset. If you didn't make this change, please contact our support team immediately.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4CAF50;">Password Reset Successful</h1>
        <p>Hello ${displayName},</p>
        <p>Your password has been successfully reset. You can now log in with your new password.</p>
        
        <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2196F3; margin-top: 0;">Security Notice</h3>
          <p>If you didn't make this change, please contact our support team immediately at:</p>
          <p><strong>Email:</strong> support@artistepilot.com</p>
          <p><strong>Phone:</strong> 07036513120</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Security Tips</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Use a strong, unique password</li>
            <li>Enable two-factor authentication if available</li>
            <li>Don't share your password with anyone</li>
            <li>Log out from public or shared devices</li>
          </ul>
        </div>

        <p>Thank you for keeping your account secure!</p>
        <p>Best regards,<br>The ArtistePilot Team</p>
      </div>
    `;

    return this.sendMail(user.email, subject, text, html);
  }
}
