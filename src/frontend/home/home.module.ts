import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { UsersModule } from 'src/api/users/users.module';
import { SettingsModule } from 'src/api/settings/settings.module';
import { RoomsModule } from 'src/api/rooms/rooms.module';
import { MessengerFriendsModule } from 'src/api/messenger-friends/messenger-friends.module';

@Module({
  imports: [UsersModule, SettingsModule, RoomsModule, MessengerFriendsModule],
  controllers: [HomeController],
})
export class HomeModule {}
