import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenEntity } from '../token/token.entity';
import { AuthService } from './auth.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([TokenEntity])],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
