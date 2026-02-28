import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogueItem } from './entities/catalogue-item.entity';
import { CatalogueItemsService } from './catalogue-items.service';

@Module({
  imports: [TypeOrmModule.forFeature([CatalogueItem])],
  providers: [CatalogueItemsService],
  exports: [CatalogueItemsService],
})
export class CatalogueItemsModule {}
