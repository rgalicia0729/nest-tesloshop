import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService
  ) { }

  async runSeed() {
    await this.productService.deleteAllProducts();
    const { products } = initialData;

    const productsPromises = [];
    products.forEach(product => {
      productsPromises.push(this.productService.create(product));
    });

    await Promise.all(productsPromises);

    return 'RUN SEED';
  }
}
