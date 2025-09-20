export const AUDIT_CONFIG = {
  enableApiAuditing: false,
  enableAuthAuditing: true,
  enableEntityAuditing: true,

  // New option to control double logging
  skipApiLoggingForAuthEndpoints: true, // Set to false if you want both logs

  excludeEndpoints: ['/health', '/metrics', '/swagger', '/api-docs'],

  excludeEntities: [
    'AuditLog', // Don't audit the audit logs themselves
  ],

  excludeFields: ['createdAt', 'updatedAt', 'version'],

  sensitiveFields: [
    'password',
    'passwordHash',
    'token',
    'refreshToken',
    'secret',
    'apiKey',
    'privateKey',
    'accessToken',
    'sessionId',
  ],
};
