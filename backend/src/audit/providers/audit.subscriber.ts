import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  LoadEvent,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AUDIT_CONFIG } from '../config/audit.config';
import { AuditAction } from '../enums/auditAction.enum';

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(private auditService: AuditService) {}

  async afterInsert(event: InsertEvent<any>) {
    if (!AUDIT_CONFIG.enableEntityAuditing) return;
    if (AUDIT_CONFIG.excludeEntities.includes(event.metadata.name)) return;

    await this.auditService.log(
      event.metadata.name,
      AuditAction.CREATE,
      event.entity?.id,
      null,
      event.entity,
    );
  }

  async afterUpdate(event: UpdateEvent<any>) {
    if (!AUDIT_CONFIG.enableEntityAuditing) return;
    if (AUDIT_CONFIG.excludeEntities.includes(event.metadata.name)) return;

    await this.auditService.log(
      event.metadata.name,
      AuditAction.UPDATE,
      event.entity?.id || event.databaseEntity?.id,
      event.databaseEntity,
      event.entity,
    );
  }

  async afterRemove(event: RemoveEvent<any>) {
    if (!AUDIT_CONFIG.enableEntityAuditing) return;
    if (AUDIT_CONFIG.excludeEntities.includes(event.metadata.name)) return;

    await this.auditService.log(
      event.metadata.name,
      AuditAction.DELETE,
      event.entity?.id || event.databaseEntity?.id,
      event.databaseEntity || event.entity,
      null,
    );
  }

  async afterLoad(entity: any, event?: LoadEvent<any>) {
    // Optional: Log read operations (can be very verbose)
    // Uncomment if you want to track data access
    /*
    if (!AUDIT_CONFIG.enableEntityAuditing) return;
    if (event && !AUDIT_CONFIG.excludeEntities.includes(event.metadata.name)) {
      await this.auditService.log(
        event.metadata.name,
        AuditAction.READ,
        entity?.id,
        null,
        null,
        { loadedFields: Object.keys(entity || {}) }
      );
    }
    */
  }
}
