export type PlayerType = 'detective' | 'emotional' | 'observer' | 'icebreaker';

export interface PlayerTypeInfo {
  type: PlayerType;
  name: string;
  emoji: string;
  color: string;
  description: string;
  traits: string[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    scores: Record<PlayerType, number>;
  }[];
}

export interface PlayerProfile {
  type: PlayerType;
  name: string;
  scores: Record<PlayerType, number>;
  publicPrefs: {
    canTakeBlame: boolean;
    likesInterrogation: boolean;
    readingSpeed: 'slow' | 'medium' | 'fast';
    prefersControl: boolean;
    likesEmotional: boolean;
  };
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  profile: PlayerProfile | null;
  role: string | null;
  isHost: boolean;
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  scriptName: string;
  roleCount: number;
  players: Player[];
  status: 'waiting' | 'matching' | 'matched' | 'playing';
  assignedRoles: Record<string, string> | null;
  swapRequests: SwapRequest[];
  createdAt: number;
}

export interface SwapImpact {
  fromPlayer: string;
  toPlayer: string;
  overall: string;
  fromDiff: number;
  toDiff: number;
  overallDiff: number;
}

export interface SwapRequest {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  fromRole: string;
  toRole: string;
  impact: SwapImpact;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
  processedAt?: number;
}

export interface RoleSuggestion {
  playerId: string;
  role: string;
  reason: string;
  score: number;
}

export interface MatchResult {
  suggestions: RoleSuggestion[];
  overallReason: string;
}
