export type Player = {
  id: string;
  name: string;
  score: number;
};

export type CaptionCard = string;

export type GamePhase = 'LOBBY' | 'SUBMISSION' | 'JUDGING' | 'RESOLUTION';

export type GameState = {
  players: Player[];
  hostId: string;
  currentMeme: string | null;
  captionCards: CaptionCard[];
  hands: Record<string, CaptionCard[]>;
  submittedCaptions: Array<{ playerId: string; text: string }>;
  judgeId: string | null;
  phase: GamePhase;
  winner: string | null; // Player ID who won the round
};

export type NetworkAction = 
  | { type: 'JOIN_GAME'; name: string; playerId: string }
  | { type: 'START_GAME'; meme: string; captionCards: CaptionCard[]; hands: Record<string, CaptionCard[]>; judgeId: string }
  | { type: 'SUBMIT_CAPTION'; playerId: string; text: string }
  | { type: 'PICK_WINNER'; winnerId: string }
  | { type: 'NEXT_ROUND'; meme: string; judgeId: string; hands: Record<string, CaptionCard[]> }
  | { type: 'SYNC_STATE'; state: GameState };
