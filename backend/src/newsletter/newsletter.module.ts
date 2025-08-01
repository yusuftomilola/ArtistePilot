import { Module } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { Newsletter } from './entities/newsletter.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Newsletter])],
  providers: [NewsletterService],
  controllers: [NewsletterController],
})
export class NewsletterModule {}
