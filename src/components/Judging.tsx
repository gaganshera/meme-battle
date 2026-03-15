import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useNetwork } from '../context/NetworkContext';

const Judging = () => {
  const { 
    playerId, judgeId, currentMeme, submittedCaptions 
  } = useGameStore();
  const { sendToHost } = useNetwork();
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const isJudge = playerId === judgeId;

  const handlePickWinner = () => {
    if (!selectedWinner || !isJudge) return;
    sendToHost({ type: 'PICK_WINNER', winnerId: selectedWinner });
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2 italic uppercase">
          {isJudge ? "Judge's Choice" : "Judging in Progress"}
        </h2>
        <p className="text-slate-500">{isJudge ? "Which one is the funniest?" : "Wait for the judge to decide"}</p>
      </div>

      <div className="w-full max-w-md aspect-square bg-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <img src={currentMeme!} alt="Meme" className="w-full h-full object-contain" />
      </div>

      <div className="w-full space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Submitted Captions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submittedCaptions.map((submission) => (
            <button
              key={submission.playerId}
              onClick={() => isJudge && setSelectedWinner(submission.playerId)}
              disabled={!isJudge}
              className={`p-6 text-left rounded-xl border-2 transition-all ${
                selectedWinner === submission.playerId
                ? 'border-yellow-500 bg-yellow-500/10 scale-105' 
                : 'border-slate-700 bg-slate-800/80 hover:border-slate-600'
              } ${!isJudge && 'cursor-default'}`}
            >
              <p className="text-lg font-medium">"{submission.text}"</p>
            </button>
          ))}
        </div>

        {isJudge && (
          <button
            onClick={handlePickWinner}
            disabled={!selectedWinner}
            className="w-full py-5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-slate-700 disabled:to-slate-700 font-black rounded-xl transition-all shadow-xl mt-6 uppercase tracking-widest"
          >
            CONFIRM WINNER
          </button>
        )}
      </div>
    </div>
  );
};

export default Judging;
