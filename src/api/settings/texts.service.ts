import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class TextsService implements OnModuleInit {
  private texts: Record<string, any> = {};
  locale: string = 'en';

  async onModuleInit() {
    await this.loadTexts('en');
  }

  private async loadTexts(locale: string) {
    const filePath = join(process.cwd(), 'texts', `${locale}.json`);
    const raw = await readFile(filePath, 'utf-8');
    this.texts = JSON.parse(raw);
    this.locale = locale;
    Logger.log(`Loaded texts for locale "${locale}"`, 'TextsService');
  }

  getTextsByLayout(layout: string): Record<string, any> | undefined {
    const section = this.texts[layout];
    if (!section) return undefined;
    return { global: section.global, ...section.pages };
  }
}
