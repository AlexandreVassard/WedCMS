import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement) private readonly announcementsRepository: Repository<Announcement>,
  ) {}

  find(options?: FindManyOptions<Announcement>) {
    return this.announcementsRepository.find(options);
  }
}
