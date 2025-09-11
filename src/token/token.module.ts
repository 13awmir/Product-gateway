import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenEntity } from './token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TokenEntity])],
  exports: [TypeOrmModule.forFeature([TokenEntity])],
})
export class TokenModule {}
