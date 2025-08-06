import { Module } from '@nestjs/common';
import { SubscriberService } from './subscribers.service';
import { SubscriberController } from './subscribers.controller';
import { Subscriber } from './entities/subscriber.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailchimpModule } from 'src/mailchimp/mailchimp.module';

@Module({
  imports: [TypeOrmModule.forFeature([Subscriber]), MailchimpModule],
  providers: [SubscriberService],
  controllers: [SubscriberController],
})
export class SubscriberModule {}
