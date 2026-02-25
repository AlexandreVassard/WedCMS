import { Module } from '@nestjs/common';
import { CreditsController } from './credits.controller';

@Module({
  controllers: [CreditsController],
})
export class CreditsModule {}
