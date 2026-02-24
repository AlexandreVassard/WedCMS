export enum SettingKey {
  // General
  MAX_CONNECTIONS_PER_IP = 'max.connections.per.ip',
  NORMALISE_INPUT_STRINGS = 'normalise.input.strings',
  PLAYERS_ONLINE = 'players.online',
  SHUTDOWN_MINUTES = 'shutdown.minutes',
  RESET_SSO_AFTER_LOGIN = 'reset.sso.after.login',

  // Room
  ROOM_DISPOSE_TIMER_ENABLED = 'room.dispose.timer.enabled',
  ROOM_DISPOSE_TIMER_SECONDS = 'room.dispose.timer.seconds',
  ROOM_BOTS_ENABLED = 'room.bots.enabled',
  ROLLER_TICK_DEFAULT = 'roller.tick.default',
  STACK_HEIGHT_LIMIT = 'stack.height.limit',
  ROOMDIMMER_SCRIPTING_ALLOWED = 'roomdimmer.scripting.allowed',

  // Welcome message
  WELCOME_MESSAGE_ENABLED = 'welcome.message.enabled',
  WELCOME_MESSAGE_CONTENT = 'welcome.message.content',

  // Timers
  AFK_TIMER_SECONDS = 'afk.timer.seconds',
  SLEEP_TIMER_SECONDS = 'sleep.timer.seconds',
  CARRY_TIMER_SECONDS = 'carry.timer.seconds',

  // Credits scheduler
  CREDITS_SCHEDULER_ENABLED = 'credits.scheduler.enabled',
  CREDITS_SCHEDULER_TIMEUNIT = 'credits.scheduler.timeunit',
  CREDITS_SCHEDULER_INTERVAL = 'credits.scheduler.interval',
  CREDITS_SCHEDULER_AMOUNT = 'credits.scheduler.amount',

  // Chat
  CHAT_GARBLED_TEXT = 'chat.garbled.text',
  CHAT_BUBBLE_TIMEOUT_SECONDS = 'chat.bubble.timeout.seconds',

  // Messenger
  MESSENGER_MAX_FRIENDS_NONCLUB = 'messenger.max.friends.nonclub',
  MESSENGER_MAX_FRIENDS_CLUB = 'messenger.max.friends.club',

  // BattleBall
  BATTLEBALL_CREATE_GAME_ENABLED = 'battleball.create.game.enabled',
  BATTLEBALL_START_MINIMUM_ACTIVE_TEAMS = 'battleball.start.minimum.active.teams',
  BATTLEBALL_PREPARING_GAME_SECONDS = 'battleball.preparing.game.seconds',
  BATTLEBALL_GAME_LIFETIME_SECONDS = 'battleball.game.lifetime.seconds',
  BATTLEBALL_RESTART_GAME_SECONDS = 'battleball.restart.game.seconds',
  BATTLEBALL_TICKET_CHARGE = 'battleball.ticket.charge',
  BATTLEBALL_INCREASE_POINTS = 'battleball.increase.points',

  // Games (shared)
  GAME_FINISHED_LISTING_EXPIRY_SECONDS = 'game.finished.listing.expiry.seconds',

  // Snowstorm
  SNOWSTORM_CREATE_GAME_ENABLED = 'snowstorm.create.game.enabled',
  SNOWSTORM_START_MINIMUM_ACTIVE_TEAMS = 'snowstorm.start.minimum.active.teams',
  SNOWSTORM_PREPARING_GAME_SECONDS = 'snowstorm.preparing.game.seconds',
  SNOWSTORM_RESTART_GAME_SECONDS = 'snowstorm.restart.game.seconds',
  SNOWSTORM_TICKET_CHARGE = 'snowstorm.ticket.charge',
  SNOWSTORM_INCREASE_POINTS = 'snowstorm.increase.points',

  // Poker
  POKER_ENTRY_PRICE = 'poker.entry.price',
  POKER_ENTRY_PRICE_ONLY_IN_ROOMS = 'poker.entry.price.only.in.rooms',
  POKER_ENTRY_PRICE_REDISTRIBUTE = 'poker.entry.price.redistribute',
  POKER_ENTRY_PRICE_REDISTRIBUTE_ON_TIE = 'poker.entry.price.redistribute.on.tie',
  POKER_ENTRY_PRICE_REDISTRIBUTE_ONLY_IN_ROOMS = 'poker.entry.price.redistribute.only.in.rooms',
  POKER_REWARD_MIN_PLAYER = 'poker.reward.min.player',
  POKER_REWARD_MIN_PLAYER_ONLY_IN_ROOMS = 'poker.reward.min.player.only.in.rooms',
  POKER_REWARD_CREDITS_BONUS = 'poker.reward.credits.bonus',
  POKER_REWARD_CREDITS_BONUS_ON_TIE = 'poker.reward.credits.bonus.on.tie',
  POKER_REWARD_CREDITS_BONUS_ONLY_IN_ROOMS = 'poker.reward.credits.bonus.only.in.rooms',
  POKER_REWARD_RARES = 'poker.reward.rares',
  POKER_REWARD_RARES_ONLY_IN_ROOMS = 'poker.reward.rares.only.in.rooms',
  POKER_REWARD_RARES_QUANTITY = 'poker.reward.rares.quantity',
  POKER_REWARD_RARES_ON_TIE = 'poker.reward.rares.on.tie',
  POKER_REWARD_TICKETS = 'poker.reward.tickets',
  POKER_REWARD_TICKETS_ON_TIE = 'poker.reward.tickets.on.tie',
  POKER_REWARD_TICKETS_ONLY_IN_ROOMS = 'poker.reward.tickets.only.in.rooms',
  POKER_ANNOUNCE_WINNER = 'poker.announce.winner',
  POKER_ANNOUNCE_WINNER_ONLY_IN_ROOMS = 'poker.announce.winner.only.in.rooms',
  POKER_ANNOUNCE_REWARDS = 'poker.announce.rewards',
  POKER_ANNOUNCE_REWARDS_ONLY_IN_ROOMS = 'poker.announce.rewards.only.in.rooms',

  // Rare cycle
  RARE_CYCLE_PAGE_TEXT = 'rare.cycle.page.text',
  RARE_CYCLE_TICK_TIME = 'rare.cycle.tick.time',
  RARE_CYCLE_PAGE_ID = 'rare.cycle.page.id',
  RARE_CYCLE_REFRESH_TIMEUNIT = 'rare.cycle.refresh.timeunit',
  RARE_CYCLE_REFRESH_INTERVAL = 'rare.cycle.refresh.interval',
  RARE_CYCLE_REUSE_TIMEUNIT = 'rare.cycle.reuse.timeunit',
  RARE_CYCLE_REUSE_INTERVAL = 'rare.cycle.reuse.interval',
  RARE_CYCLE_REUSE_THRONE_TIMEUNIT = 'rare.cycle.reuse.throne.timeunit',
  RARE_CYCLE_REUSE_THRONE_INTERVAL = 'rare.cycle.reuse.throne.interval',
  RARE_CYCLE_PAGES = 'rare.cycle.pages',

  // Club
  CLUB_GIFT_TIMEUNIT = 'club.gift.timeunit',
  CLUB_GIFT_INTERVAL = 'club.gift.interval',
  CLUB_GIFT_PRESENT_LABEL = 'club.gift.present.label',

  // Users / Figures
  USERS_FIGURE_PARTS_DEFAULT = 'users.figure.parts.default',
  USERS_FIGURE_PARTS_CLUB = 'users.figure.parts.club',

  // Events
  EVENTS_CATEGORY_COUNT = 'events.category.count',
  EVENTS_EXPIRY_MINUTES = 'events.expiry.minutes',

  // Catalogue
  DISABLE_PURCHASE_SUCCESSFUL_ALERT = 'disable.purchase.successful.alert',

  // Recycler
  RECYCLER_MAX_TIME_TO_COLLECT_SECONDS = 'recycler.max.time.to.collect.seconds',
  RECYCLER_SESSION_LENGTH_SECONDS = 'recycler.session.length.seconds',
  RECYCLER_ITEM_QUARANTINE_SECONDS = 'recycler.item.quarantine.seconds',

  // Navigator
  NAVIGATOR_SHOW_HIDDEN_ROOMS = 'navigator.show.hidden.rooms',

  // Misc
  TUTORIAL_ENABLED = 'tutorial.enabled',
  PROFILE_EDITING = 'profile.editing',
  VOUCHERS_ENABLED = 'vouchers.enabled',

  // Rare item of the day
  RARE = 'rare',
}
