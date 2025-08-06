import { IsNotEmpty, IsNumber } from 'class-validator';

export class InitializeTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;
}
