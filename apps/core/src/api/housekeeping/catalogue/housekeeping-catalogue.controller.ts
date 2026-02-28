import { Body, Controller, Get, HttpCode, NotFoundException, Param, Patch, UseGuards } from '@nestjs/common';
import { HousekeepingSessionGuard } from '../housekeeping-session.guard';
import { CataloguePagesService } from '../../catalogue-pages/catalogue-pages.service';

@Controller('api/housekeeping/catalogue')
@UseGuards(HousekeepingSessionGuard)
export class HousekeepingCatalogueController {
  constructor(private readonly cataloguePagesService: CataloguePagesService) {}

  @Get('pages')
  findAll() {
    return this.cataloguePagesService.find({ order: { orderId: 'ASC' } });
  }

  @Get('pages/:id')
  async findOne(@Param('id') id: string) {
    const page = await this.cataloguePagesService.findOne({ where: { id: parseInt(id, 10) } });
    if (!page) throw new NotFoundException();
    return page;
  }

  @Patch('pages/reorder')
  @HttpCode(204)
  async reorder(@Body() body: { ids: number[] }) {
    const all = await this.cataloguePagesService.find();
    const byId = new Map(all.map((p) => [p.id, p]));
    await Promise.all(
      body.ids.map((id, index) => {
        const page = byId.get(id);
        if (!page) return;
        return this.cataloguePagesService.save({ ...page, orderId: index + 1 });
      }),
    );
  }

  @Patch('pages/:id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      nameIndex?: string;
      layout?: string;
      minRole?: number;
      indexVisible?: number;
      isClubOnly?: number;
      imageHeadline?: string;
      imageTeasers?: string;
      body?: string;
      linkList?: string;
      labelPick?: string;
      labelExtraS?: string;
      labelExtraT?: string;
    },
  ) {
    const page = await this.cataloguePagesService.findOne({ where: { id: parseInt(id, 10) } });
    if (!page) throw new NotFoundException();
    return this.cataloguePagesService.save({ ...page, ...body });
  }
}
