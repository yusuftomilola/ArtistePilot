import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { NewsletterCategory } from '../enums/category.enum';

export class CreateNewsletterEmailDto {
  @IsNotEmpty()
  @IsEnum(NewsletterCategory)
  category: NewsletterCategory;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
