import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CataloguePage } from './entities/catalogue-page.entity';

@Injectable()
export class CataloguePagesService {
  constructor(
    @InjectRepository(CataloguePage)
    private cataloguePagesRepository: Repository<CataloguePage>,
  ) {}

  find(options?: FindManyOptions<CataloguePage>) {
    return this.cataloguePagesRepository.find(options);
  }

  findOne(options: FindOneOptions<CataloguePage>) {
    return this.cataloguePagesRepository.findOne(options);
  }

  save(page: DeepPartial<CataloguePage>) {
    return this.cataloguePagesRepository.save(page);
  }

  delete(id: number) {
    return this.cataloguePagesRepository.delete(id);
  }
}
