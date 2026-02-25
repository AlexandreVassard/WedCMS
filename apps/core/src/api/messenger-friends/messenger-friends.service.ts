import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { MessengerFriend } from './entities/messenger-friend.entity';

@Injectable()
export class MessengerFriendsService {
  constructor(
    @InjectRepository(MessengerFriend)
    private messengerFriendsRepository: Repository<MessengerFriend>,
  ) {}

  find(options?: FindManyOptions<MessengerFriend>) {
    return this.messengerFriendsRepository.find(options);
  }
}
