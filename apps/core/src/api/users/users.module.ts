import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserIpLog } from './entities/user-ip-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserIpLog])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
