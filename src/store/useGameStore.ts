import { create } from 'zustand';
import type { GameState } from '../types/game';

export type NetworkStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

interface GameStore extends GameState {
  playerId: string | null;
  playerName: string | null;
  networkStatus: NetworkStatus;
  setPlayerInfo: (id: string, name: string) => void;
  setGameState: (state: Partial<GameState>) => void;
  setNetworkStatus: (status: NetworkStatus) => void;
  resetGame: () => void;
}

const initialState: GameState = {
  players: [],
  hostId: '',
  currentMeme: null,
  captionCards: [],
  hands: {},
  submittedCaptions: [],
  judgeId: null,
  phase: 'LOBBY',
  winner: null,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  playerId: null,
  playerName: null,
  networkStatus: 'DISCONNECTED',
  setPlayerInfo: (id, name) => set({ playerId: id, playerName: name }),
  setGameState: (state) => set((prev) => ({ ...prev, ...state })),
  setNetworkStatus: (status) => set({ networkStatus: status }),
  resetGame: () => set({ ...initialState, networkStatus: 'DISCONNECTED' }),
}));
