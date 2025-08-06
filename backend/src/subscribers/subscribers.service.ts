import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscriber } from './entities/subscriber.entity';
import { Repository } from 'typeorm';
import { CreateSubscriberEmailDto } from './dto/createSubscriberEmail.dto';
import { MailchimpService } from 'src/mailchimp/mailchimp.service';

@Injectable()
export class SubscriberService {
  constructor(
    @InjectRepository(Subscriber)
    private readonly subscriberEmailRepository: Repository<Subscriber>,

    private readonly mailchimpService: MailchimpService,
  ) {}

  public async subscribe(createSubscriberEmailDto: CreateSubscriberEmailDto) {
    const existing = await this.subscriberEmailRepository.findOne({
      where: {
        email: createSubscriberEmailDto.email,
      },
    });

    if (existing) {
      if (existing.isSubscribed) {
        throw new ConflictException('You are already subscribed');
      }

      existing.isSubscribed = true;
      await this.subscriberEmailRepository.save(existing);

      return 'You have been resubscribed successfully';
    }

    const newSubscriber = this.subscriberEmailRepository.create(
      createSubscriberEmailDto,
    );
    await this.subscriberEmailRepository.save(newSubscriber);
    await this.mailchimpService.subscribeUser(createSubscriberEmailDto.email);
    return 'You have been subscribed successfully';
  }

  public async unsubscribe(email: string) {
    const existing = await this.subscriberEmailRepository.findOne({
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
    await this.subscriberEmailRepository.save(existing);

    // reflect in mailchimp
    await this.mailchimpService.updateUserStatus(email, 'unsubscribed');

    return 'You have been unsubscribed successfully';
  }

  public async resubscribe(email: string) {
    const existing = await this.subscriberEmailRepository.findOne({
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
    await this.subscriberEmailRepository.save(existing);

    //reflect in mailchimp
    await this.mailchimpService.updateUserStatus(email, 'subscribed');

    return 'You have been resubscribed successfully';
  }

  public async getAllSubscribers() {
    const subscribers = await this.subscriberEmailRepository.find({
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

      const user = await this.subscriberEmailRepository.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        console.log(`User not found in database: ${email}`);
        // Create a new user entry if they don't exist
        const newUser = this.subscriberEmailRepository.create({
          email,
          isSubscribed,
        });
        await this.subscriberEmailRepository.save(newUser);
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
      await this.subscriberEmailRepository.save(user);

      console.log(
        `Successfully updated ${email} from ${previousStatus} to ${isSubscribed}`,
      );
    } catch (error) {
      console.error(`Error updating subscription status for ${email}:`, error);
      throw error;
    }
  }
}
