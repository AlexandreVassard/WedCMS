import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { News } from './entities/news.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
  ) {}

  find(options?: FindManyOptions<News>) {
    return this.newsRepository.find(options);
  }

  findOne(options: FindOneOptions<News>) {
    return this.newsRepository.findOne(options);
  }
}
