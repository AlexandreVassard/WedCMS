import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import * as argon2 from 'argon2';
import type { Response } from 'express';
import { Layout } from '../../common/decorators/layout.decorator';
import { Render } from '../../common/decorators/render.decorator';
import { Page } from '../../common/enums/page.enum';
import { UsersService } from '../../api/users/users.service';
import { User } from '../../api/users/entities/user.entity';

@Layout('register')
@Controller()
export class RegisterController {
  constructor(private readonly usersService: UsersService) {}

  @Get('register')
  @Render(Page.REGISTER)
  getRegister(
    @Query('error') error?: string,
    @Query('username') username?: string,
    @Query('email') email?: string,
    @Query('birthday') birthday?: string,
  ) {
    return {
      errorRegister: error ? parseInt(error, 10) : null,
      post: { username: username ?? '', email: email ?? '' },
      birthday: birthday ?? '',
    };
  }

  @Post('register')
  postRegisterStep1(
    @Body() body: { 'required-birth'?: string },
    @Res() res: Response,
  ) {
    const birthday = body['required-birth'] ?? '';
    return res.redirect(`/register?birthday=${encodeURIComponent(birthday)}`);
  }

  @Post('registerSubmit')
  async postRegister(
    @Body() body: { username: string; email: string; password: string; passwordRepeat: string; sex?: string; birthday?: string },
    @Res() res: Response,
  ) {
    const { username, email, password, passwordRepeat, sex, birthday } = body;
    const usernameParam = `&username=${encodeURIComponent(username ?? '')}`;
    const emailParam = `&email=${encodeURIComponent(email ?? '')}`;
    const birthdayParam = `&birthday=${encodeURIComponent(birthday ?? '')}`;

    if (password !== passwordRepeat) {
      return res.redirect(`/register?error=1${usernameParam}${emailParam}${birthdayParam}`);
    }

    if (!password || password.length < 6) {
      return res.redirect(`/register?error=4${usernameParam}${emailParam}${birthdayParam}`);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.redirect(`/register?error=2${usernameParam}${birthdayParam}`);
    }

    const existing = await this.usersService.findOne({ where: { username } });
    if (existing) {
      return res.redirect(`/register?error=3${usernameParam}${emailParam}${birthdayParam}`);
    }

    const hashedPassword = await argon2.hash(password);
    const user = new User({ username, password: hashedPassword, email, birthday: birthday ?? '', sex: sex ?? 'M' });
    await this.usersService.save(user);

    return res.redirect('/login');
  }
}
