import { Controller, Get } from '@nestjs/common';
import { Layout } from '../../common/decorators/layout.decorator';
import { Render } from '../../common/decorators/render.decorator';
import { Page } from '../../common/enums/page.enum';

@Layout('main')
@Controller('club')
export class ClubController {
  @Get()
  @Render(Page.CLUB)
  getClub() {}

  @Get(Page.HABBO_CLUB_BENEFITS)
  @Render(`${Page.CLUB}/${Page.HABBO_CLUB_BENEFITS}`)
  getHabboClubBenefits() {}

  @Get(Page.JOIN_HABBO_CLUB)
  @Render(`${Page.CLUB}/${Page.JOIN_HABBO_CLUB}`)
  getJoinHabboClub() {}

  @Get(Page.HABBO_CLUB_FURNI)
  @Render(`${Page.CLUB}/${Page.HABBO_CLUB_FURNI}`)
  getHabboClubFurni() {}
}
