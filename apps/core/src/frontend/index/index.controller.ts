import { Controller, Get } from '@nestjs/common';
import { Layout } from '../../common/decorators/layout.decorator';
import { Render } from '../../common/decorators/render.decorator';
import { Page } from '../../common/enums/page.enum';
import { UsersService } from '../../api/users/users.service';
import { NewsService } from '../../api/news/news.service';
import { AnnouncementsService } from '../../api/announcements/announcements.service';
import { SettingsService } from '../../api/settings/settings.service';

@Layout('main')
@Controller()
export class IndexController {
  constructor(
    private readonly usersService: UsersService,
    private readonly newsService: NewsService,
    private readonly announcementsService: AnnouncementsService,
    private readonly settingsService: SettingsService,
  ) {}

  @Get()
  @Render(Page.INDEX)
  async getIndex() {
    const [homepages, snowstormRaw, battleballRaw, newsRaw, announcements, rare] = await Promise.all([
      this.usersService.find({ order: { createdAt: 'DESC' }, take: 5, select: ['username'] }),
      this.usersService.find({ order: { snowstormPoints: 'DESC' }, take: 5, select: ['username', 'snowstormPoints'] }),
      this.usersService.find({ order: { battleballPoints: 'DESC' }, take: 5, select: ['username', 'battleballPoints'] }),
      this.newsService.find({ order: { createdAt: 'DESC' } }),
      this.announcementsService.find({ order: { position: 'ASC' } }),
      this.settingsService.getRare(),
    ]);
    const snowstormPlayers = snowstormRaw.map(u => ({ username: u.username, points: u.snowstormPoints }));
    const battleballPlayers = battleballRaw.map(u => ({ username: u.username, points: u.battleballPoints }));
    const news = newsRaw.map(n => ({ id: n.id, title: n.title, date: n.createdAt.toLocaleDateString() }));
    return { homepages, snowstormPlayers, battleballPlayers, news, announcements, rare };
  }
}
