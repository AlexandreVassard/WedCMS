import { Controller, Get } from '@nestjs/common';
import { Layout } from 'src/common/decorators/layout.decorator';
import { Render } from 'src/common/decorators/render.decorator';
import { Page } from 'src/common/enums/page.enum';
import { NewsService } from '../../api/news/news.service';

@Layout('main')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @Render(Page.NEWS)
  async getNews() {
    const raw = await this.newsService.find({ order: { createdAt: 'DESC' } });
    const news = raw.map(n => ({
      id: n.id,
      title: n.title,
      date: n.createdAt.toLocaleDateString(),
    }));
    return { news };
  }
}
