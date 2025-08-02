import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Newsletter } from './entities/newsletter.entity';
import { Repository } from 'typeorm';
import { CreateNewsletterEmailDto } from './dto/createNewsletterEmail.dto';
import { MailchimpService } from 'src/mailchimp/mailchimp.service';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(Newsletter)
    private readonly newsletterEmailRepository: Repository<Newsletter>,

    private readonly mailchimpService: MailchimpService,
  ) {}

  public async subscribe(createNewsletterEmailDto: CreateNewsletterEmailDto) {
    const existing = await this.newsletterEmailRepository.findOne({
      where: {
        email: createNewsletterEmailDto.email,
      },
    });

    if (existing) {
      if (existing.isSubscribed) {
        throw new ConflictException('You are already subscribed');
      }

      existing.isSubscribed = true;
      await this.newsletterEmailRepository.save(existing);

      return 'You have been resubscribed successfully';
    }

    const newSubscriber = this.newsletterEmailRepository.create(
      createNewsletterEmailDto,
    );
    await this.newsletterEmailRepository.save(newSubscriber);
    await this.mailchimpService.subscribeUser(createNewsletterEmailDto.email);
    return 'You have been subscribed successfully';
  }

  public async unsubscribe(email: string) {
    const existing = await this.newsletterEmailRepository.findOne({
      where: {
        email,
      },
    });

    if (!existing) {
      throw new NotFoundException('Email not found');
    }

    if (!existing.isSubscribed) {
      return 'You are already unsubscribed';
    }

    existing.isSubscribed = false;
    await this.newsletterEmailRepository.save(existing);

    // reflect in mailchimp
    await this.mailchimpService.updateUserStatus(email, 'unsubscribed');

    return 'You have been unsubscribed successfully';
  }

  public async resubscribe(email: string) {
    const existing = await this.newsletterEmailRepository.findOne({
      where: {
        email,
      },
    });

    if (!existing) {
      throw new NotFoundException('Email not found');
    }

    if (existing.isSubscribed) {
      return 'You are already subscribed';
    }

    existing.isSubscribed = true;
    await this.newsletterEmailRepository.save(existing);

    //reflect in mailchimp
    await this.mailchimpService.updateUserStatus(email, 'subscribed');

    return 'You have been resubscribed successfully';
  }

  public async getAllSubscribers() {
    const subscribers = await this.newsletterEmailRepository.find({
      where: { isSubscribed: true },
    });

    return {
      subscribers,
    };
  }

  public async setSubscriptionStatus(email: string, isSubscribed: boolean) {
    try {
      console.log(
        `Attempting to update subscription status for ${email} to ${isSubscribed}`,
      );

      const user = await this.newsletterEmailRepository.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        console.log(`User not found in database: ${email}`);
        // Create a new user entry if they don't exist
        const newUser = this.newsletterEmailRepository.create({
          email,
          isSubscribed,
        });
        await this.newsletterEmailRepository.save(newUser);
        console.log(
          `Created new user entry for ${email} with status ${isSubscribed}`,
        );
        return;
      }

      if (user.isSubscribed === isSubscribed) {
        console.log(
          `User ${email} already has status ${isSubscribed}, no update needed`,
        );
        return;
      }

      const previousStatus = user.isSubscribed;
      user.isSubscribed = isSubscribed;
      await this.newsletterEmailRepository.save(user);

      console.log(
        `Successfully updated ${email} from ${previousStatus} to ${isSubscribed}`,
      );
    } catch (error) {
      console.error(`Error updating subscription status for ${email}:`, error);
      throw error;
    }
  }
}
