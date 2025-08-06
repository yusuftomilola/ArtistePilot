import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { InitializeTransactionDto } from './dto/initializeTransaction.dto';
import { IsPublic } from 'src/auth/decorators/public.decorator';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaystackCallbackDto, PaystackWebhookDto } from './dto/paystack.dto';
import { PAYSTACK_WEBHOOK_SIGNATURE_KEY } from 'src/constants';
import { Response } from 'express';

@Controller('transactions')
@ApiTags('Transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('/initialize')
  @ApiBearerAuth()
  public async initializeTransaction(
    @Body() initializeTransactionDto: InitializeTransactionDto,
    @GetUser() currentUser: User,
  ) {
    return await this.transactionsService.initializeTransaction(
      initializeTransactionDto,
      currentUser,
    );
  }

  @IsPublic()
  @Post('/webhook')
  @HttpCode(HttpStatus.OK)
  public async paymentWebhookHandler(
    @Body() paystackWebhookDto: PaystackWebhookDto,
    @Headers() headers = {},
  ) {
    const result = await this.transactionsService.handlePaystackWebhook(
      paystackWebhookDto,
      `${headers[PAYSTACK_WEBHOOK_SIGNATURE_KEY]}`,
    );

    if (!result) {
      throw new BadRequestException();
    }
  }

  @IsPublic()
  @Get('/callback')
  public async verifyTransaction(
    @Query() paystackCallbackQueryDto: PaystackCallbackDto,
    @Res() res: Response,
  ) {
    const transaction = await this.transactionsService.verifyTransaction(
      paystackCallbackQueryDto,
    );

    const redirectUrl = `http://localhost:3001/payment-result?reference=${transaction.transactionReference}`;

    return res.redirect(redirectUrl);
  }

  @Get('/:reference')
  @ApiBearerAuth()
  public async getTransactionByReference(
    @Param('reference') reference: string,
  ) {
    return await this.transactionsService.getTransactionByReference(reference);
  }
}
