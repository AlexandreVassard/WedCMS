import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('catalogue_pages')
export class CataloguePage {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ name: 'order_id', nullable: true })
  orderId: number;

  @Column({ name: 'min_role', nullable: true })
  minRole: number;

  @Column({ name: 'index_visible', type: 'tinyint', default: 1 })
  indexVisible: number;

  @Column({ name: 'is_club_only', type: 'tinyint', default: 0 })
  isClubOnly: number;

  @Column({ name: 'name_index', length: 255, nullable: true })
  nameIndex: string;

  @Column({ name: 'link_list', length: 255, default: '' })
  linkList: string;

  @Column({ length: 255, nullable: true })
  name: string;

  @Column({ length: 255, nullable: true })
  layout: string;

  @Column({ name: 'image_headline', length: 255, nullable: true })
  imageHeadline: string;

  @Column({ name: 'image_teasers', length: 255, nullable: true })
  imageTeasers: string;

  @Column({ type: 'text', default: '' })
  body: string;

  @Column({ name: 'label_pick', length: 255, nullable: true })
  labelPick: string;

  @Column({ name: 'label_extra_s', length: 255, nullable: true })
  labelExtraS: string;

  @Column({ name: 'label_extra_t', type: 'text', nullable: true })
  labelExtraT: string;
}
