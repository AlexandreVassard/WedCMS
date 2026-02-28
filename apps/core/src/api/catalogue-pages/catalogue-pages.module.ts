import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CataloguePage } from './entities/catalogue-page.entity';
import { CataloguePagesService } from './catalogue-pages.service';

@Module({
  imports: [TypeOrmModule.forFeature([CataloguePage])],
  providers: [CataloguePagesService],
  exports: [CataloguePagesService],
})
export class CataloguePagesModule {}
