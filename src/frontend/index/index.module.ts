import { Module } from '@nestjs/common';
import { IndexController } from './index.controller';
import { UsersModule } from '../../api/users/users.module';
import { NewsModule } from '../../api/news/news.module';
import { AnnouncementsModule } from '../../api/announcements/announcements.module';
import { SettingsModule } from '../../api/settings/settings.module';

@Module({
  imports: [UsersModule, NewsModule, AnnouncementsModule, SettingsModule],
  controllers: [IndexController],
})
export class IndexModule {}
