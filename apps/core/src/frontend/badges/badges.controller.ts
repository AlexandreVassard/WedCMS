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

// Some Habbo badge files (e.g. HC1, HC2) are 24-bit BMP images with a .gif
// extension. Sharp/libvips does not support BMP, so we decode them manually.
function decodeBmpToRgba(buf: Buffer): {
  data: Buffer;
  width: number;
  height: number;
} {
  const pixelDataOffset = buf.readUInt32LE(10);
  const width = buf.readInt32LE(18);
  const height = buf.readInt32LE(22);
  const bitsPerPixel = buf.readUInt16LE(28);
  if (bitsPerPixel !== 24)
    throw new Error(`Unsupported BMP bits per pixel: ${bitsPerPixel}`);
  const absHeight = Math.abs(height);
  // BMP rows are padded to a 4-byte boundary
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const rgba = Buffer.alloc(width * absHeight * 4);
  for (let y = 0; y < absHeight; y++) {
    // Positive height means rows are stored bottom-to-top
    const srcRow = height > 0 ? absHeight - 1 - y : y;
    for (let x = 0; x < width; x++) {
      const srcIdx = pixelDataOffset + srcRow * rowSize + x * 3;
      const dstIdx = (y * width + x) * 4;
      rgba[dstIdx] = buf[srcIdx + 2]; // R (BMP stores BGR)
      rgba[dstIdx + 1] = buf[srcIdx + 1]; // G
      rgba[dstIdx + 2] = buf[srcIdx]; // B
      rgba[dstIdx + 3] = 255; // A
    }
  }
  return { data: rgba, width, height: absHeight };
}

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

    const fileBuffer = readFileSync(gifPath);
    let raw: { data: Buffer; width: number; height: number };

    if (fileBuffer[0] === 0x42 && fileBuffer[1] === 0x4d) {
      // BMP masquerading as .gif
      raw = decodeBmpToRgba(fileBuffer);
    } else {
      const { data, info } = await sharp(fileBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      raw = { data, width: info.width, height: info.height };
    }

    for (let i = 0; i < raw.data.length; i += 4) {
      if (raw.data[i] > 240 && raw.data[i + 1] > 240 && raw.data[i + 2] > 240) {
        raw.data[i + 3] = 0;
      }
    }

    const png = await sharp(raw.data, {
      raw: { width: raw.width, height: raw.height, channels: 4 },
    })
      .png()
      .toBuffer();

    await this.cacheManager.set(`badge/${code}`, png);
    res.setHeader('Content-Type', 'image/png');
    return res.send(png);
  }
}
