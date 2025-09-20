import { SetMetadata } from '@nestjs/common';

export const AUDIT_AUTH_KEY = 'audit_auth';

export const AuditAuth = (
  action:
    | 'login'
    | 'logout'
    | 'register'
    | 'password_change'
    | 'logout-all-sessions' = 'login',
) => SetMetadata(AUDIT_AUTH_KEY, action);
