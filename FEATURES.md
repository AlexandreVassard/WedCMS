# Housekeeping Features

Feature list derived from the Kepler database schema, RCON commands, and in-game commands.
Checked items are already implemented.

---

## Users

- [x] List users (search, paginate)
- [x] Edit user profile (username, figure, motto, sex, rank, credits, tickets, film)
- [x] Manage user badges (view, give, remove)
- [x] View login IP history (`users_ip_logs`)
- [ ] Manage Habbo Club subscription (`club_subscribed`, `club_expiration`, `club_gift_due`)
- [ ] View club gift history (`users_club_gifts`)
- [ ] Mute / unmute user — RCON `mute_user` / `unmute_user`
- [x] Kick user from room — RCON `kick_user`
- [ ] Disconnect user from server — RCON `disconnect_user`
- [ ] Send alert to user — RCON `user_alert`
- [ ] Teleport user to a room — RCON `forward`
- [ ] Refresh user in-game state (looks, credits, club, motto, badge, inventory) — RCON `refresh_*`

## Bans

- [ ] List all bans (`users_bans`)
- [ ] Create ban (by user ID, IP address, or machine ID) with reason and expiry
- [ ] Delete / unban
- [ ] View ban details (type, banned value, reason, expiry)

## Rooms

- [x] List rooms (search, paginate)
- [ ] View room details
- [ ] Edit room properties (name, description, category, max visitors, access type, password, visibility)
- [ ] Hide / show room (`is_hidden`)
- [ ] Delete room
- [ ] View room chat logs (`room_chatlogs`)
- [ ] Send alert to a room — RCON `room_alert`
- [ ] Manage room bots (`rooms_bots` — create, edit, delete NPCs)
- [ ] Manage room categories (`rooms_categories` — navigator tree)
- [ ] View active room events (`rooms_events`)

## Catalogue

- [x] List catalogue pages
- [x] Create / edit / delete catalogue pages
- [x] List catalogue items per page
- [x] Create / edit / delete catalogue items
- [ ] Manage catalogue packages (`catalogue_packages` — bundle items)
- [ ] Rare cycle management (`rare_cycle` — view and schedule rotating rares)
- [ ] Reload catalogue in-game — RCON `refresh_catalogue`

## Ranks & Permissions

- [x] List ranks
- [x] Create / edit / delete ranks
- [ ] Manage fuserights per rank (`rank_fuserights` — assign / revoke permission strings)
- [ ] Manage default rank badges (`rank_badges`)

## Moderation / RCON

- [x] Send RCON commands (raw interface)
- [ ] Hotel-wide alert — RCON `hotel_alert`
- [ ] Mass event — RCON `mass_event` (teleport all online players to a room)
- [ ] Schedule / cancel server shutdown — RCON `shutdown` / `shutdown_cancel`
- [ ] Reload game settings — RCON `reload_settings`

## Audit Log

- [ ] View housekeeping audit log (`housekeeping_audit_log` — moderation actions performed by staff)
- [ ] Filter by action type, staff member, target user, date range

## Settings

- [x] Manage game settings (`settings` table — key/value pairs)
- [ ] Manage external texts (`external_texts` — client-side string overrides)

## Vouchers

- [ ] List voucher codes (`vouchers`)
- [ ] Create voucher (credits, items, expiry, single-use flag)
- [ ] Delete / expire voucher
- [ ] Attach catalogue items to a voucher (`vouchers_items`)
- [ ] View redemption history (`vouchers_history`)

## Recycler

- [ ] Manage recycler rewards (`recycler_rewards` — prizes, item cost, timing)
- [ ] View active / completed recycler sessions (`recycler_sessions`)

## Games (BattleBall / SnowStorm)

- [ ] Manage game maps (`games_maps` — heightmap and tile layout per arena)
- [ ] Manage player spawn points per team (`games_player_spawns`)
- [ ] Manage rank titles and point thresholds (`games_ranks`)

## Furniture Definitions

- [ ] Browse items_definitions (searchable furniture database — sprite, behaviour, dimensions)
- [ ] Edit furniture properties (name, description, tradable, recyclable, behaviour flags)

## News & Announcements

- [x] List / create / edit / delete news articles
- [x] List / create / edit / delete announcements

## Dashboard

- [x] Stats overview (total users, rooms, news articles)
- [x] Online player count (live, via DB — polls `users.online = 1` every 30 s)
- [ ] Recent moderation activity (last N audit log entries)
- [ ] Server uptime / status indicator
