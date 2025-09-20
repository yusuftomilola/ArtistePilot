import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/roles.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsPublic } from 'src/auth/decorators/public.decorator';

@Controller('products')
@ApiTags('Products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(UserRole.ADMIN)
  @Post('create')
  @ApiBearerAuth()
  public async createProduct(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.createProduct(createProductDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete('delete/:id')
  @ApiBearerAuth()
  public async deleteProduct(@Param('id', ParseIntPipe) productId: number) {
    return await this.productsService.deleteProduct(productId);
  }

  @IsPublic()
  @Get()
  public async getProducts() {
    return await this.productsService.getProducts();
  }
}
