import { Controller, Get, Param, Res } from "@nestjs/common";
import { ProductsService } from "./products.service";
import ProductDto from "./dto/product.dto";
import { Response } from "express";
import * as fs from "fs";

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
  @Get("export-csv")
  async exportCsv(@Res() res: Response) {
    const filePath = await this.productsService.exportToCsv();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="products.csv"');
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
}
