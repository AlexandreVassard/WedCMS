import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserIpLog } from './entities/user-ip-log.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(UserIpLog)
    private readonly ipLogsRepository: Repository<UserIpLog>,
  ) {}

  async validatePassword(plaintext: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, plaintext);
  }

  findOne(options: FindOneOptions<User>) {
    return this.usersRepository.findOne(options);
  }

  find(options?: FindManyOptions<User>) {
    return this.usersRepository.find(options);
  }

  save(user: User) {
    return this.usersRepository.save(user);
  }

  delete(id: number) {
    return this.usersRepository.delete(id);
  }

  findIpLogs(userId: number) {
    return this.ipLogsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }
}
