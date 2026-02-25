import { Controller, Get, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { Layout } from 'src/common/decorators/layout.decorator';
import { Render } from 'src/common/decorators/render.decorator';
import { Page } from 'src/common/enums/page.enum';

@Layout('client')
@Controller('client')
export class ClientController {
  @Get()
  @Render(Page.CLIENT)
  getClient(
    @Req() req: Request,
    @Query('forwardType') forwardType: string,
    @Query('forwardId') forwardId: string,
  ) {
    const sso = (req.session as any)?.user?.ssoTicket ?? null;
    const forward = forwardType && forwardId ? { type: forwardType, id: forwardId } : null;
    return { sso, forward };
  }
}
