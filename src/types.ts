export type GameKind = 'calm' | 'feed';

export type CalmSpeciesId =
  | 'poochyena'
  | 'numel'
  | 'electrike'
  | 'trapinch'
  | 'aron'
  | 'torchic'
  | 'mudkip'
  | 'treecko';

export type FeedSpeciesId =
  | 'zigzagoon'
  | 'wurmple'
  | 'taillow'
  | 'shroomish'
  | 'skitty'
  | 'lotad'
  | 'seedot'
  | 'azurill';

export type SpeciesId = CalmSpeciesId | FeedSpeciesId;

export type BodyZone = 'head' | 'cheek' | 'back' | 'belly';

export type PokemonMood = 'furious' | 'grumpy' | 'neutral' | 'relaxed' | 'eating' | 'sad';

export type OutcomeStatus = 'success' | 'fail';

export type JudgmentKind = 'perfect' | 'good' | 'miss';

export interface PlayerInfo {
  id: string;
  name: string;
  role: 'GM' | 'PLAYER';
  color?: string;
}

export interface StartMessage {
  sessionId: string;
  game: GameKind;
  targetPlayerIds: string[];
  speciesId: CalmSpeciesId | 'random';
  resolvedSpeciesId?: CalmSpeciesId;
  feedCount: number;
  issuedAt: number;
}

export interface ResultMessage {
  sessionId: string;
  game: GameKind;
  stage: number;
  stageLabel?: string;
  outcome: OutcomeStatus;
  reason?: string;
  playerId: string;
  playerName: string;
  perfect: number;
  good: number;
  miss: number;
  accuracy: number;
  timestamp: number;
}

export interface SessionLaunchParams {
  sessionId: string;
  game: GameKind;
  speciesId: CalmSpeciesId | 'random';
  feedCount: number;
  playerId?: string;
  playerName?: string;
}
