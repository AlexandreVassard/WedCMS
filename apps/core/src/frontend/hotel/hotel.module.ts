import { Module } from '@nestjs/common';
import { HotelController } from './hotel.controller';

@Module({
  controllers: [HotelController],
})
export class HotelModule {}
