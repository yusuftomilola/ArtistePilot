import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuditService } from './providers/audit.service';
import { AuditAction } from './enums/auditAction.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/roles.enum';

@Controller('api/v1/audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async getAuditLogs(
    @Query('entityName') entityName?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: AuditAction,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number = 50,
  ) {
    const filters = {
      entityName,
      entityId,
      action,
      userId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page,
      limit: Math.min(limit, 100),
    };

    return this.auditService.getAuditLogs(filters);
  }
}
