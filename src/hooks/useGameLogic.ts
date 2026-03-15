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
    
    // Fetch fresh captions from a remote source
    let remoteCaptions: string[] = [];
    try {
      const response = await fetch('https://raw.githubusercontent.com/crhallberg/json-against-humanity/master/full.json');
      const data = await response.json();
      // Use the 'white' cards (answers) from CAH dataset - they fit perfectly
      remoteCaptions = data.white.map((card: any) => card.text.replace(/<br\/>/g, ' '));
    } catch (error) {
      console.error('Failed to fetch remote captions, falling back to local data', error);
      remoteCaptions = captionsData;
    }

    const meme = await fetchMeme();
    const shuffledCaptions = shuffleArray(remoteCaptions.length > 0 ? remoteCaptions : captionsData);
    
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
      winner: null,
      timerEnd: Date.now() + (useGameStore.getState().config.submissionTime * 1000)
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

    // First, remove the cards that players submitted this round
    currentState.submittedCaptions.forEach(sub => {
      if (newHands[sub.playerId]) {
        newHands[sub.playerId] = newHands[sub.playerId].filter(card => card !== sub.text);
      }
    });

    // Then, refill everyone's hand back up to 7 cards
    currentState.players.forEach(p => {
      const cardsNeeded = 7 - (newHands[p.id]?.length || 0);
      if (cardsNeeded > 0 && availableCaptions.length >= cardsNeeded) {
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
      winner: null,
      timerEnd: Date.now() + (useGameStore.getState().config.submissionTime * 1000)
    };

    setGameState(newState);
    syncFullState();
  }, [setGameState, syncFullState]);

  return { startGame, nextRound };
};
