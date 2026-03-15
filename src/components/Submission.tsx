import { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useNetwork } from '../context/NetworkContext';
import { Clock } from 'lucide-react';

const Submission = () => {
  const { 
    playerId, judgeId, currentMeme, hands, submittedCaptions, players, timerEnd, hostId, setGameState
  } = useGameStore();
  const { sendToHost, syncFullState } = useNetwork();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const isJudge = playerId === judgeId;
  const isHost = playerId === hostId;
  const myHand = hands[playerId!] || [];
  const alreadySubmitted = submittedCaptions.some(s => s.playerId === playerId);
  const totalSubmissions = submittedCaptions.length;
  const requiredSubmissions = players.length - 1;

  // Timer countdown
  useEffect(() => {
    if (!timerEnd) return;

    const updateTimer = () => {
      const state = useGameStore.getState();
      const remaining = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
      setTimeLeft(remaining);

      // Host logic: Auto-transition when timer hits 0
      if (isHost && remaining === 0 && state.phase === 'SUBMISSION') {
        if (state.submittedCaptions.length === 0) {
          console.log('[Timer] No submissions! Starting new round.');
          // In a real game we might want to show a message, but for now let's just move to Judging 
          // which will handle the empty state, or we could force a new round.
          // Let's go to JUDGING so players see what happened.
          setGameState({ phase: 'JUDGING', timerEnd: null });
        } else {
          console.log('[Timer] Time expired! Transitioning to JUDGING.');
          setGameState({ phase: 'JUDGING', timerEnd: null });
        }
        syncFullState();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [timerEnd, isHost, setGameState, syncFullState]);

  const handleSubmit = () => {
    if (!selectedCard || isJudge || alreadySubmitted) return;
    sendToHost({ type: 'SUBMIT_CAPTION', playerId: playerId!, text: selectedCard });
    setHasSubmitted(true);
  };

  const timerColor = (timeLeft !== null && timeLeft < 10) ? 'text-red-500 animate-pulse' : 'text-purple-400';
  const judgePlayer = players.find(p => p.id === judgeId);

  return (
    <div className="flex flex-col items-center space-y-6 w-full">
      <div className="flex justify-between items-center w-full max-w-md bg-slate-800/30 px-6 py-3 rounded-2xl border border-slate-700/50">
        <div className="flex items-center space-x-2">
          <Clock size={18} className={timerColor} />
          <span className={`font-mono text-xl font-black ${timerColor}`}>
            {timeLeft !== null ? `${timeLeft}s` : '--s'}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Judge</p>
          <p className="text-sm font-bold text-purple-400">{judgePlayer?.name || 'Unknown'}</p>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold">
          {isJudge ? "You are the Judge!" : "Pick the funniest caption!"}
        </h2>
        {!isJudge && (
          <p className="text-slate-500 text-sm mt-1">
            {totalSubmissions} / {requiredSubmissions} submissions received
          </p>
        )}
      </div>

      <div className="w-full max-w-md aspect-square bg-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
        <img src={currentMeme!} alt="Meme" className="w-full h-full object-contain" />
        {isJudge && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-8 text-center">
            <div className="space-y-4">
              <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
                <Clock className="text-white" size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase italic tracking-tight">Waiting for Squad...</h3>
                <p className="text-slate-300 text-sm">You'll get to pick the winner once everyone submits or time runs out.</p>
              </div>
              <div className="pt-4">
                <span className="text-4xl font-black font-mono text-white">{totalSubmissions} / {requiredSubmissions}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isJudge && (
        (hasSubmitted || alreadySubmitted) ? (
          <div className="py-10 text-center animate-in fade-in zoom-in">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-green-400">Payload Deployed!</h3>
            <p className="text-slate-400">Waiting for {judgePlayer?.name} to decide...</p>
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
              className="w-full py-4 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-700 font-black rounded-xl transition-all shadow-lg active:scale-[0.98]"
            >
              SUBMIT CAPTION
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default Submission;
