import { Controller, Get } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';

@Controller('api/stats')
export class StatsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('online')
  async getOnlineCount() {
    const count = await this.settingsService.getPlayersOnline();
    return { count };
  }
}
