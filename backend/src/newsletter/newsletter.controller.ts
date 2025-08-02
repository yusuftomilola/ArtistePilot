import {
  All,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { IsPublic } from 'src/auth/decorators/public.decorator';
import { CreateNewsletterEmailDto } from './dto/createNewsletterEmail.dto';
import { EmailDto } from './dto/email.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/roles.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import * as crypto from 'crypto';

@ApiTags('Newsletter')
@Controller('api/v1/newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @IsPublic()
  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  @ApiBody({ type: CreateNewsletterEmailDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully subscribed to the newsletter',
  })
  public async subscribe(
    @Body() createNewsletterEmailDto: CreateNewsletterEmailDto,
  ) {
    return await this.newsletterService.subscribe(createNewsletterEmailDto);
  }

  @IsPublic()
  @Post('unsubscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsubscribe from newsletter' })
  @ApiBody({ type: EmailDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully unsubscribed from the newsletter',
  })
  public async unSubscribe(@Body() email: EmailDto) {
    return await this.newsletterService.unsubscribe(email.email);
  }

  @IsPublic()
  @Post('resubscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resubscribe to newsletter' })
  @ApiBody({ type: EmailDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully resubscribed to the newsletter',
  })
  public async reSubscribe(@Body() email: EmailDto) {
    return await this.newsletterService.resubscribe(email.email);
  }

  @Get('subscribers')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all newsletter subscribers (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all newsletter subscribers',
  })
  @ApiBearerAuth()
  public async getAllSubscribers() {
    return await this.newsletterService.getAllSubscribers();
  }

  private verifyMailchimpSignature(
    signature: string,
    body: string,
    webhookSecret: string,
  ): boolean {
    if (!signature || !webhookSecret) {
      return false;
    }

    try {
      // Mailchimp uses HMAC-SHA256 with base64 encoding
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('base64');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      );
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  @IsPublic()
  @All('webhook')
  @ApiOperation({ summary: 'Mailchimp webhook endpoint' })
  @HttpCode(HttpStatus.OK)
  public async handleWebhook(@Req() req: Request) {
    try {
      // Handle GET requests (Mailchimp webhook verification)
      if (req.method === 'GET') {
        console.log('Webhook verification request received');
        return 'OK';
      }

      // Handle POST requests (actual webhook data)
      if (req.method === 'POST') {
        console.log('Webhook POST request received');

        // Get the signature from headers
        const signature = req.headers['x-mc-signature'] as string;
        const webhookSecret = process.env.MAILCHIMP_WEBHOOK_SECRET;

        // If webhook secret is configured, verify the signature
        if (webhookSecret) {
          const rawBody = JSON.stringify(req.body);
          const isValidSignature = this.verifyMailchimpSignature(
            signature,
            rawBody,
            webhookSecret,
          );

          if (!isValidSignature) {
            console.error('Invalid webhook signature');
            // Still return OK to prevent Mailchimp from retrying
            // But you might want to log this for security monitoring
            return 'OK';
          }
        } else {
          console.warn(
            'MAILCHIMP_WEBHOOK_SECRET not configured - skipping signature verification',
          );
        }

        const payload = req.body;
        console.log('Webhook payload:', JSON.stringify(payload, null, 2));

        const email = payload?.data?.email;
        const event = payload?.type;

        if (!email || !event) {
          console.log('Missing email or event type in webhook payload');
          return 'OK';
        }

        console.log(`Processing webhook event: ${event} for email: ${email}`);

        // Handle different webhook events
        switch (event) {
          case 'unsubscribe':
            await this.newsletterService.setSubscriptionStatus(email, false);
            console.log(`Unsubscribed: ${email}`);
            break;

          case 'subscribe':
            await this.newsletterService.setSubscriptionStatus(email, true);
            console.log(`Subscribed: ${email}`);
            break;

          default:
            console.log(`Unhandled webhook event: ${event}`);
        }
      }

      return 'OK';
    } catch (error) {
      console.error('Webhook processing error:', error);
      // Always return OK to prevent Mailchimp from retrying
      // Log the error for debugging purposes
      return 'OK';
    }
  }
}
