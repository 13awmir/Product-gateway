import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import axios from "axios";
import { AuthService } from "../auth/auth.service";
import { Repository } from "typeorm";
import { ProductEntity } from "./entity/product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import ProductDto from "./dto/product.dto";
import CreateProductDto from "./dto/createProduct.dto";

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(
    private readonly auth: AuthService,
    @InjectRepository(ProductEntity)
    private ProductRepository: Repository<ProductEntity>
  ) {}

  async getAllProducts() {
    const token = await this.auth.getToken();
    try {
      const res = await axios.get(process.env.API_PRODUCTS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { data } = res.data;
      return await this.syncProducts(data);
      // return res.data;
    } catch (err) {
      this.logger.error("Failed to fetch products", err);
      throw err;
    }
  }
  async syncProducts(data) {
    // const { data } = await this.getAllProducts();
    for (const item of data) {
      if (!item.quantity || item.quantity === 0) {
        this.logger.warn(
          ` Skipped product [${item.code}] because quantity is 0`
        );
        continue;
      }
      const existProduct = await this.ProductRepository.findOne({
        where: { code: item.code },
      });
      if (existProduct) {
        existProduct.name = item.name;
        existProduct.price = item.price;
        existProduct.quantity = item.quantity;
        await this.ProductRepository.save(existProduct);
      } else {
        const newProduct = this.ProductRepository.create({
          code: item.code,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        });
        await this.ProductRepository.save(newProduct);
      }
    }
    return {
      message: "synced successfully",
      data,
    };
  }

  async findByCode(code: ProductDto) {
    const product = await this.ProductRepository.findOneBy(code);
    if (!product) throw new NotFoundException("product not found");
    return { product };
  }
}
