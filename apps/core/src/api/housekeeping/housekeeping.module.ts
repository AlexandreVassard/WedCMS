import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { NewsModule } from '../news/news.module';
import { AnnouncementsModule } from '../announcements/announcements.module';
import { RoomsModule } from '../rooms/rooms.module';
import { SettingsModule } from '../settings/settings.module';
import { RconModule } from '../rcon/rcon.module';
import { HousekeepingAuthController } from './auth/housekeeping-auth.controller';
import { HousekeepingUsersController } from './users/housekeeping-users.controller';
import { HousekeepingNewsController } from './news/housekeeping-news.controller';
import { HousekeepingAnnouncementsController } from './announcements/housekeeping-announcements.controller';
import { HousekeepingRoomsController } from './rooms/housekeeping-rooms.controller';
import { HousekeepingSettingsController } from './settings/housekeeping-settings.controller';
import { HousekeepingRconController } from './rcon/housekeeping-rcon.controller';

@Module({
  imports: [
    UsersModule,
    NewsModule,
    AnnouncementsModule,
    RoomsModule,
    SettingsModule,
    RconModule,
  ],
  controllers: [
    HousekeepingAuthController,
    HousekeepingUsersController,
    HousekeepingNewsController,
    HousekeepingAnnouncementsController,
    HousekeepingRoomsController,
    HousekeepingSettingsController,
    HousekeepingRconController,
  ],
})
export class HousekeepingModule {}
