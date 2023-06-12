import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/auth/entities/user.entity';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,
    private readonly authService: AuthService
  ) { }

  async insertUsers(): Promise<User> {
    const { users } = initialData;

    const usersPromises = [];
    users.forEach(user => {
      usersPromises.push(this.authService.signup(user));
    });

    await Promise.all(usersPromises);

    return usersPromises[0];
  }

  async insertProducts(user: User) {
    const { products } = initialData;

    const productsPromises = [];
    products.forEach(product => {
      productsPromises.push(this.productService.create(product, user));
    });

    await Promise.all(productsPromises);
  }

  async runSeed() {
    await this.productService.deleteAllProducts();
    await this.authService.deleteAllUsers();

    const user = await this.insertUsers();
    await this.insertProducts(user);

    return 'RUN SEED';
  }
}
