import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryColumn({ length: 50 })
  setting: string;

  @Column({ type: 'text', default: '' })
  value: string;
}
