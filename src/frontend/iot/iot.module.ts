import { Module } from '@nestjs/common';
import { UsersModule } from 'src/api/users/users.module';
import { IotController } from './iot.controller';

@Module({
  imports: [UsersModule],
  controllers: [IotController],
})
export class IotModule {}
