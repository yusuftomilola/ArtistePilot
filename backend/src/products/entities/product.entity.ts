import { Transaction } from 'src/transactions/entities/transaction.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  name: string;

  @Column({
    nullable: true,
  })
  description?: string;

  @Column({
    nullable: false,
    type: 'integer',
  })
  amount: number;

  @OneToMany(() => Transaction, (transaction) => transaction.product)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;
}
