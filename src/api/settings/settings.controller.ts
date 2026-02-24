import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingKey } from './enums/setting-key.enum';

@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(':settingKey')
  async getSetting(@Param('settingKey') settingKey: SettingKey) {
    const setting = await this.settingsService.getSetting(settingKey);
    if (!setting) throw new NotFoundException('setting not found');
    return setting;
  }
}
