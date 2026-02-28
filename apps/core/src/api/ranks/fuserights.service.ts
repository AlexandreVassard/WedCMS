import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

const SEED: { fuseright: string; minRank: number }[] = [
  { fuseright: 'default', minRank: 1 },
  { fuseright: 'fuse_login', minRank: 1 },
  { fuseright: 'fuse_buy_credits', minRank: 1 },
  { fuseright: 'fuse_trade', minRank: 1 },
  { fuseright: 'fuse_room_queue_default', minRank: 1 },
  { fuseright: 'fuse_enter_full_rooms', minRank: 2 },
  { fuseright: 'fuse_room_alert', minRank: 2 },
  { fuseright: 'fuse_enter_locked_rooms', minRank: 3 },
  { fuseright: 'fuse_kick', minRank: 3 },
  { fuseright: 'fuse_mute', minRank: 3 },
  { fuseright: 'fuse_ban', minRank: 4 },
  { fuseright: 'fuse_room_mute', minRank: 4 },
  { fuseright: 'fuse_room_kick', minRank: 4 },
  { fuseright: 'fuse_receive_calls_for_help', minRank: 4 },
  { fuseright: 'fuse_remove_stickies', minRank: 4 },
  { fuseright: 'fuse_mod', minRank: 5 },
  { fuseright: 'fuse_superban', minRank: 5 },
  { fuseright: 'fuse_pick_up_any_furni', minRank: 5 },
  { fuseright: 'fuse_ignore_room_owner', minRank: 5 },
  { fuseright: 'fuse_any_room_controller', minRank: 5 },
  { fuseright: 'fuse_moderator_access', minRank: 5 },
  { fuseright: 'fuse_credits', minRank: 5 },
  { fuseright: 'fuse_administrator_access', minRank: 6 },
  { fuseright: 'fuse_see_flat_ids', minRank: 6 },
];

@Injectable()
export class FuserightsService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    const [{ count }] = await this.dataSource.query(
      'SELECT COUNT(DISTINCT fuseright) as count FROM rank_fuserights',
    );
    if (Number(count) === 0) {
      for (const { fuseright, minRank } of SEED) {
        await this.dataSource.query(
          'INSERT INTO rank_fuserights (fuseright, min_rank) VALUES (?, ?)',
          [fuseright, minRank],
        );
      }
    }
  }

  async findAll(): Promise<{ fuseright: string; minRank: number }[]> {
    return this.dataSource.query(
      'SELECT fuseright, MIN(min_rank) as minRank FROM rank_fuserights GROUP BY fuseright ORDER BY MIN(min_rank) ASC, fuseright ASC',
    );
  }

  async update(fuseright: string, minRank: number) {
    await this.dataSource.query(
      'UPDATE rank_fuserights SET min_rank = ? WHERE fuseright = ?',
      [minRank, fuseright],
    );
  }
}
