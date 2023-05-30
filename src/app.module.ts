import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST,
      username: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
      port: +process.env.PG_PORT,
      database: process.env.PG_DB_NAME,
      autoLoadEntities: true,
      synchronize: true
    }),
    ProductsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }