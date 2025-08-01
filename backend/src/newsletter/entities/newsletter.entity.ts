import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NewsletterCategory } from '../enums/category.enum';

@Entity({
  name: 'newsletters',
})
export class Newsletter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: NewsletterCategory,
    enumName: 'newsletter_category',
  })
  category: NewsletterCategory;

  @Column({
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    default: true,
  })
  isSubscribed: boolean;

  @CreateDateColumn()
  subscribedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
