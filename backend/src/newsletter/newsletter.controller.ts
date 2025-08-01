import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { IsPublic } from 'src/auth/decorators/public.decorator';
import { CreateNewsletterEmailDto } from './dto/createNewsletterEmail.dto';
import { EmailDto } from './dto/email.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/roles.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Newsletter')
@Controller('api/v1/newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @IsPublic()
  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  @ApiBody({ type: CreateNewsletterEmailDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully subscribed to the newsletter',
  })
  public async subscribe(
    @Body() createNewsletterEmailDto: CreateNewsletterEmailDto,
  ) {
    return await this.newsletterService.subscribe(createNewsletterEmailDto);
  }

  @IsPublic()
  @Post('unsubscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsubscribe from newsletter' })
  @ApiBody({ type: EmailDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully unsubscribed from the newsletter',
  })
  public async unSubscribe(@Body() email: EmailDto) {
    return await this.newsletterService.unsubscribe(email.email);
  }

  @IsPublic()
  @Post('resubscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resubscribe to newsletter' })
  @ApiBody({ type: EmailDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully resubscribed to the newsletter',
  })
  public async reSubscribe(@Body() email: EmailDto) {
    return await this.newsletterService.resubscribe(email.email);
  }

  @Get('subscribers')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all newsletter subscribers (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all newsletter subscribers',
  })
  public async getAllSubscribers() {
    return await this.newsletterService.getAllSubscribers();
  }
}
