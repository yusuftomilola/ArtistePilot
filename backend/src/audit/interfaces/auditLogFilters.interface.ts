import { AuditAction } from '../enums/auditAction.enum';

export interface AuditLogFilters {
  entityName?: string;
  entityId?: string;
  action?: AuditAction;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
