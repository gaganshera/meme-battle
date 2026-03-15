import { Play, Clock } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { useGameLogic } from '../hooks/useGameLogic';

const Lobby = () => {
  const { hostId, playerId, players, config, setConfig } = useGameStore();
  const { startGame } = useGameLogic();
  const isHost = playerId === hostId;

  return (
    <div className="flex flex-col items-center space-y-8 py-10">
      <div className="animate-bounce">
        <h2 className="text-3xl font-bold">Waiting for players...</h2>
      </div>
      
      <div className="flex flex-col items-center text-center max-w-md w-full">
        <p className="text-slate-400 mb-8">
          Share your Room Code with friends. Once everyone is here, the host can start the game.
        </p>

        {isHost && (
          <div className="w-full bg-slate-800/50 p-6 rounded-2xl border border-slate-700 mb-8 space-y-4">
            <div className="flex items-center space-x-2 text-purple-400 mb-2">
              <Clock size={18} />
              <h3 className="font-bold uppercase tracking-wider text-xs">Game Settings</h3>
            </div>
            
            <div className="flex flex-col space-y-2 text-left">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300">Round Timer</label>
                <span className="text-purple-400 font-bold">{config.submissionTime}s</span>
              </div>
              <input 
                type="range" 
                min="15" 
                max="120" 
                step="15"
                value={config.submissionTime}
                onChange={(e) => setConfig({ ...config, submissionTime: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>FAST (15s)</span>
                <span>CHILL (120s)</span>
              </div>
            </div>
          </div>
        )}
        
        {isHost ? (
          <button 
            onClick={startGame}
            disabled={players.length < 2}
            className="flex items-center space-x-3 px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xl font-black shadow-lg hover:shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed w-full justify-center"
          >
            <Play className="fill-current" />
            <span>START THE PARTY</span>
          </button>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <p className="font-medium text-pink-400 animate-pulse">Waiting for host to start...</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Timer: {config.submissionTime}s</p>
          </div>
        )}

        {players.length < 2 && (
          <p className="mt-4 text-xs text-slate-500 italic">Need at least 2 players to start</p>
        )}
      </div>
    </div>
  );
};

export default Lobby;
