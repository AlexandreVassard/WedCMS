import {
  Controller,
  Get,
  Inject,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { Response } from 'express';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import sharp from 'sharp';

@Controller('badge')
export class BadgesController {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  @Get(':filename')
  async getBadge(@Param('filename') filename: string, @Res() res: Response) {
    if (!/^[A-Za-z0-9]{1,10}\.png$/.test(filename)) {
      throw new NotFoundException();
    }

    const code = filename.slice(0, -4);
    const cached = await this.cacheManager.get<Buffer>(`badge/${code}`);
    if (cached) {
      res.setHeader('Content-Type', 'image/png');
      return res.send(cached);
    }

    const gifPath = join(
      process.cwd(),
      'public',
      'v14',
      'c_images',
      'badges',
      `${code}.gif`,
    );
    if (!existsSync(gifPath)) {
      throw new NotFoundException();
    }

    const image = sharp(readFileSync(gifPath)).ensureAlpha();
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
        data[i + 3] = 0;
      }
    }

    const png = await sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .png()
      .toBuffer();

    await this.cacheManager.set(`badge/${code}`, png);
    res.setHeader('Content-Type', 'image/png');
    return res.send(png);
  }
}
