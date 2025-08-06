import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { SubscriberCategory } from '../enums/category.enum';

export class CreateSubscriberEmailDto {
  @IsNotEmpty()
  @IsEnum(SubscriberCategory)
  category: SubscriberCategory;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
