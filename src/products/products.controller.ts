import {  Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductDto } from './dto/product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll() {
    return this.productsService.getAllProducts();
  }
  @Get(":code")
  async findByCode(@Param() productDto: ProductDto) {

  }
}
