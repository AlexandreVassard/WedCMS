import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessengerFriendsService } from './messenger-friends.service';
import { MessengerFriend } from './entities/messenger-friend.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MessengerFriend])],
  providers: [MessengerFriendsService],
  exports: [MessengerFriendsService],
})
export class MessengerFriendsModule {}
