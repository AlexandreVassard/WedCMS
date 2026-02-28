import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SettingsModule],
  controllers: [StatsController],
})
export class StatsModule {}
