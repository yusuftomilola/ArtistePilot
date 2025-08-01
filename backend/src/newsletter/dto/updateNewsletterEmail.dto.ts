import { PartialType } from '@nestjs/swagger';
import { CreateNewsletterEmailDto } from './createNewsletterEmail.dto';

export class UpdateNewsletterEmailDto extends PartialType(
  CreateNewsletterEmailDto,
) {}
