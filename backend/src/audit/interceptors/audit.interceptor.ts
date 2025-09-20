import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditService } from '../providers/audit.service';
import { AuditContextService } from '../providers/audit.context';
import { Reflector } from '@nestjs/core';
import { AUDIT_CONFIG } from '../config/audit.config';
import { AuditAction } from '../enums/auditAction.enum';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private auditService: AuditService,
    private reflector: Reflector,
    private readonly auditContextService: AuditContextService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!AUDIT_CONFIG.enableApiAuditing) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const method = request.method;
    const url = request.url;
    const userAgent = request.headers['user-agent'];
    const ipAddress = request.ip || request.connection.remoteAddress;
    const user = request.user;

    // Skip excluded endpoints
    if (
      AUDIT_CONFIG.excludeEndpoints.some((endpoint) => url.includes(endpoint))
    ) {
      return next.handle();
    }

    // Set audit context
    const auditContext = {
      userId: user?.id,
      userEmail: user?.email,
      ipAddress,
      userAgent,
      endpoint: url,
      httpMethod: method,
      requestId: request.headers['x-request-id'] || this.generateRequestId(),
    };

    const startTime = Date.now();
    let hasError = false;
    let errorInfo: any = null;

    // Set audit context
    try {
      this.auditContextService.set(auditContext);
    } catch (error) {
      console.error('Failed to set audit context:', error);
    }

    return next.handle().pipe(
      tap((data) => {
        // Log success asynchronously without blocking the response
        setImmediate(async () => {
          try {
            const endTime = Date.now();
            const duration = endTime - startTime;
            const controllerName = context.getClass().name;
            const handlerName = context.getHandler().name;

            await this.auditService.log(
              'API',
              AuditAction.API_CALL,
              `${controllerName}.${handlerName}`,
              null,
              null,
              {
                statusCode: response.statusCode,
                duration,
                responseSize: this.getResponseSize(data),
                params: request.params,
                query: request.query,
                body: this.sanitizeRequestBody(request.body),
              },
            );
          } catch (auditError) {
            console.error('Failed to log successful API call:', auditError);
          }
        });
      }),
      catchError((error) => {
        hasError = true;
        errorInfo = error;

        // Log error asynchronously without blocking error propagation
        setImmediate(async () => {
          try {
            const endTime = Date.now();
            const duration = endTime - startTime;
            const controllerName = context.getClass().name;
            const handlerName = context.getHandler().name;

            await this.auditService.log(
              'API',
              AuditAction.API_CALL,
              `${controllerName}.${handlerName}`,
              null,
              null,
              {
                statusCode: response.statusCode || 500,
                duration,
                error: error.message,
                stack: error.stack,
                params: request.params,
                query: request.query,
                body: this.sanitizeRequestBody(request.body),
              },
            );
          } catch (auditError) {
            console.error('Failed to log failed API call:', auditError);
          }
        });

        return throwError(() => error);
      }),
    );
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private getResponseSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }

  private sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sanitized = { ...body };
    AUDIT_CONFIG.sensitiveFields.forEach((field) => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
