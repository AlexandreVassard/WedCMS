import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { HousekeepingSessionGuard } from '../housekeeping-session.guard';
import { RanksService } from '../../ranks/ranks.service';

@Controller('api/housekeeping/ranks')
@UseGuards(HousekeepingSessionGuard)
export class HousekeepingRanksController {
  constructor(private readonly ranksService: RanksService) {}

  @Get()
  findAll() {
    return this.ranksService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('name') name: string) {
    return this.ranksService.update(Number(id), name);
  }
}
