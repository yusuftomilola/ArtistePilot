import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditAction } from '../enums/auditAction.enum';

@Entity({ name: 'audit-logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    type: 'varchar',
    length: 100,
  })
  entityName: string;

  @Column({
    nullable: true,
    type: 'varchar',
    length: 100,
  })
  entityId: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({
    nullable: true,
    type: 'uuid',
  })
  userId: string;

  @Column({
    nullable: true,
    type: 'varchar',
    length: 100,
  })
  userEmail: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  description: string;

  @Column({
    nullable: true,
    type: 'inet',
  })
  ipAddress: string;

  @Column({
    nullable: true,
    type: 'varchar',
    length: 500,
  })
  userAgent: string;

  @Column({
    nullable: true,
    type: 'varchar',
    length: 200,
  })
  endpoint: string;

  @Column({
    nullable: true,
    type: 'varchar',
    length: 10,
  })
  httpMethod: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  changes: Record<string, { old: any; new: any }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
