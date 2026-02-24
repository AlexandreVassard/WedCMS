import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'owner_id', length: 11 })
  ownerId: string;

  @Column({ default: 2 })
  category: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  description: string;

  @Column({ length: 255 })
  model: string;

  @Column({ length: 255, default: '' })
  ccts: string;

  @Column({ type: 'int', width: 4, default: 0 })
  wallpaper: number;

  @Column({ type: 'int', width: 4, default: 0 })
  floor: number;

  @Column({ name: 'showname', type: 'tinyint', default: 1 })
  showname: number;

  @Column({ type: 'tinyint', default: 0 })
  superusers: number;

  @Column({ type: 'tinyint', default: 0 })
  accesstype: number;

  @Column({ length: 255, default: '' })
  password: string;

  @Column({ name: 'visitors_now', default: 0 })
  visitorsNow: number;

  @Column({ name: 'visitors_max', default: 25 })
  visitorsMax: number;

  @Column({ default: 0 })
  rating: number;

  @Column({ name: 'is_hidden', type: 'tinyint', default: 0 })
  isHidden: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
