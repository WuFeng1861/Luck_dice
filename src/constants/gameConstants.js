// Game durations in seconds
export const GAME_DURATIONS = {
  WAITING: 60, // 1 minute waiting period
  PLAYING: 300, // 5 minutes gameplay
  TOTAL: 360 // 6 minutes total
}

// Game states
export const GAME_STATES = {
  WAITING: 'waiting',
  RUNNING: 'running',
  SETTLING: 'settling',
  FINISHED: 'finished'
}

// Bet status
export const BET_STATUS = {
  PENDING: 'pending',
  WIN: 'win',
  LOSE: 'lose',
  REFUNDED: 'refunded'
}

// Game constants
export const GAME_CONSTANTS = {
  MIN_ACTIVE_ZONES: 3,
  WINNER_ZONES_COUNT: 2,
  PRIZE_POOL_PERCENTAGE: 0.9
}