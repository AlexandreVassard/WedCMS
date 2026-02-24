import { Entity, PrimaryColumn } from 'typeorm';

@Entity('messenger_friends')
export class MessengerFriend {
  @PrimaryColumn({ name: 'from_id', type: 'int' })
  fromId: number;

  @PrimaryColumn({ name: 'to_id', type: 'int' })
  toId: number;
}
