import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { TextsService } from './texts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { SettingsController } from './settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Setting])],
  controllers: [SettingsController],
  providers: [SettingsService, TextsService],
  exports: [SettingsService, TextsService],
})
export class SettingsModule {}
