import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenEntity } from './token/token.entity';
import { TokenModule } from './token/token.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import * as dotenv from 'dotenv';
import { ProductEntity } from './products/entity/product.entity';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [TokenEntity,ProductEntity],
      synchronize: true, 
    }),
    TokenModule,
    AuthModule,
    ProductsModule,
  ],
})
export class AppModule {}
