import { Controller, Get, UseGuards } from '@nestjs/common';
import { HousekeepingSessionGuard } from '../housekeeping-session.guard';
import { SettingsService } from '../../settings/settings.service';

@Controller('api/housekeeping/stats')
@UseGuards(HousekeepingSessionGuard)
export class HousekeepingStatsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('online')
  async getOnlineCount() {
    const count = await this.settingsService.getPlayersOnline();
    return { count };
  }
}
