import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/api/users/users.module';

@Module({
  imports: [ConfigModule, UsersModule],
  controllers: [LoginController],
})
export class LoginModule {}
