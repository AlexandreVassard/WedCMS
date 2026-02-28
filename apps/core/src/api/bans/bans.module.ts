import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBan } from './entities/user-ban.entity.js';
import { BansService } from './bans.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([UserBan])],
  providers: [BansService],
  exports: [BansService],
})
export class BansModule {}
