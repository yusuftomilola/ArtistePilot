import { PartialType } from '@nestjs/swagger';
import { CreateSubscriberEmailDto } from './createSubscriberEmail.dto';

export class UpdateSubscriberEmailDto extends PartialType(
  CreateSubscriberEmailDto,
) {}
