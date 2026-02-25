import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { NewsService } from './news.service';

@Module({
  imports: [TypeOrmModule.forFeature([News])],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
