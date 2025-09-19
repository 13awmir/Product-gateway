import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import axios from "axios";
import { AuthService } from "../auth/auth.service";
import { Repository } from "typeorm";
import { ProductEntity } from "./entity/product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import ProductDto from "./dto/product.dto";
import { createObjectCsvWriter } from "csv-writer";
import * as path from "path";
import * as fs from "fs";

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

  async findAllFromDb() {
    const products = await this.ProductRepository.find({ where: {} });
    return products;
  }
  async exportToCsv(): Promise<string> {
    const products = await this.ProductRepository.find();
    const exportDir = path.join(process.cwd(), "exports");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const csvPath = path.join(exportDir, `products-${dateStr}.csv`);
    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: "ID", title: "ID" },
        { id: "Type", title: "Type" },
        { id: "SKU", title: "SKU" },
        { id: "Name", title: "Name" },
        { id: "Slug", title: "Slug" },
        { id: "Published", title: "Published" },
        { id: "IsFeatured", title: "Is featured?" },
        { id: "Visibility", title: "Visibility in catalog" },
        { id: "ShortDesc", title: "Short description" },
        { id: "Description", title: "Description" },
        { id: "TaxStatus", title: "Tax status" },
        { id: "TaxClass", title: "Tax class" },
        { id: "InStock", title: "In stock?" },
        { id: "Stock", title: "Stock" },
        { id: "RegularPrice", title: "Regular price" },
        { id: "SalePrice", title: "Sale price" },
        { id: "Categories", title: "Categories" },
        { id: "Images", title: "Images" },
        { id: "DownloadLimit", title: "Download limit" },
        { id: "DownloadExpiry", title: "Download expiry days" },
        { id: "Parent", title: "Parent" },
        { id: "Grouped", title: "Grouped products" },
        { id: "Upsells", title: "Upsells" },
        { id: "CrossSells", title: "Cross-sells" },
        { id: "ExternalUrl", title: "External URL" },
        { id: "ButtonText", title: "Button text" },
        { id: "Position", title: "Position" },
      ],
      alwaysQuote: true,
    });

    const records = products.map((p) => {
      const priceRial = p.price ?? 0;
      const priceToman = Math.floor(priceRial / 10);

      return {
        ID: "",
        Type: "simple",
        SKU: p.code ?? "",
        Name: p.name ?? "",
        Slug: p.name ? p.name.replace(/\s+/g, "-").toLowerCase() : "",
        Published: 1,
        IsFeatured: 0,
        Visibility: "visible",
        ShortDesc: p.name?.slice(0, 150) ?? "",
        Description: p.name ?? "",
        TaxStatus: "taxable",
        TaxClass: "",
        InStock: p.quantity && p.quantity > 0 ? 1 : 0,
        Stock: p.quantity ?? "",
        RegularPrice: priceToman * 1.2,
        SalePrice: priceToman,
        Categories: "",
        Images: "",
        DownloadLimit: "",
        DownloadExpiry: "",
        Parent: "",
        Grouped: "",
        Upsells: "",
        CrossSells: "",
        ExternalUrl: "",
        ButtonText: "",
        Position: 0,
      };
    });

    await csvWriter.writeRecords(records);
    const buffer = fs.readFileSync(csvPath);
    await fs.writeFileSync(csvPath, "\uFEFF" + buffer.toString("utf8"));

    return csvPath;
  }
}
