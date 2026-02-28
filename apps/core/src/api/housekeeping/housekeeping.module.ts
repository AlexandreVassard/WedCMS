import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { NewsModule } from '../news/news.module';
import { AnnouncementsModule } from '../announcements/announcements.module';
import { RoomsModule } from '../rooms/rooms.module';
import { SettingsModule } from '../settings/settings.module';
import { RconModule } from '../rcon/rcon.module';
import { RanksModule } from '../ranks/ranks.module';
import { CataloguePagesModule } from '../catalogue-pages/catalogue-pages.module';
import { BansModule } from '../bans/bans.module';
import { HousekeepingAuthController } from './auth/housekeeping-auth.controller';
import { HousekeepingUsersController } from './users/housekeeping-users.controller';
import { HousekeepingNewsController } from './news/housekeeping-news.controller';
import { HousekeepingAnnouncementsController } from './announcements/housekeeping-announcements.controller';
import { HousekeepingRoomsController } from './rooms/housekeeping-rooms.controller';
import { HousekeepingSettingsController } from './settings/housekeeping-settings.controller';
import { HousekeepingRconController } from './rcon/housekeeping-rcon.controller';
import { HousekeepingRanksController } from './ranks/housekeeping-ranks.controller';
import { HousekeepingFuserightsController } from './ranks/housekeeping-fuserights.controller';
import { HousekeepingCatalogueController } from './catalogue/housekeeping-catalogue.controller';
import { HousekeepingStatsController } from './stats/housekeeping-stats.controller';

@Module({
  imports: [
    UsersModule,
    NewsModule,
    AnnouncementsModule,
    RoomsModule,
    SettingsModule,
    RconModule,
    RanksModule,
    CataloguePagesModule,
    BansModule,
  ],
  controllers: [
    HousekeepingAuthController,
    HousekeepingUsersController,
    HousekeepingNewsController,
    HousekeepingAnnouncementsController,
    HousekeepingRoomsController,
    HousekeepingSettingsController,
    HousekeepingRconController,
    HousekeepingRanksController,
    HousekeepingFuserightsController,
    HousekeepingCatalogueController,
    HousekeepingStatsController,
  ],
})
export class HousekeepingModule {}
