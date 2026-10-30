// ============================================================================
// Chess Arena — TypeScript Interfaces
// ============================================================================

export interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  rating: number
  games_played: number
  games_won: number
  games_lost: number
  games_drawn: number
  is_online: boolean
  last_seen: string
  created_at: string
  updated_at: string
}

export interface Game {
  id: string
  white_player_id: string
  black_player_id: string
  status: 'waiting' | 'active' | 'completed' | 'abandoned'
  fen: string
  pgn: string
  result: 'white' | 'black' | 'draw' | null
  winner_id: string | null
  time_control: number
  white_time_remaining: number
  black_time_remaining: number
  last_move_at: string | null
  created_at: string
  updated_at: string
  // Joined relations
  white_player?: Profile
  black_player?: Profile
}

export interface GameMove {
  id: string
  game_id: string
  move_number: number
  move_san: string
  move_from: string
  move_to: string
  fen_after: string
  created_at: string
}

export interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted' | 'declined' | 'blocked'
  created_at: string
  updated_at: string
  // Joined relations
  requester?: Profile
  addressee?: Profile
}

export interface GameInvite {
  id: string
  from_user_id: string
  to_user_id: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  time_control: number
  created_at: string
  // Joined relations
  from_user?: Profile
  to_user?: Profile
}

export interface MatchmakingEntry {
  id: string
  user_id: string
  rating: number
  created_at: string
}

export interface MoveResult {
  valid: boolean
  san: string | null
  from: string
  to: string
  fen: string
  isGameOver: boolean
  isCheckmate: boolean
  isStalemate: boolean
  isDraw: boolean
  isCheck: boolean
  turn: 'w' | 'b'
  moveNumber: number
}
