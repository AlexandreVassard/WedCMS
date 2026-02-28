import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rank } from './entities/rank.entity';
import { RanksService } from './ranks.service';
import { FuserightsService } from './fuserights.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rank])],
  providers: [RanksService, FuserightsService],
  exports: [RanksService, FuserightsService],
})
export class RanksModule {}
