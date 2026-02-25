import { Module } from '@nestjs/common';
import { NewsModule as ApiNewsModule } from '../../api/news/news.module';
import { NewsController } from './news.controller';

@Module({
  imports: [ApiNewsModule],
  controllers: [NewsController],
})
export class NewsModule {}
