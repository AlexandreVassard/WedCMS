import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { HousekeepingSessionGuard } from '../housekeeping-session.guard';
import { NewsService } from '../../news/news.service';

@Controller('api/housekeeping/news')
@UseGuards(HousekeepingSessionGuard)
export class HousekeepingNewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findAll() {
    return this.newsService.find({ order: { createdAt: 'DESC' } });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const news = await this.newsService.findOne({ where: { id: parseInt(id, 10) } });
    if (!news) throw new NotFoundException();
    return news;
  }

  @Post()
  create(@Body() body: { title: string; description: string }) {
    return this.newsService.save(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string },
  ) {
    const news = await this.newsService.findOne({ where: { id: parseInt(id, 10) } });
    if (!news) throw new NotFoundException();
    return this.newsService.save({ ...news, ...body });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsService.delete(parseInt(id, 10));
  }
}
