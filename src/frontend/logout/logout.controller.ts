import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('logout')
export class LogoutController {
  @Get()
  getLogout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy(() => {
      res.redirect('/');
    });
  }
}
