import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface AuditContext {
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  httpMethod?: string;
  requestId?: string;
}

@Injectable()
export class AuditContextService {
  private asyncLocalStorage = new AsyncLocalStorage<AuditContext>();

  set(context: AuditContext): void {
    this.asyncLocalStorage.enterWith(context);
  }

  get(): AuditContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  getRequestId(): string | undefined {
    return this.get()?.requestId;
  }

  getUserId(): string | undefined {
    return this.get()?.userId;
  }

  getUserEmail(): string | undefined {
    return this.get()?.userEmail;
  }

  getIpAddress(): string | undefined {
    return this.get()?.ipAddress;
  }
}
