import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBan } from './entities/user-ban.entity.js';

@Injectable()
export class BansService {
  constructor(
    @InjectRepository(UserBan) private readonly bansRepository: Repository<UserBan>,
  ) {}

  findByUserId(userId: number): Promise<UserBan | null> {
    return this.bansRepository.findOne({
      where: { bannedValue: userId.toString(), banType: 'USER_ID' },
    });
  }

  save(ban: UserBan): Promise<UserBan> {
    return this.bansRepository.save(ban);
  }

  async removeByUserId(userId: number): Promise<void> {
    await this.bansRepository.delete({ bannedValue: userId.toString(), banType: 'USER_ID' });
  }
}
