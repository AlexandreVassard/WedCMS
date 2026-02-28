import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CataloguePackage } from './entities/catalogue-package.entity';
import { CataloguePackagesService } from './catalogue-packages.service';

@Module({
  imports: [TypeOrmModule.forFeature([CataloguePackage])],
  providers: [CataloguePackagesService],
  exports: [CataloguePackagesService],
})
export class CataloguePackagesModule {}
