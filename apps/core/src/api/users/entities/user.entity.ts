import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 255, default: '1000118001270012900121001' })
  figure: string;

  @Column({ name: 'pool_figure', length: 255, default: '' })
  poolFigure: string;

  @Column({ type: 'char', length: 1, default: 'M' })
  sex: string;

  @Column({ length: 100, default: 'i love habbo hotel' })
  motto: string;

  @Column({ default: 200 })
  credits: number;

  @Column({ default: 0 })
  tickets: number;

  @Column({ default: 0 })
  film: number;

  @Column({ type: 'tinyint', unsigned: true, default: 1 })
  rank: number;

  @Column({ name: 'console_motto', length: 100, default: "'I''m a new user!'" })
  consoleMotto: string;

  @Column({ name: 'receive_email', type: 'tinyint', default: 0 })
  receiveEmail: number;

  @Column({ length: 10 })
  birthday: string;

  @Column({ length: 256 })
  email: string;

  @Column({ name: 'last_online', default: 0 })
  lastOnline: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'sso_ticket', type: 'varchar', length: 255, nullable: true, default: null })
  ssoTicket: string | null;

  @Column({ name: 'club_subscribed', type: 'bigint', default: 0 })
  clubSubscribed: number;

  @Column({ name: 'club_expiration', type: 'bigint', default: 0 })
  clubExpiration: number;

  @Column({ name: 'club_gift_due', type: 'bigint', default: 0 })
  clubGiftDue: number;

  @Column({ type: 'char', length: 3, default: '' })
  badge: string;

  @Column({ name: 'badge_active', type: 'tinyint', default: 1 })
  badgeActive: number;

  @Column({ name: 'allow_stalking', type: 'tinyint', default: 1 })
  allowStalking: number;

  @Column({ name: 'allow_friend_requests', type: 'tinyint', default: 1 })
  allowFriendRequests: number;

  @Column({ name: 'sound_enabled', type: 'tinyint', default: 1 })
  soundEnabled: number;

  @Column({ name: 'tutorial_finished', type: 'tinyint', default: 0 })
  tutorialFinished: number;

  @Column({ name: 'battleball_points', default: 0 })
  battleballPoints: number;

  @Column({ name: 'snowstorm_points', default: 0 })
  snowstormPoints: number;

  constructor(createUserDto: CreateUserDto) {
    if (!createUserDto) return;
    this.username = createUserDto.username;
    this.password = createUserDto.password;
    this.email = createUserDto.email;
    this.birthday = createUserDto.birthday;
    if (createUserDto.sex) this.sex = createUserDto.sex;
    if (createUserDto.figure) this.figure = createUserDto.figure;
  }
}
