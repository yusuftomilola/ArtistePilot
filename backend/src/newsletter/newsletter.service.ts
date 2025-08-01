import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Newsletter } from './entities/newsletter.entity';
import { Repository } from 'typeorm';
import { CreateNewsletterEmailDto } from './dto/createNewsletterEmail.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(Newsletter)
    private readonly newsletterEmailRepository: Repository<Newsletter>,
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
}
