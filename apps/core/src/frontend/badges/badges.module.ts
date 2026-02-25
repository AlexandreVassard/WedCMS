import { Module } from '@nestjs/common';
import { BadgesController } from './badges.controller';

@Module({ controllers: [BadgesController] })
export class BadgesModule {}
