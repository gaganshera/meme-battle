import { useGameStore } from '../store/useGameStore';
import { useGameLogic } from '../hooks/useGameLogic';

const Resolution = () => {
  const { 
    players, winner, submittedCaptions, currentMeme, hostId, playerId 
  } = useGameStore();
  const { nextRound } = useGameLogic();
  const isHost = playerId === hostId;

  const winningPlayer = players.find(p => p.id === winner);
  const winningSubmission = submittedCaptions.find(s => s.playerId === winner);

  return (
    <div className="flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center">
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2 uppercase">
          Winner: {winningPlayer?.name}!
        </h2>
        <p className="text-slate-400">The judge has spoken.</p>
      </div>

      <div className="relative group">
        <div className="w-full max-w-md aspect-square bg-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all group-hover:scale-105">
          <img src={currentMeme!} alt="Meme" className="w-full h-full object-contain" />
        </div>
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm">
          <div className="bg-slate-900 border-2 border-green-500 p-6 rounded-2xl shadow-2xl text-center transform -rotate-1 group-hover:rotate-0 transition-transform">
            <p className="text-xl font-bold italic">"{winningSubmission?.text}"</p>
          </div>
        </div>
      </div>

      <div className="pt-20 w-full max-w-md">
        {isHost ? (
          <button
            onClick={nextRound}
            className="w-full py-5 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 font-black rounded-xl transition-all shadow-xl uppercase tracking-widest text-xl"
          >
            NEXT ROUND 🚀
          </button>
        ) : (
          <div className="text-center bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
            <p className="font-medium text-slate-400">Waiting for host to start next round...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resolution;
