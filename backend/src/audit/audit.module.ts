import { Global, Module } from '@nestjs/common';
import { AuditService } from './providers/audit.service';
import { AuditController } from './audit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditSubscriber } from './providers/audit.subscriber';
import { AuditContextService } from './providers/audit.context';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditService, AuditSubscriber, AuditContextService],
  controllers: [AuditController],
  exports: [AuditService, AuditContextService],
})
export class AuditModule {}
