import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rank } from './entities/rank.entity';

@Injectable()
export class RanksService implements OnModuleInit {
  constructor(
    @InjectRepository(Rank) private ranksRepository: Repository<Rank>,
  ) {}

  async onModuleInit() {
    for (let id = 1; id <= 6; id++) {
      const exists = await this.ranksRepository.findOne({ where: { id } });
      if (!exists) {
        await this.ranksRepository.save({ id, name: `Rank ${id}` });
      }
    }
  }

  findAll() {
    return this.ranksRepository.find({ order: { id: 'ASC' } });
  }

  update(id: number, name: string) {
    return this.ranksRepository.save({ id, name });
  }
}
