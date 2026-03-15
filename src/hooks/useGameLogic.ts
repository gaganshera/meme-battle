import { useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useNetwork } from '../context/NetworkContext';
import captionsData from '../data/captions.json';

export const useGameLogic = () => {
  const { 
    setGameState, players 
  } = useGameStore();
  const { syncFullState } = useNetwork();

  const fetchMeme = async () => {
    try {
      const response = await fetch('https://api.imgflip.com/get_memes');
      const json = await response.json();
      if (json.success && json.data.memes.length > 0) {
        const memes = json.data.memes;
        const randomIndex = Math.floor(Math.random() * memes.length);
        return memes[randomIndex].url;
      }
      throw new Error('Imgflip API returned unsuccessful response');
    } catch (error) {
      console.error('Failed to fetch meme from Imgflip:', error);
      return 'https://via.placeholder.com/600x400?text=Failed+to+fetch+meme';
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const startGame = useCallback(async () => {
    console.log('[GameLogic] Starting game...');
    const meme = await fetchMeme();
    const shuffledCaptions = shuffleArray(captionsData);
    
    // Deal 7 cards to each player
    const newHands: Record<string, string[]> = {};
    let currentIndex = 0;
    players.forEach(p => {
      newHands[p.id] = shuffledCaptions.slice(currentIndex, currentIndex + 7);
      currentIndex += 7;
    });

    const remainingCaptions = shuffledCaptions.slice(currentIndex);
    const judgeId = players[0].id; // First player starts as judge

    const newState = {
      phase: 'SUBMISSION' as const,
      currentMeme: meme,
      captionCards: remainingCaptions,
      hands: newHands,
      judgeId,
      submittedCaptions: [],
      winner: null
    };

    console.log('[GameLogic] Updating host state and syncing...');
    setGameState(newState);
    // Use the reliable sync method that ensures only JSON is sent
    syncFullState();
  }, [players, setGameState, syncFullState]);

  const nextRound = useCallback(async () => {
    console.log('[GameLogic] Transitioning to next round...');
    const currentState = useGameStore.getState();
    const meme = await fetchMeme();
    
    // Rotate judge
    const currentJudgeIndex = currentState.players.findIndex(p => p.id === currentState.judgeId);
    const nextJudgeIndex = (currentJudgeIndex + 1) % currentState.players.length;
    const nextJudgeId = currentState.players[nextJudgeIndex].id;

    // Refill hands
    const newHands = { ...currentState.hands };
    let availableCaptions = [...currentState.captionCards];

    currentState.players.forEach(p => {
      const cardsNeeded = 7 - (newHands[p.id]?.length || 0);
      if (cardsNeeded > 0) {
        const newCards = availableCaptions.slice(0, cardsNeeded);
        newHands[p.id] = [...(newHands[p.id] || []), ...newCards];
        availableCaptions = availableCaptions.slice(cardsNeeded);
      }
    });

    const newState = {
      phase: 'SUBMISSION' as const,
      currentMeme: meme,
      captionCards: availableCaptions,
      hands: newHands,
      judgeId: nextJudgeId,
      submittedCaptions: [],
      winner: null
    };

    setGameState(newState);
    syncFullState();
  }, [setGameState, syncFullState]);

  return { startGame, nextRound };
};
