import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import * as express from 'express';
import { UsersService } from 'src/api/users/users.service';
import { Layout } from 'src/common/decorators/layout.decorator';
import { Render } from 'src/common/decorators/render.decorator';
import { Page } from 'src/common/enums/page.enum';

@Layout('iot')
@Controller('iot')
export class IotController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Render(Page.IOT)
  getIot(
    @Query('error') error?: string,
    @Query('alreadyPosted') alreadyPosted?: string,
  ) {
    return {
      alreadyPosted: !!alreadyPosted,
      errorUsername: error ?? null,
    };
  }

  @Get('step/2')
  @Render('step2')
  getIotStep2Get(@Query('username') username: string) {
    return { username };
  }

  @Post('step/2')
  async postIotStep2(
    @Body() body: { username: string },
    @Res() res: express.Response,
  ) {
    const user = await this.usersService.findOne({
      where: { username: body.username },
    });

    if (!user) {
      return res.redirect('/iot?error=Username+not+found');
    }

    return res.redirect(
      `/iot/step/2?username=${encodeURIComponent(body.username)}`,
    );
  }

  @Post('step/3')
  @Render('step3')
  getIotStep3(@Body() body: { username: string; mail: string }) {
    return { username: body.username, mail: body.mail };
  }

  @Post('step/4')
  @Render('step4')
  getIotStep4() {
    return {};
  }
}
