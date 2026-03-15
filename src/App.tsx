import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Laugh } from 'lucide-react';
import Home from './pages/Home';
import Game from './pages/Game';
import { NetworkProvider } from './context/NetworkContext';
import './index.css';

function App() {
  return (
    <NetworkProvider>
      <BrowserRouter>
        <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col items-center">
          <header className="p-4 border-b border-slate-700 w-full flex justify-center items-center space-x-2">
            <Laugh className="text-purple-500 w-8 h-8" />
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">What Do You Meme?</h1>
          </header>
          <main className="flex-grow w-full max-w-4xl p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/game" element={<Game />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </NetworkProvider>
  );
}

export default App;
