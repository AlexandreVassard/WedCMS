import { Module } from '@nestjs/common';
import { HabboImagingController } from './habbo-imaging.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [HabboImagingController],
})
export class HabboImagingModule {}
