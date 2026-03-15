import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useNetwork } from '../context/NetworkContext';

const Submission = () => {
  const { 
    playerId, judgeId, currentMeme, hands, submittedCaptions, players 
  } = useGameStore();
  const { sendToHost } = useNetwork();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const isJudge = playerId === judgeId;
  const myHand = hands[playerId!] || [];
  const alreadySubmitted = submittedCaptions.some(s => s.playerId === playerId);
  const totalSubmissions = submittedCaptions.length;
  const requiredSubmissions = players.length - 1;

  const handleSubmit = () => {
    if (!selectedCard || isJudge || alreadySubmitted) return;
    sendToHost({ type: 'SUBMIT_CAPTION', playerId: playerId!, text: selectedCard });
    setHasSubmitted(true);
  };

  if (isJudge) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="bg-purple-600/20 border border-purple-500/50 p-4 rounded-xl text-center">
          <h2 className="text-2xl font-bold text-purple-400">YOU ARE THE JUDGE!</h2>
          <p className="text-sm text-purple-200/70 uppercase tracking-widest font-semibold mt-1">Wait for submissions</p>
        </div>
        
        <div className="w-full max-w-lg aspect-square bg-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
          <img src={currentMeme!} alt="Meme" className="w-full h-full object-contain" />
        </div>

        <div className="text-center">
          <p className="text-2xl font-black text-slate-100 mb-2">
            {totalSubmissions} / {requiredSubmissions}
          </p>
          <p className="text-slate-500 uppercase text-xs font-bold tracking-widest">Submissions received</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Pick the funniest caption!</h2>
        <p className="text-slate-500 text-sm">Waiting for: {requiredSubmissions - totalSubmissions} players</p>
      </div>

      <div className="w-full max-w-md aspect-square bg-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <img src={currentMeme!} alt="Meme" className="w-full h-full object-contain" />
      </div>

      {(hasSubmitted || alreadySubmitted) ? (
        <div className="py-10 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-green-400">Submission Received!</h3>
          <p className="text-slate-400">Wait for the judge to decide...</p>
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myHand.map((caption, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCard(caption)}
                className={`p-4 text-left rounded-xl border-2 transition-all ${
                  selectedCard === caption 
                  ? 'border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/10' 
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                {caption}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!selectedCard}
            className="w-full py-4 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-700 font-black rounded-xl transition-all shadow-lg"
          >
            SUBMIT CAPTION
          </button>
        </div>
      )}
    </div>
  );
};

export default Submission;
