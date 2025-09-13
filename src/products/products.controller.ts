import { Controller, Get, Param } from "@nestjs/common";
import { ProductsService } from "./products.service";
import ProductDto from "./dto/product.dto";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll() {
    return this.productsService.getAllProducts();
  }
  // @Get("sync")
  // async syncProduct() {
  //   return this.productsService.syncProducts();
  // }
  @Get("find/:code")
  async findByCode(@Param() findDto: ProductDto) {
    return this.productsService.findByCode(findDto);
  }

  @Get("all")
  findAllFromDb() {
    return this.productsService.findAllFromDb();
  }
}
