import { Body, Controller, Get, HttpCode, Param, Patch, UseGuards } from '@nestjs/common';
import { HousekeepingSessionGuard } from '../housekeeping-session.guard';
import { FuserightsService } from '../../ranks/fuserights.service';

@Controller('api/housekeeping/fuserights')
@UseGuards(HousekeepingSessionGuard)
export class HousekeepingFuserightsController {
  constructor(private readonly fuserightsService: FuserightsService) {}

  @Get()
  findAll() {
    return this.fuserightsService.findAll();
  }

  @Patch(':name')
  @HttpCode(204)
  update(@Param('name') name: string, @Body('minRank') minRank: number) {
    return this.fuserightsService.update(name, Number(minRank));
  }
}
