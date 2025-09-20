import { AuditAction } from '../enums/auditAction.enum';

export interface CreateAuditLogDto {
  entityName: string;
  entityId?: string;
  action: AuditAction;
  userId?: string;
  userEmail?: string;
  description?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  httpMethod?: string;
}
