import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('ranks')
export class Rank {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ length: 64 })
  name: string;
}
