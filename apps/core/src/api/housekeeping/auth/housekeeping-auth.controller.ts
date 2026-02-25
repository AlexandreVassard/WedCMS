import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

@Controller('api/housekeeping/auth')
export class HousekeepingAuthController {
  @Get('session')
  getSession(@Req() req: Request) {
    const user = (req.session as any).user;
    if (!user || user.rank < 5) {
      throw new UnauthorizedException();
    }
    return { id: user.id, username: user.username, rank: user.rank, figure: user.figure };
  }
}
