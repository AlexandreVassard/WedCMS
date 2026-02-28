import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CatalogueItem } from './entities/catalogue-item.entity';

@Injectable()
export class CatalogueItemsService {
  constructor(
    @InjectRepository(CatalogueItem)
    private catalogueItemsRepository: Repository<CatalogueItem>,
  ) {}

  find(options?: FindManyOptions<CatalogueItem>) {
    return this.catalogueItemsRepository.find(options);
  }

  findOne(options: FindOneOptions<CatalogueItem>) {
    return this.catalogueItemsRepository.findOne(options);
  }

  save(item: DeepPartial<CatalogueItem>) {
    return this.catalogueItemsRepository.save(item);
  }

  delete(id: number) {
    return this.catalogueItemsRepository.delete(id);
  }
}
