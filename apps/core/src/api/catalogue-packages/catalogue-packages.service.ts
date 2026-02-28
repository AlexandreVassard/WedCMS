import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CataloguePackage } from './entities/catalogue-package.entity';

@Injectable()
export class CataloguePackagesService {
  constructor(
    @InjectRepository(CataloguePackage)
    private cataloguePackagesRepository: Repository<CataloguePackage>,
  ) {}

  find(options?: FindManyOptions<CataloguePackage>) {
    return this.cataloguePackagesRepository.find(options);
  }

  findOne(options: FindOneOptions<CataloguePackage>) {
    return this.cataloguePackagesRepository.findOne(options);
  }

  save(pkg: DeepPartial<CataloguePackage>) {
    return this.cataloguePackagesRepository.save(pkg);
  }

  delete(id: number) {
    return this.cataloguePackagesRepository.delete(id);
  }
}
