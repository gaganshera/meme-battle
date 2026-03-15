import { Play } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { useGameLogic } from '../hooks/useGameLogic';

const Lobby = () => {
  const { hostId, playerId, players } = useGameStore();
  const { startGame } = useGameLogic();
  const isHost = playerId === hostId;

  return (
    <div className="flex flex-col items-center space-y-8 py-10">
      <div className="animate-bounce">
        <h2 className="text-3xl font-bold">Waiting for players...</h2>
      </div>
      
      <div className="flex flex-col items-center text-center max-w-md">
        <p className="text-slate-400 mb-6">
          Share your Room Code with friends. Once everyone is here, the host can start the game.
        </p>
        
        {isHost ? (
          <button 
            onClick={startGame}
            disabled={players.length < 2}
            className="flex items-center space-x-3 px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xl font-black shadow-lg hover:shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed"
          >
            <Play className="fill-current" />
            <span>START THE PARTY</span>
          </button>
        ) : (
          <p className="font-medium text-pink-400">Waiting for host to start...</p>
        )}

        {players.length < 2 && (
          <p className="mt-4 text-xs text-slate-500 italic">Need at least 2 players to start</p>
        )}
      </div>
    </div>
  );
};

export default Lobby;
