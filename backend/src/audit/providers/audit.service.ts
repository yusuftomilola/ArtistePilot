import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditContextService } from './audit.context';
import { AUDIT_CONFIG } from '../config/audit.config';
import { AuditAction } from '../enums/auditAction.enum';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private auditContext: AuditContextService,
  ) {}

  async log(
    entityName: string,
    action: AuditAction,
    entityId?: string,
    oldValues?: any,
    newValues?: any,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      const context = this.auditContext.get();

      // Skip if entity is excluded
      if (AUDIT_CONFIG.excludeEntities.includes(entityName)) {
        return;
      }

      const sanitizedOldValues = this.sanitizeData(oldValues);
      const sanitizedNewValues = this.sanitizeData(newValues);
      const changes = this.calculateChanges(
        sanitizedOldValues,
        sanitizedNewValues,
      );

      const auditLog = this.auditLogRepository.create({
        entityName,
        entityId: entityId?.toString(),
        action,
        userId: context?.userId,
        userEmail: context?.userEmail,
        oldValues: sanitizedOldValues,
        newValues: sanitizedNewValues,
        changes,
        metadata: metadata || {},
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        endpoint: context?.endpoint,
        httpMethod: context?.httpMethod,
        description: this.generateDescription(entityName, action, changes),
      });

      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      // Silent fail to prevent audit logging from breaking the application
      console.error('Failed to create audit log:', error);
    }
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    // Remove sensitive and excluded fields
    const fieldsToRemove = [
      ...AUDIT_CONFIG.excludeFields,
      ...AUDIT_CONFIG.sensitiveFields,
    ];

    const sanitizeObject = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;

      const result = Array.isArray(obj) ? [] : {};

      for (const [key, value] of Object.entries(obj)) {
        if (
          fieldsToRemove.some((field) =>
            key.toLowerCase().includes(field.toLowerCase()),
          )
        ) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          result[key] = sanitizeObject(value);
        } else if (typeof value !== 'function') {
          result[key] = value;
        }
      }

      return result;
    };

    return sanitizeObject(sanitized);
  }

  private calculateChanges(
    oldValues: any,
    newValues: any,
  ): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};

    if (!oldValues || !newValues) return changes;

    const allKeys = new Set([
      ...Object.keys(oldValues || {}),
      ...Object.keys(newValues || {}),
    ]);

    for (const key of allKeys) {
      const oldVal = oldValues?.[key];
      const newVal = newValues?.[key];

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes[key] = {
          old: oldVal,
          new: newVal,
        };
      }
    }

    return changes;
  }

  private generateDescription(
    entityName: string,
    action: AuditAction,
    changes?: Record<string, any>,
  ): string {
    const changeCount = changes ? Object.keys(changes).length : 0;

    switch (action) {
      case AuditAction.CREATE:
        return `Created new ${entityName}`;
      case AuditAction.UPDATE:
        return `Updated ${entityName}${changeCount > 0 ? ` (${changeCount} fields changed)` : ''}`;
      case AuditAction.DELETE:
        return `Deleted ${entityName}`;
      case AuditAction.READ:
        return `Accessed ${entityName}`;
      case AuditAction.LOGIN:
        return `User logged in`;
      case AuditAction.LOGOUT:
        return `User logged out`;
      case AuditAction.REGISTER:
        return `user registered`;
      case AuditAction.PASSWORD_CHANGE:
        return `password changed by user`;
      case AuditAction.LOGOUT_ALL_SESSIONS:
        return `user logged out of all sessions`;
      case AuditAction.API_CALL:
        return `API call to ${entityName}`;
      default:
        return `${action} on ${entityName}`;
    }
  }

  // Query methods remain the same as before
  async getAuditLogs(filters: any = {}) {
    const {
      entityName,
      entityId,
      action,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = filters;

    const query = this.auditLogRepository.createQueryBuilder('audit');

    if (entityName)
      query.andWhere('audit.entityName = :entityName', { entityName });
    if (entityId) query.andWhere('audit.entityId = :entityId', { entityId });
    if (action) query.andWhere('audit.action = :action', { action });
    if (userId) query.andWhere('audit.userId = :userId', { userId });
    if (startDate)
      query.andWhere('audit.createdAt >= :startDate', { startDate });
    if (endDate) query.andWhere('audit.createdAt <= :endDate', { endDate });

    const [data, total] = await query
      .orderBy('audit.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
