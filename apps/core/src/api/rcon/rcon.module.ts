import { Module } from '@nestjs/common';
import { RconService } from './rcon.service';
import { RconController } from './rcon.controller';

@Module({
  providers: [RconService],
  controllers: [RconController],
  exports: [RconService],
})
export class RconModule {}
