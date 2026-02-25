import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { HousekeepingSessionGuard } from '../housekeeping-session.guard';
import { SettingsService } from '../../settings/settings.service';

@Controller('api/housekeeping/settings')
@UseGuards(HousekeepingSessionGuard)
export class HousekeepingSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Patch(':key')
  update(@Param('key') key: string, @Body('value') value: string) {
    return this.settingsService.update(key, value);
  }
}
