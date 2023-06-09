import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Product, ProductImage } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ) { }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.productRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const query = this.productRepository.createQueryBuilder('prod');
      product = await query.where('slug =:slug OR UPPER(title) =:title', {
        slug: term,
        title: term.toUpperCase()
      })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product) this.handleNotFound(term);

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    const { images = [], ...productDetails } = createProductDto;

    try {
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((image) => this.productImagesRepository.create({ url: image }))
      });
      await this.productRepository.save(product);

      return product;
    } catch (err) {
      this.handleDBExeption(err);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdateData } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdateData });

    if (!product) throw new NotFoundException(`Product with id: ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map(image => this.productImagesRepository.create({ url: image }));
      }

      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release()

      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.handleDBExeption(err);
    }
  }

  async remove(id: string) {
    const { affected } = await this.productRepository.delete({ id });
    if (affected === 0) this.handleNotFound(id);
  }

  private handleDBExeption(err: any) {
    if (err.code === '23505') {
      throw new BadRequestException(err.detail);
    }

    this.logger.error(err);
    throw new InternalServerErrorException('Unexpected error, something went wrong');
  }

  private handleNotFound(id: string) {
    throw new NotFoundException(`The product with ID: ${id} not found`);
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (err) {
      this.handleDBExeption(err)
    }
  }
}
