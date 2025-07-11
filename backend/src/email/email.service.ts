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
}
