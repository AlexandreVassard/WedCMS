import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Layout } from '../../common/decorators/layout.decorator';
import { Render } from '../../common/decorators/render.decorator';
import { Page } from '../../common/enums/page.enum';
import type { Request, Response } from 'express';
import { UsersService } from 'src/api/users/users.service';
import { RconService } from 'src/api/rcon/rcon.service';
import { User } from 'src/api/users/entities/user.entity';
import { RequireAuth } from 'src/common/decorators/require-auth.decorator';

@Layout('main')
@RequireAuth()
@Controller('preferences')
export class PreferencesController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rconService: RconService,
  ) {}

  @Get()
  @Render(Page.PREFERENCES)
  getIndex(
    @Query('success') success?: string,
    @Query('error') error?: string,
  ) {
    return {
      successMotto: success === 'motto',
      successPassword: success === 'password',
      errorPassword: error ? parseInt(error) : null,
    };
  }

  @Post('changeMotto')
  async changeMotto(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
  ) {
    const userId = (req as any).session?.user?.id;
    const user = await this.usersService.findOne({ where: { id: userId } });
    if (!user) return (res as any).redirect('/preferences');

    user.motto = body.motto ?? user.motto;
    await this.usersService.save(user);

    const { password, ...userWithoutPassword } = user;
    (req as any).session.user = { ...(req as any).session.user, ...userWithoutPassword };

    return (res as any).redirect('/preferences?success=motto');
  }

  @Post('changePassword')
  async changePassword(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
  ) {
    const { actualPassword, newPassword, newPasswordRepeat } = body;

    if (!newPassword || newPassword.length < 6) {
      return (res as any).redirect('/preferences?error=1');
    }
    if (newPassword !== newPasswordRepeat) {
      return (res as any).redirect('/preferences?error=2');
    }

    const userId = (req as any).session?.user?.id;
    const user = await this.usersService.findOne({ where: { id: userId } });
    if (!user) return (res as any).redirect('/preferences');

    const valid = await this.usersService.validatePassword(actualPassword, user.password);
    if (!valid) {
      return (res as any).redirect('/preferences?error=3');
    }

    user.password = await argon2.hash(newPassword);
    await this.usersService.save(user);

    return (res as any).redirect('/preferences?success=password');
  }

  @Get('look')
  @Render(`${Page.PREFERENCES}/${Page.LOOK}`)
  async getLook(@Req() req: Request) {
    const user = (req.session as any).user as User;
    if (!user) return;

    const hr = user.figure.substring(0, 5);
    const hd = user.figure.substring(5, 10);
    const ch = user.figure.substring(10, 15);
    const lg = user.figure.substring(15, 20);
    const sh = user.figure.substring(20, 25);
    const converted = hr + hd + lg + sh + ch;

    return { figure: converted, gender: user.sex };
  }

  @Get('look/update')
  async getLookUpdate(
    @Req() req: Request,
    @Res() res: Response,
    @Query('figure') figure?: string,
    @Query('gender') gender?: string,
  ) {
    if (!figure || !gender) return;
    const userId = (req.session as any).user?.id;
    const user = await this.usersService.findOne({
      where: { id: userId },
    });
    if (!user) return;

    const hr = figure.substring(0, 5);
    const hd = figure.substring(5, 10);
    const lg = figure.substring(10, 15);
    const sh = figure.substring(15, 20);
    const ch = figure.substring(20, 25);
    const converted = hr + hd + ch + lg + sh;

    user.figure = converted;
    user.sex = gender;
    await this.usersService.save(user);

    const { password, ...userWithoutPassword } = user;
    (req.session as any).user = userWithoutPassword;

    this.rconService.refreshLooks(user.id);
    res.redirect('/preferences/look');
  }
}
