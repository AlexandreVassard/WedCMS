import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('catalogue_packages')
export class CataloguePackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: true })
  salecode: string;

  @Column({ name: 'definition_id', nullable: true })
  definitionId: number;

  @Column({ name: 'special_sprite_id', nullable: true })
  specialSpriteId: number;

  @Column({ nullable: true })
  amount: number;
}
