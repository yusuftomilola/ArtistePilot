import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { ConfigService } from '@nestjs/config';
import { InitializeTransactionDto } from './dto/initializeTransaction.dto';
import { User } from 'src/users/entities/user.entity';
import {
  PaystackCallbackDto,
  PaystackCreateTransactionDto,
  PaystackCreateTransactionResponseDto,
  PaystackMetadata,
  PaystackVerifyTransactionResponseDto,
  PaystackWebhookDto,
} from './dto/paystack.dto';
import axios, { AxiosResponse } from 'axios';
import {
  PAYSTACK_SUCCESS_STATUS,
  PAYSTACK_TRANSACTION_INITIALIZATION_URL,
  PAYSTACK_TRANSACTION_VERIFY_BASE_URL,
  PAYSTACK_WEBHOOK_CRYPTO_ALGO,
} from 'src/constants';
import { PaymentStatus } from './enums/paymentStatus.enum';
import { TransactionStatus } from './enums/transactionStatus.enum';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly configService: ConfigService,
  ) {}

  public async initializeTransaction(
    initializeTransactionDto: InitializeTransactionDto,
    currentUser: User,
  ): Promise<Transaction | null> {
    const { productId } = initializeTransactionDto;

    const product = await this.productRepository.findOne({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const metadata: PaystackMetadata = {
      user_id: currentUser.id,
      product_id: product.id,
      custom_fields: [
        {
          display_name: 'Name',
          variable_name: 'name',
          value: currentUser.firstName + ' ' + currentUser.lastName,
        },
        {
          display_name: 'Email',
          variable_name: 'email',
          value: currentUser.email,
        },
      ],
    };

    const paystackCreateTransactionDto: PaystackCreateTransactionDto = {
      email: currentUser.email,
      amount: product.amount,
      metadata,
    };

    // OPTIONAL-NOT NECESSARY: ADD THIS IF YOU WANT TO OVERRIDE THE CALLBACK URL INPUTED IN PAYSTACK SETTINGS
    const paystackCallbackUrl = this.configService.get('PAYSTACK_CALLBACK_URL');

    if (paystackCallbackUrl) {
      paystackCreateTransactionDto.callback_url = paystackCallbackUrl;
    }

    const payload = JSON.stringify(paystackCreateTransactionDto);

    let result: PaystackCreateTransactionResponseDto;

    try {
      const response = await axios.post<PaystackCreateTransactionResponseDto>(
        PAYSTACK_TRANSACTION_INITIALIZATION_URL,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.configService.get('PAYSTACK_SECRET_KEY')}`,
            'Content-Type': 'application/json',
          },
        },
      );

      result = response.data;
      console.log(result);
    } catch (error) {
      console.error(
        'Paystack initialization error:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException('Failed to initialize payment.');
    }

    const data = result.data;

    if (result.status === true) {
      const transaction = this.transactionRepository.create({
        transactionReference: data.reference,
        paymentLink: data.authorization_url,
        product: product,
        user: currentUser,
      });

      return await this.transactionRepository.save(transaction);
    }

    return null;
  }

  public async handlePaystackWebhook(
    paystackWebhookDto: PaystackWebhookDto,
    signature: string,
  ): Promise<boolean> {
    if (!paystackWebhookDto.data) {
      return false;
    }

    let isValidEvent = false;

    try {
      const hash = createHmac(
        PAYSTACK_WEBHOOK_CRYPTO_ALGO,
        this.configService.get<string>('PAYSTACK_SECRET_KEY'),
      )
        .update(JSON.stringify(paystackWebhookDto))
        .digest('hex');

      isValidEvent =
        hash &&
        signature &&
        timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
    } catch (error) {
      return null;
    }

    if (!isValidEvent) {
      return false;
    }

    const transaction = await this.transactionRepository.findOne({
      where: {
        transactionReference: paystackWebhookDto.data.reference,
      },
    });

    const transactionStatus = paystackWebhookDto.data.status;
    const paymentConfirmed = transactionStatus === PAYSTACK_SUCCESS_STATUS;

    if (paymentConfirmed) {
      transaction.paymentStatus = PaymentStatus.PAID;
      transaction.transactionStatus = TransactionStatus.SUCCESS;
    } else {
      transaction.paymentStatus = PaymentStatus.NOT_PAID;
      transaction.transactionStatus = TransactionStatus.FAILED;
    }

    await this.transactionRepository.save(transaction);

    return true;
  }

  public async verifyTransaction(
    paystackCallbackQueryDto: PaystackCallbackDto,
  ): Promise<Transaction | null> {
    const { reference } = paystackCallbackQueryDto;

    const transaction = await this.transactionRepository.findOne({
      where: {
        transactionReference: reference,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const transactionReference = transaction.transactionReference;
    const url = `${PAYSTACK_TRANSACTION_VERIFY_BASE_URL}/${transactionReference}`;
    let response: AxiosResponse<PaystackVerifyTransactionResponseDto>;

    try {
      response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${this.configService.get('PAYSTACK_SECRET_KEY')}`,
        },
      });
      console.log(response.data);
    } catch (error) {
      throw new InternalServerErrorException('Error verifying transaction');
    }

    if (!response) {
      return null;
    }

    const result = response.data;
    const transactionStatus = result?.data?.status;
    const paymentConfirmed = transactionStatus === PAYSTACK_SUCCESS_STATUS;

    if (paymentConfirmed) {
      transaction.paymentStatus = PaymentStatus.PAID;
      transaction.transactionStatus = TransactionStatus.SUCCESS;
    } else {
      transaction.paymentStatus = PaymentStatus.NOT_PAID;
      transaction.transactionStatus = TransactionStatus.FAILED;
    }

    return await this.transactionRepository.save(transaction);
  }

  public async getTransactionByReference(reference: string) {
    const transaction = await this.transactionRepository.findOne({
      where: {
        transactionReference: reference,
      },
      relations: ['product', 'user'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const frontendTransactionResponse = {
      status: true,
      message: 'verified successfully',
      transactionReference: transaction.transactionReference,
      transactionStatus: transaction.transactionStatus,
      paymentStatus: transaction.paymentStatus,
      product: {
        name: transaction.product.name,
        amount: transaction.product.amount,
      },
      user: {
        name: transaction.user.firstName + ' ' + transaction.user.lastName,
        email: transaction.user.email,
      },
    };

    return frontendTransactionResponse;
  }
}
