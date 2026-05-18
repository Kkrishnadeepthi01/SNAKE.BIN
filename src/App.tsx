import { useState, useEffect } from 'react';
import { SnakeGame } from './components/SnakeGame';
import { MusicPlayer, Track } from './components/MusicPlayer';
import { MusicConnectModal } from './components/MusicConnectModal';
import { Terminal } from 'lucide-react';

export default function App() {
  const [score, setScore] = useState(0);
  const [customTracks, setCustomTracks] = useState<Track[]>([]);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);

  const handleAddLocalTrack = (track: Track) => {
    setCustomTracks(prev => [...prev, track]);
  };

  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem('snakeBestScore') || '0', 10);
  });

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('snakeBestScore', score.toString());
    }
  }, [score, bestScore]);

  return (
    <div className="h-screen w-screen bg-[#050505] text-white flex flex-col items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden text-xl font-sans relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#f0f]/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#0ff]/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="static-noise"></div>
      </div>

      {/* Arcade Cabinet Container */}
      <div className="arcade-bezel relative z-10 w-full h-full max-w-6xl p-3 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] flex flex-col gap-3 sm:gap-6 min-h-0">
        
        {/* Marquee Header */}
        <header className="arcade-marquee w-full p-2 sm:p-4 rounded-lg flex flex-row justify-between items-center z-10 gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <Terminal className="w-6 h-6 sm:w-10 sm:h-10 text-[#0ff] drop-shadow-[0_0_10px_#0ff]" />
            <h1 className="text-xl sm:text-4xl font-['Press_Start_2P'] text-white drop-shadow-[2px_2px_0_#f0f,-2px_-2px_0_#0ff]">
              SNAKE
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="bg-black/80 border-2 border-[#f0f] px-2 sm:px-4 py-1 sm:py-2 flex flex-col items-center shadow-[0_0_10px_#f0f,inset_0_0_10px_rgba(255,0,255,0.5)]">
              <span className="text-[#f0f] text-[8px] sm:text-xs tracking-widest uppercase mb-0.5 sm:mb-1 drop-shadow-[0_0_5px_#f0f]">
                SCORE
              </span>
              <span className="font-['Press_Start_2P'] text-sm sm:text-xl text-white">
                {score.toString().padStart(4, '0')}
              </span>
            </div>
            <div className="bg-black/80 border-2 border-[#0ff] px-2 sm:px-4 py-1 sm:py-2 flex flex-col items-center shadow-[0_0_10px_#0ff,inset_0_0_10px_rgba(0,255,255,0.5)]">
              <span className="text-[#0ff] text-[8px] sm:text-xs tracking-widest uppercase mb-0.5 sm:mb-1 drop-shadow-[0_0_5px_#0ff]">
                HI-SCORE
              </span>
              <span className="font-['Press_Start_2P'] text-sm sm:text-xl text-white">
                {bestScore.toString().padStart(4, '0')}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 min-h-0 flex flex-col lg:flex-row items-stretch justify-center gap-4 lg:gap-8 z-10 overflow-hidden">
          
          {/* Game Screen Container */}
          <div className="flex-1 flex items-center justify-center relative min-h-0 min-w-0">
            {/* Screen Bezel (Plastic surrounding screen) */}
            <div className="p-2 sm:p-4 lg:p-6 bg-[#0a0a0a] rounded-[1rem] sm:rounded-[2rem] border-t-2 border-b-4 border-l-2 border-r-4 border-black shadow-[inset_0_0_20px_rgba(0,0,0,1)] flex items-center justify-center w-full h-full max-h-full aspect-square md:aspect-auto">
              {/* Actual CRT Screen */}
              <div className="crt-screen crt-flicker w-full h-full flex items-center justify-center rounded-lg p-2 sm:p-4 border border-white/5 aspect-square max-h-full max-w-full shadow-[0_0_30px_rgba(0,255,255,0.1)]">
                <SnakeGame onScoreUpdate={setScore} />
              </div>
            </div>
          </div>

          {/* Right Control Panel / Deck */}
          <div className="w-full lg:w-80 flex flex-row lg:flex-col gap-4 justify-center items-center shrink-0">
            
            {/* Decorative Speaker Grill */}
            <div className="w-full flex justify-between px-4 pb-2 hidden lg:flex shrink-0">
              <div className="w-16 h-8 flex flex-wrap gap-1 opacity-20 overflow-hidden">
                {Array.from({length: 16}).map((_, i) => (
                  <div key={`l-${i}`} className="w-2 h-2 rounded-full bg-black shadow-[inset_0_1px_2px_rgba(0,0,0,1)]"></div>
                ))}
              </div>
              <div className="w-16 h-8 flex flex-wrap gap-1 opacity-20 overflow-hidden">
                {Array.from({length: 16}).map((_, i) => (
                  <div key={`r-${i}`} className="w-2 h-2 rounded-full bg-black shadow-[inset_0_1px_2px_rgba(0,0,0,1)]"></div>
                ))}
              </div>
            </div>

            {/* Music Player */}
            <div className="flex-1 lg:w-full bg-[#111] p-3 sm:p-4 rounded-xl border-t border-l border-white/10 border-b-4 lg:border-b-8 border-r-4 lg:border-r-8 border-black shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
              <MusicPlayer customTracks={customTracks} />
            </div>
            
            {/* Control Panel Graphics */}
            <div className="hidden sm:flex flex-1 lg:w-full lg:flex-none flex-col gap-2 bg-[#111] p-4 rounded-xl border-t border-l border-white/10 border-b-4 lg:border-b-8 border-r-4 lg:border-r-8 border-black shadow-[0_5px_15px_rgba(0,0,0,0.5)] text-[#0ff] text-xs sm:text-sm uppercase tracking-wider relative overflow-hidden">
              <div className="absolute inset-0 bg-[#0ff]/5 flex justify-center items-center pointer-events-none">
                <div className="w-24 h-24 border border-[#0ff]/20 rounded-full flex justify-center items-center">
                    <div className="w-16 h-16 border border-[#0ff]/20 rounded-full flex justify-center items-center">
                        <div className="w-10 h-10 border border-[#f0f]/20 rounded-full"></div>
                    </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center relative z-10 border-b border-white/10 pb-1.5">
                <span className="text-white/50">SYS</span>
                <span className="text-[#0ff] animate-pulse font-bold">ONLINE</span>
              </div>
              <div className="text-center mt-2 relative z-10 flex flex-col items-center gap-2">
                <div>
                  <span className="text-[#f0f] text-[10px] leading-tight block">WE CAN ENJOY</span>
                  <span className="text-[#f0f] text-[10px] leading-tight block">DIFFERENT MUSIC</span>
                </div>
                <button 
                  onClick={() => setIsMusicModalOpen(true)}
                  className="cursor-pointer bg-[#0ff]/20 hover:bg-[#0ff]/40 text-[#0ff] border border-[#0ff] px-2 py-1 text-[8px] sm:text-[10px] uppercase font-bold transition-colors shadow-[0_0_5px_#0ff] mt-1"
                >
                  + ADD MUSIC
                </button>
              </div>
            </div>
            
          </div>

        </main>
      </div>

      <MusicConnectModal 
        isOpen={isMusicModalOpen} 
        onClose={() => setIsMusicModalOpen(false)} 
        onAddLocalTrack={handleAddLocalTrack}
      />
    </div>
  );
}
