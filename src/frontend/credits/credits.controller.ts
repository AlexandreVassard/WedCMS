import { Controller, Get } from '@nestjs/common';
import { Layout } from '../../common/decorators/layout.decorator';
import { Render } from '../../common/decorators/render.decorator';
import { Page } from '../../common/enums/page.enum';

@Layout('main')
@Controller('credits')
export class CreditsController {
  @Get()
  @Render(Page.CREDITS)
  getCredits() {}

  @Get(Page.PAYPAL)
  @Render(`${Page.CREDITS}/${Page.PAYPAL}`)
  getPaypal() {}

  @Get(Page.USE_MY_CREDITS)
  @Render(`${Page.CREDITS}/${Page.USE_MY_CREDITS}`)
  getUseMyCredits() {}
}
