import { Module } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { Newsletter } from './entities/newsletter.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailchimpModule } from 'src/mailchimp/mailchimp.module';

@Module({
  imports: [TypeOrmModule.forFeature([Newsletter]), MailchimpModule],
  providers: [NewsletterService],
  controllers: [NewsletterController],
})
export class NewsletterModule {}
