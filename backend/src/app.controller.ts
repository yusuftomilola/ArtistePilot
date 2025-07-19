import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { IsPublic } from './auth/decorators/public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@IsPublic()
@Controller()
@ApiTags()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Homepage',
    description: 'public get route to the homepage',
  })
  @ApiResponse({
    status: 200,
    description: 'Homepage loaded successfully',
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health',
    description: 'health check status of the server',
  })
  @ApiResponse({
    status: 200,
    description: 'health check retrieved successfully',
  })
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
