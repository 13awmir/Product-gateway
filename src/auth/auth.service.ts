import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TokenEntity } from "../token/token.entity";
import * as dotenv from "dotenv";

dotenv.config();

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly tokenName = "api_jwt";

  constructor(
    @InjectRepository(TokenEntity)
    private tokenRepo: Repository<TokenEntity>
  ) {}

  async getToken(): Promise<string> {
    const now = Date.now();
    const record = await this.tokenRepo.findOneBy({ name: this.tokenName });

    if (record && record.token && Number(record.expiresAt) > now + 5000) {
      return record.token;
    }

    try {
      const res = await axios.post(
        process.env.API_AUTH_URL,
        {
          name: process.env.API_USER,
          password: process.env.API_PASS,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const token = res.data?.token;
      if (!token) throw new Error("Token not found in auth response");

      const expiresAt = Date.now() + 55 * 60 * 1000;

      if (record) {
        record.token = token;
        record.expiresAt = expiresAt;
        await this.tokenRepo.save(record);
      } else {
        await this.tokenRepo.save({ name: this.tokenName, token, expiresAt });
      }
      return token;
    } catch (err) {
      this.logger.error("Failed to get token", err);
      throw err;
    }
  }
}
