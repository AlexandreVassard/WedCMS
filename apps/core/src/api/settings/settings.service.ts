import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { SettingKey } from './enums/setting-key.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SettingsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Setting) private settingsRepository: Repository<Setting>,
  ) {}

  getSetting(setting: SettingKey) {
    return this.settingsRepository.findOne({ where: { setting } });
  }

  findAll() {
    return this.settingsRepository.find({ order: { setting: 'ASC' } });
  }

  async update(key: string, value: string) {
    await this.settingsRepository.save({ setting: key, value });
    await this.cacheManager.del('settings.app');
  }

  async getPlayersOnline(): Promise<number> {
    const cached = await this.cacheManager.get<number>('stats.online');
    if (cached !== undefined && cached !== null) return cached;
    const row = await this.getSetting(SettingKey.PLAYERS_ONLINE);
    const count = row ? parseInt(row.value, 10) : 0;
    await this.cacheManager.set('stats.online', count, 5_000);
    return count;
  }

  async getRare() {
    const row = await this.getSetting(SettingKey.RARE);
    if (!row) return null;
    try {
      return JSON.parse(row.value) as { imageName: string; name: string; description: string; price: number };
    } catch {
      return null;
    }
  }

  // Will eventually load from DB; cache the result
  async getAppSettings() {
    let appSettings = await this.cacheManager.get('settings.app');

    if (appSettings) {
      Logger.debug('Return cached app settings', 'SettingsService');
      return appSettings;
    }

    appSettings = { title: 'WedCMS', view: 'us', enter: 'us' };

    Logger.debug('Caching app settings', 'SettingsService');
    await this.cacheManager.set('settings.app', appSettings);

    return appSettings;
  }
}
