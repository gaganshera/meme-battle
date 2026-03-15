import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { customAlphabet } from 'nanoid';
import { User, PlusCircle, LogIn } from 'lucide-react';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

const Home = () => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();
  const { setPlayerInfo, setGameState } = useGameStore();

  const isNameEmpty = !name.trim();
  const isRoomIdEmpty = !roomId.trim();

  const handleCreate = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const id = nanoid();
    setPlayerInfo(id, trimmedName);
    setGameState({ 
      hostId: id, 
      players: [{ id, name: trimmedName, score: 0 }],
      phase: 'LOBBY'
    });
    navigate('/game');
  };

  const handleJoin = () => {
    const trimmedName = name.trim();
    const trimmedRoomId = roomId.trim().toUpperCase();
    if (!trimmedName || !trimmedRoomId) return;
    const id = nanoid();
    setPlayerInfo(id, trimmedName);
    setGameState({ hostId: trimmedRoomId, phase: 'LOBBY', players: [] });
    navigate('/game');
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-12 mt-12 max-w-md mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 via-pink-500 to-orange-500 tracking-tighter uppercase italic">
          Meme Battle
        </h2>
        <p className="text-slate-400 text-lg">Who creates the funniest memes? Time to find out.</p>
      </div>

      <div className="w-full space-y-8 bg-slate-800/50 p-8 rounded-3xl border border-slate-700 backdrop-blur-sm shadow-2xl">
        {/* Step 1: Identity */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-purple-400">
            <User size={20} />
            <h3 className="font-bold uppercase tracking-wider text-sm">Step 1: Your Identity</h3>
          </div>
          <div className="relative">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What's your legendary name?"
              className="w-full bg-slate-900/80 border-2 border-slate-700 rounded-2xl px-5 py-4 text-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

        {/* Step 2: Action */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 text-pink-400">
            <LogIn size={20} />
            <h3 className="font-bold uppercase tracking-wider text-sm">Step 2: Choose Your Path</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Create Flow */}
            <button 
              onClick={handleCreate}
              disabled={isNameEmpty}
              className="group flex items-center justify-between w-full bg-slate-900 border-2 border-slate-700 hover:border-purple-500 hover:bg-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-700 disabled:hover:bg-slate-900 p-5 rounded-2xl transition-all"
            >
              <div className="text-left">
                <span className="block font-bold text-lg group-hover:text-purple-400 transition-colors">Create Room</span>
                <span className="text-sm text-slate-500">Start a new game session</span>
              </div>
              <PlusCircle className="text-slate-600 group-hover:text-purple-500 transition-colors" />
            </button>

            <div className="flex items-center space-x-4 py-2">
              <div className="h-px bg-slate-800 flex-grow"></div>
              <span className="text-slate-600 font-bold text-xs uppercase tracking-widest">OR</span>
              <div className="h-px bg-slate-800 flex-grow"></div>
            </div>

            {/* Join Flow */}
            <div className="space-y-3">
              <input 
                type="text" 
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit room code"
                className="w-full bg-slate-900/80 border-2 border-slate-700 rounded-2xl px-5 py-4 text-center text-xl font-mono tracking-widest focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 focus:outline-none transition-all placeholder:text-slate-600 uppercase"
              />
              <button 
                onClick={handleJoin}
                disabled={isNameEmpty || isRoomIdEmpty}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed py-4 rounded-2xl font-black text-lg shadow-xl shadow-purple-900/20 active:scale-[0.98] transition-all uppercase tracking-wider"
              >
                Join Battle
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {isNameEmpty && (
        <p className="text-amber-500 text-sm font-medium animate-pulse">
          ⚠️ Please enter your name first!
        </p>
      )}
    </div>
  );
};

export default Home;
