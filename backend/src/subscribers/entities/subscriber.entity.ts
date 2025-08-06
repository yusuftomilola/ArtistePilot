import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubscriberCategory } from '../enums/category.enum';

@Entity({
  name: 'subscribers',
})
export class Subscriber {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: SubscriberCategory,
    enumName: 'subscriber_category',
  })
  category: SubscriberCategory;

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
