import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('catalogue_items')
export class CatalogueItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sale_code', length: 255, nullable: true })
  saleCode: string;

  @Column({ name: 'page_id', type: 'tinytext', nullable: true })
  pageId: string;

  @Column({ name: 'order_id', default: 0 })
  orderId: number;

  @Column({ default: 3 })
  price: number;

  @Column({ name: 'is_hidden', type: 'tinyint', default: 0 })
  isHidden: number;

  @Column({ default: 1 })
  amount: number;

  @Column({ name: 'definition_id', nullable: true })
  definitionId: number;

  @Column({ name: 'item_specialspriteid', default: 0 })
  itemSpecialspriteId: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  description: string;

  @Column({ name: 'is_package', type: 'tinyint', default: 0 })
  isPackage: number;

  @Column({ name: 'package_name', length: 255, nullable: true })
  packageName: string;

  @Column({ name: 'package_description', length: 256, nullable: true })
  packageDescription: string;
}
