import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { useNetwork } from '../context/NetworkContext';
import Lobby from '../components/Lobby';
import Submission from '../components/Submission';
import Judging from '../components/Judging';
import Resolution from '../components/Resolution';
import { Wifi, WifiOff, Loader2, AlertCircle, RefreshCw, Copy, CheckCircle2 } from 'lucide-react';

const Game = () => {
  const navigate = useNavigate();
  const { 
    playerId, playerName, hostId, phase, players, networkStatus 
  } = useGameStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!playerName || !hostId) {
      navigate('/');
    }
  }, [playerName, hostId, navigate]);

  const { connectToHost } = useNetwork();
  const [hasAttemptedConnect, setHasAttemptedConnect] = useState(false);
  const [showRetry, setShowRetry] = useState(false);

  const handleRetry = useCallback(() => {
    if (hostId) {
      console.log('Manual retry triggered');
      connectToHost(hostId);
    }
  }, [hostId, connectToHost]);

  useEffect(() => {
    if (playerId && hostId && playerId !== hostId && !hasAttemptedConnect) {
      connectToHost(hostId);
      setHasAttemptedConnect(true);
      
      // Show retry button after 5 seconds if still not connected
      const timer = setTimeout(() => setShowRetry(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [playerId, hostId, connectToHost, hasAttemptedConnect]);

  if (!playerId) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 space-y-4">
        <Loader2 className="animate-spin text-purple-500 w-12 h-12" />
        <p className="text-xl text-slate-400 font-medium">Initializing Profile...</p>
      </div>
    );
  }

  const renderStatus = () => {
    switch (networkStatus) {
      case 'CONNECTING':
        return (
          <div className="flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 animate-pulse">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider">Syncing</span>
          </div>
        );
      case 'CONNECTED':
        return (
          <div className="flex items-center space-x-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20">
            <Wifi size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Live</span>
          </div>
        );
      case 'ERROR':
        return (
          <div className="flex items-center space-x-2 bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20">
            <AlertCircle size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Error</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-2 bg-slate-500/10 text-slate-400 px-3 py-1 rounded-full border border-slate-500/20">
            <WifiOff size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Offline</span>
          </div>
        );
    }
  };

  const copyRoomCode = async () => {
    if (!hostId) return;
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(hostId);
      } else {
        // Fallback for non-secure contexts (http://IP:PORT)
        const textArea = document.createElement("textarea");
        textArea.value = hostId;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  const renderPhase = () => {
    switch (phase) {
      case 'LOBBY': return <Lobby />;
      case 'SUBMISSION': return <Submission />;
      case 'JUDGING': return <Judging />;
      case 'RESOLUTION': return <Resolution />;
      default: return <Lobby />;
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="flex justify-between items-center bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Room</span>
            {renderStatus()}
          </div>
          <div 
            onClick={copyRoomCode} 
            className="flex items-center space-x-2 text-3xl font-black font-mono text-purple-400 select-all cursor-pointer tracking-wider hover:text-purple-300 transition-colors group"
          >
            <span>{hostId}</span>
            {copied ? (
              <CheckCircle2 size={20} className="text-green-500 animate-in zoom-in duration-300" />
            ) : (
              <Copy size={20} className="text-slate-600 group-hover:text-purple-400 transition-colors" />
            )}
            {copied && <span className="text-xs font-bold text-green-500 uppercase tracking-widest animate-in fade-in slide-in-from-left-2">Copied!</span>}
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Agent</span>
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">{playerName}</span>
        </div>
      </div>
      
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        {networkStatus === 'CONNECTING' && playerId !== hostId ? (
          <div className="text-center space-y-6">
            <Loader2 className="animate-spin text-purple-500 w-16 h-16 mx-auto opacity-50" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Connecting to Battle Station...</h2>
              <p className="text-slate-500 max-w-xs mx-auto text-sm">Waiting for the host to send the current game state.</p>
            </div>
            {showRetry && (
              <button onClick={handleRetry} className="flex items-center space-x-2 mx-auto bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm transition-all border border-slate-600">
                <RefreshCw size={14} />
                <span>Trouble connecting? Click to retry</span>
              </button>
            )}
          </div>
        ) : (
          renderPhase()
        )}
      </div>

      <div className="mt-8 border-t border-slate-800 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Squadron ({players.length})</h3>
          <div className="h-px bg-slate-800 flex-grow mx-4 opacity-50"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {players.map(p => (
            <div key={p.id} className={`p-4 rounded-2xl border-2 transition-all ${p.id === hostId ? 'border-purple-500/50 bg-purple-500/5 shadow-lg shadow-purple-500/5' : 'border-slate-800 bg-slate-800/50'} flex justify-between items-center group relative overflow-hidden`}>
              <div className="flex flex-col">
                <span className={`font-bold truncate ${p.id === playerId ? 'text-white' : 'text-slate-400'}`}>
                  {p.name} {p.id === playerId && '★'}
                </span>
                <div className="flex items-center space-x-1 mt-1">
                  {p.id === hostId && <span className="text-[8px] text-purple-500 font-black uppercase tracking-tighter bg-purple-500/10 px-1 rounded">Host</span>}
                  {p.id === useGameStore.getState().judgeId && <span className="text-[8px] text-amber-500 font-black uppercase tracking-tighter bg-amber-500/10 px-1 rounded border border-amber-500/20">Judge</span>}
                </div>
              </div>
              <span className="bg-slate-900 px-3 py-1 rounded-full text-xs font-black text-purple-400 border border-slate-700 z-10">{p.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Game;
