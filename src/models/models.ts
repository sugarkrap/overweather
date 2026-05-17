export type MatchResult = 'WIN' | 'LOSS' | 'DRAW';
export type PlayerRole = 'TANK' | 'DPS' | 'SUPPORT';
export type QueueSize = 'SOLO' | 'DUO' | 'TRIO' | 'QUAD' | 'FIVE';
export type GameMode = 'COMPETITIVE' | 'QUICKPLAY' | 'ARCADE';
export type MatchType = 'FAIR' | 'UNFAIR' | 'NOT_SURE';
export type QueueDuration = 'SHORT' | 'LONG';
export type RankTier = 'COPPER' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'MASTER' | 'GRANDMASTER' | 'CHAMPION';
export type MatchModifier =
  | 'WIN_STREAK' | 'LOSS_STREAK'
  | 'CALIBRATION' | 'VOLATILE'
  | 'UPHILL_BATTLE' | 'REVERSAL' | 'CONSOLATION' | 'EXPECTED';

export interface CurrentRank {
  tier: RankTier;
  subrank?: number;
  percentage: number;
}

export interface Match {
  id: string;
  result: MatchResult;
  playedAt: string;
  role?: PlayerRole;
  queueSize?: QueueSize;
  gameMode: GameMode;
  matchType?: MatchType;
  queueDuration?: QueueDuration;
  notes?: string;
  accountID?: string;
  modifiers?: MatchModifier[];
  currentRank?: CurrentRank;
  createdAt: string;
}

export interface MatchStats {
  total: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  predictionAccuracy: number | null;
  recentLosses: number;
  lastPlayedByRole: Record<string, string | null>;
  recent: Array<{
    result: MatchResult;
    playedAt: string;
  }>;
}

export interface CreateMatchPayload {
  result: MatchResult;
  playedAt?: string;
  role?: PlayerRole;
  queueSize?: QueueSize;
  gameMode?: GameMode;
  matchType?: MatchType;
  queueDuration?: QueueDuration;
  notes?: string;
  accountID?: string;
  modifiers?: MatchModifier[];
  currentRank?: CurrentRank;
}

export interface Account {
  id: string;
  name: string;
  createdAt: string;
}

export interface AppSettings {
  username: string;
}
