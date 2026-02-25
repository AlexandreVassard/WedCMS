import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  image: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json' })
  links: { url: string; text: string }[];

  @Column({ type: 'int' })
  position: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
