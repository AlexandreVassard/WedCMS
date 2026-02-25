import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement) private readonly announcementsRepository: Repository<Announcement>,
  ) {}

  find(options?: FindManyOptions<Announcement>) {
    return this.announcementsRepository.find(options);
  }

  findOne(options: FindOneOptions<Announcement>) {
    return this.announcementsRepository.findOne(options);
  }

  save(announcement: DeepPartial<Announcement>) {
    return this.announcementsRepository.save(announcement);
  }

  delete(id: number) {
    return this.announcementsRepository.delete(id);
  }
}
