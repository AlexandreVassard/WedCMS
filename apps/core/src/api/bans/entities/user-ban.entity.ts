import { Column, Entity, PrimaryColumn } from 'typeorm';

export type BanType = 'MACHINE_ID' | 'IP_ADDRESS' | 'USER_ID';

@Entity('users_bans')
export class UserBan {
  @Column({ name: 'ban_type', type: 'enum', enum: ['MACHINE_ID', 'IP_ADDRESS', 'USER_ID'] })
  banType: BanType;

  @PrimaryColumn({ name: 'banned_value', length: 250 })
  bannedValue: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'banned_until', type: 'bigint' })
  bannedUntil: number;
}
