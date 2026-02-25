import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { pipeline } from 'stream';
import { promisify } from 'util';

const streamPipeline = promisify(pipeline);

@Controller('habbo-imaging')
export class HabboImagingController {
  constructor(private readonly configService: ConfigService) {}

  @Get('avatarimage')
  async getAvatarImage(@Req() req: Request, @Res() res: Response) {
    const minervaUrl = this.configService.get<string>('MINERVA_URL');

    const queryString = new URLSearchParams(req.query as any).toString();

    const upstream = await fetch(
      `${minervaUrl}/habbo-imaging/avatarimage?${queryString}`,
    );

    if (!upstream.ok || !upstream.body) {
      return res.status(upstream.status || 500).send('Error fetching image');
    }

    res.setHeader(
      'Content-Type',
      upstream.headers.get('content-type') || 'image/png',
    );

    await streamPipeline(upstream.body, res);
  }
}
