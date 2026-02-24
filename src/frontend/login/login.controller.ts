import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { Layout } from 'src/common/decorators/layout.decorator';
import { Render } from 'src/common/decorators/render.decorator';
import { Page } from 'src/common/enums/page.enum';
import * as express from 'express';
import { UsersService } from 'src/api/users/users.service';

@Layout('login')
@Controller('login')
export class LoginController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Render(Page.LOGIN)
  getLogin(
    @Query('error') error?: string,
    @Query('fromClient') fromClient?: string,
    @Query('redirect') redirect?: string,
  ) {
    const loginAction = redirect
      ? `/login?redirect=${encodeURIComponent(redirect)}`
      : '/login';
    return {
      fromClient,
      loginErrorId: error ? parseInt(error, 10) : 0,
      loginAction,
    };
  }

  @Post()
  async postLogin(
    @Body() body: { username: string; password: string },
    @Req() req: express.Request,
    @Res() res: express.Response,
    @Query('redirect') redirect?: string,
  ) {
    const user = await this.usersService.findOne({
      where: { username: body.username },
    });

    if (!user) {
      return res.redirect('/login?error=1');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      body.password,
      user.password,
    );

    if (!isPasswordValid) {
      return res.redirect('/login?error=2');
    }

    if (user.rank === 0) {
      return res.redirect('/login?error=3');
    }

    const { password, ...userWithoutPassword } = user;
    (req.session as any).user = userWithoutPassword;

    req.session.save(() => {
      res.redirect(redirect || '/');
    });
  }
}
