import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Rewind, FastForward } from 'lucide-react';

export interface Track {
  id: number | string;
  title: string;
  artist: string;
  url: string;
  coverUrl: string;
}

export const MUSIC_TRACKS: Track[] = [
  {
    id: 1,
    title: "NEON_HORIZON",
    artist: "SYNTH_NET",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: "https://images.unsplash.com/photo-1626544827763-d516dce335e2?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: 2,
    title: "CYBER_PULSE",
    artist: "ALGORITHM_8",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: 3,
    title: "DIGITAL_DRIFT",
    artist: "NULL_PTR",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: "https://images.unsplash.com/photo-1502134259470-89d31341c51b?auto=format&fit=crop&w=150&q=80"
  }
];

interface MusicPlayerProps {
  customTracks?: Track[];
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ customTracks = [] }) => {
  const allTracks = [...MUSIC_TRACKS, ...customTracks];
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = allTracks[currentTrackIndex % allTracks.length] || allTracks[0];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error("Playback prevented by browser:", err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlayControl = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % allTracks.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + allTracks.length) % allTracks.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration > 0) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleTrackEnd = () => {
    nextTrack();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setProgress(newProgress);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
    }
  };

  const skipForward10 = () => {
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, audioRef.current.duration);
      handleTimeUpdate();
    }
  };

  const skipBackward10 = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
      handleTimeUpdate();
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-4 relative z-20">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
      />

      <div className="flex items-center gap-4">
        {/* Cover Art / Visualizer */}
        <div className="relative w-16 h-16 border-2 border-[#f0f] flex-shrink-0 bg-black overflow-hidden">
          <div className="absolute inset-0 bg-[#0ff]/20 z-10 pointer-events-none mix-blend-difference" />
          {isPlaying ? (
            <div className="absolute inset-0 bg-[#f0f]/30 z-20 animate-pulse mix-blend-color-burn" />
          ) : null}
          <img 
            src={currentTrack.coverUrl} 
            alt="Data Block" 
            className={`w-full h-full object-cover transition-transform duration-[1s] filter grayscale contrast-200 ${isPlaying ? 'scale-110' : 'scale-100'}`}
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-['Press_Start_2P'] text-[#0ff] truncate text-xs drop-shadow-[1px_1px_0_#f0f]">
              SNAKE.BIN
            </h3>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full flex items-center gap-2 group cursor-pointer relative mt-2">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="h-4 bg-[#000] w-full border-2 border-[#0ff] relative">
          <div 
            className="h-full bg-[#f0f]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-2 border-t-2 border-[#0ff] pt-2">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 text-[#0ff] hover:text-[#f0f] hover:bg-[#0ff]/10 transition-colors border border-transparent hover:border-[#f0f]"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={prevTrack}
            className="p-1 sm:p-2 text-[#f0f] hover:text-[#0ff] focus:outline-none hover:bg-[#f0f]/10 border border-transparent hover:border-[#0ff]"
            title="Previous Track"
          >
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <button 
            onClick={skipBackward10}
            className="p-1 sm:p-2 text-[#f0f] hover:text-[#0ff] focus:outline-none hover:bg-[#f0f]/10 border border-transparent hover:border-[#0ff]"
            title="-10s"
          >
            <Rewind className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button 
            onClick={togglePlayControl}
            className="button-glitch w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center focus:outline-none"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-black" fill="currentColor" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 ml-1 text-black" fill="currentColor" />
            )}
          </button>
          
          <button 
            onClick={skipForward10}
            className="p-1 sm:p-2 text-[#f0f] hover:text-[#0ff] focus:outline-none hover:bg-[#f0f]/10 border border-transparent hover:border-[#0ff]"
            title="+10s"
          >
            <FastForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button 
            onClick={nextTrack}
            className="p-1 sm:p-2 text-[#f0f] hover:text-[#0ff] focus:outline-none hover:bg-[#f0f]/10 border border-transparent hover:border-[#0ff]"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="w-9" />
      </div>
    </div>
  );
};
