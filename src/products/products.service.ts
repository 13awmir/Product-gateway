import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(private readonly auth: AuthService) {}

  async getAllProducts() {
    const token = await this.auth.getToken();
    try {
      const res = await axios.get(process.env.API_PRODUCTS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      this.logger.error('Failed to fetch products', err);
      throw err;
    }
  }
}
