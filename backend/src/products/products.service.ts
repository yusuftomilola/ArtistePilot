import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/createProduct.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  public async createProduct(createProductDto: CreateProductDto) {
    const existingProduct = await this.productRepository.findOne({
      where: {
        name: createProductDto.name,
      },
    });

    if (existingProduct) {
      throw new ConflictException('Product already exists');
    }

    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);

      return {
        status: true,
        message: 'Product created successfully',
        product,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  public async deleteProduct(productId: number) {
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    try {
      await this.productRepository.remove(product);
      return {
        status: true,
        message: 'Product deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete the product');
    }
  }
}
