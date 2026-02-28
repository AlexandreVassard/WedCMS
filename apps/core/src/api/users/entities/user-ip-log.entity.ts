import { Entity, PrimaryColumn } from 'typeorm';

@Entity('users_ip_logs')
export class UserIpLog {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'ip_address', length: 256 })
  ipAddress: string;

  @PrimaryColumn({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
