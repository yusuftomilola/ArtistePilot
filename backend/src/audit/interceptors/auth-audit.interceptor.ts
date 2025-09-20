import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AuditService } from '../providers/audit.service';
import { AuditContextService } from '../providers/audit.context';
import { AUDIT_AUTH_KEY } from '../decorators/audit.decorator';
import { AUDIT_CONFIG } from '../config/audit.config';
import { AuditAction } from '../enums/auditAction.enum';

@Injectable()
export class AuthAuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
    private readonly auditContext: AuditContextService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!AUDIT_CONFIG.enableAuthAuditing) {
      return next.handle();
    }

    const authAction = this.reflector.get<string>(
      AUDIT_AUTH_KEY,
      context.getHandler(),
    );

    if (!authAction) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    return next.handle().pipe(
      tap((result) => {
        setImmediate(async () => {
          try {
            const endTime = Date.now();
            const duration = endTime - startTime;
            const controllerName = context.getClass().name;
            const handlerName = context.getHandler().name;

            // Extract user data from multiple possible sources
            let userId, userEmail;

            // Try to get user from result (login/register response)
            if (result?.user?.id) {
              userId = result.user.id;
              userEmail = result.user.email;
            }
            // Try to get user from result directly (if user object is returned directly)
            else if (result?.id && result?.email) {
              userId = result.id;
              userEmail = result.email;
            }
            // Try to get user from request (if already authenticated)
            else if (request.user?.id) {
              userId = request.user.id;
              userEmail = request.user.email;
            }
            // Try to get user from request body (login/register attempt)
            else if (request.body?.email || request.body?.username) {
              userEmail = request.body.email || request.body.username;
              // For failed attempts or registration, we might not have userId yet
            }

            const auditContextData = {
              userId: userId?.toString(),
              userEmail,
              ipAddress: request.ip || request.connection.remoteAddress,
              userAgent: request.headers['user-agent'],
              endpoint: request.url,
              httpMethod: request.method,
              requestId: request.headers['x-request-id'],
            };

            // Set context with error handling
            try {
              this.auditContext.set(auditContextData);
            } catch (contextError) {
              console.error('Failed to set audit context:', contextError);
            }

            // Map auth actions to AuditAction enum values
            const action = this.mapAuthActionToAuditAction(authAction);

            await this.auditService.log(
              'Authentication',
              action,
              userId?.toString(), // entityId should be the userId for auth events
              null,
              null,
              {
                authAction,
                success: this.isSuccessfulResponse(response.statusCode),
                userAgent: auditContextData.userAgent,
                ipAddress: auditContextData.ipAddress,
                // Include API call details in auth log
                endpoint: `${controllerName}.${handlerName}`,
                statusCode: response.statusCode,
                duration,
                params: request.params,
                query: request.query,
                // Add debugging info
                resultKeys: result ? Object.keys(result) : [],
                requestUserExists: !!request.user,
              },
            );

            // Debug logging to help identify the structure
            console.log('Auth Audit Debug:', {
              authAction,
              mappedAction: action,
              resultStructure: result ? Object.keys(result) : 'no result',
              requestUser: request.user
                ? Object.keys(request.user)
                : 'no request.user',
              extractedUserId: userId,
              extractedUserEmail: userEmail,
              statusCode: response.statusCode,
              success: this.isSuccessfulResponse(response.statusCode),
            });
          } catch (auditError) {
            console.error('Failed to log authentication event:', auditError);
          }
        });
      }),
    );
  }

  /**
   * Maps auth action strings to AuditAction enum values
   * This provides a centralized mapping that can be easily extended for future auth actions
   */
  private mapAuthActionToAuditAction(authAction: string): AuditAction {
    const actionMap: Record<string, AuditAction> = {
      login: AuditAction.LOGIN,
      logout: AuditAction.LOGOUT,
      register: AuditAction.REGISTER,
      password_change: AuditAction.PASSWORD_CHANGE,
      'logout-all-sessions': AuditAction.LOGOUT_ALL_SESSIONS,
      // Add future auth actions here as they're introduced
      // 'reset_password': AuditAction.RESET_PASSWORD,
      // '2fa_enable': AuditAction.TWO_FA_ENABLE,
      // etc.
    };

    return actionMap[authAction] || AuditAction.API_CALL; // Fallback to API_CALL if action not mapped
  }

  /**
   * Determines if the response indicates a successful operation
   * Can be extended to handle different success criteria for different auth actions
   */
  private isSuccessfulResponse(statusCode: number): boolean {
    return statusCode >= 200 && statusCode < 300;
  }
}
