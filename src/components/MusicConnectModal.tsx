import React, { useState } from 'react';
import { X, Music, AlertTriangle, Upload } from 'lucide-react';
import { Track } from './MusicPlayer';

interface MusicConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLocalTrack: (track: Track) => void;
}

export const MusicConnectModal: React.FC<MusicConnectModalProps> = ({ isOpen, onClose, onAddLocalTrack }) => {
  const [selectedService, setSelectedService] = useState<'spotify' | 'jiosaavn' | null>(null);

  if (!isOpen) return null;

  const handleSpotifyConnect = () => {
    const clientId = (import.meta as any).env.VITE_SPOTIFY_CLIENT_ID;
    if (!clientId) {
      alert("Spotify Client ID missing! Please add VITE_SPOTIFY_CLIENT_ID to your environment variables to enable literal Spotify integration.");
      return;
    }
    const redirectUri = window.location.origin;
    const scope = 'streaming user-read-email user-read-private';
    const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    // In a real application, we would redirect the user to authUrl
    window.location.href = authUrl;
  };

  const handleJioSaavnConnect = () => {
    alert("JioSaavn API requires a proxy backend to bypass CORS and authenticate correctly. Please configure JioSaavn developer keys as per their official API if available.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onAddLocalTrack({
        id: Date.now(),
        title: file.name.replace(/\.[^/.]+$/, "").substring(0, 15).toUpperCase(),
        artist: "LOCAL_USER",
        url: url,
        coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=150&q=80"
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111] border-2 border-[#0ff] shadow-[0_0_30px_#0ff] w-full max-w-md flex flex-col overflow-hidden animate-pulse-[pulse_2s_ease-in-out_infinite]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[#0ff]/30 bg-[#0ff]/10">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-[#f0f]" />
            <h2 className="text-[#0ff] font-['Press_Start_2P'] text-sm tracking-widest mt-1">CONNECT MEDIA</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-[#f0f] hover:text-white transition-colors p-1 border border-transparent hover:border-[#f0f] bg-black/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6 relative">
          <div className="absolute inset-0 bg-[#0ff]/5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#0ff 1px, transparent 1px)', backgroundSize: '100% 4px', opacity: 0.1 }}></div>
          
          <div className="relative z-10 flex flex-col gap-4">
            {/* Spotify */}
            <button 
              onClick={handleSpotifyConnect}
              className="flex items-center gap-4 p-4 border-2 border-[#1DB954]/50 hover:border-[#1DB954] bg-[#1DB954]/10 hover:bg-[#1DB954]/20 transition-all text-white focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
            >
              <div className="w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center shrink-0">
                <Music className="w-4 h-4 text-black" />
              </div>
              <div className="flex flex-col items-start flex-1">
                <span className="font-['Press_Start_2P'] text-xs text-[#1DB954] mb-1">SPOTIFY</span>
                <span className="text-[10px] text-white/70 font-mono">OAUTH_FLOW_INIT</span>
              </div>
            </button>

            {/* JioSaavn */}
            <button 
              onClick={handleJioSaavnConnect}
              className="flex items-center gap-4 p-4 border-2 border-[#ff9900]/50 hover:border-[#ff9900] bg-[#ff9900]/10 hover:bg-[#ff9900]/20 transition-all text-white focus:outline-none focus:ring-2 focus:ring-[#ff9900]"
            >
              <div className="w-8 h-8 rounded-full bg-[#ff9900] flex items-center justify-center shrink-0">
                <Music className="w-4 h-4 text-black" />
              </div>
              <div className="flex flex-col items-start flex-1">
                <span className="font-['Press_Start_2P'] text-xs text-[#ff9900] mb-1">JIOSAAVN</span>
                <span className="text-[10px] text-white/70 font-mono">PROXY_REQUIRED</span>
              </div>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-[1px] bg-[#0ff]/30"></div>
              <span className="text-[#0ff] font-['Press_Start_2P'] text-[10px]">OR</span>
              <div className="flex-1 h-[1px] bg-[#0ff]/30"></div>
            </div>

            {/* Local File */}
            <label className="flex items-center gap-4 p-4 border-2 border-[#f0f]/50 hover:border-[#f0f] bg-[#f0f]/10 hover:bg-[#f0f]/20 transition-all text-white cursor-pointer group">
              <div className="w-8 h-8 flex items-center justify-center border border-[#f0f] text-[#f0f] group-hover:bg-[#f0f] group-hover:text-black shrink-0 transition-colors">
                <Upload className="w-4 h-4" />
              </div>
              <div className="flex flex-col items-start flex-1">
                <span className="font-['Press_Start_2P'] text-xs text-[#f0f] mb-1">LOCAL DISK</span>
                <span className="text-[10px] text-white/70 font-mono">UPLOAD.WAV/.MP3</span>
              </div>
              <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
            </label>

          </div>

          {/* Config Alert */}
          <div className="relative z-10 flex gap-3 items-start border border-[#f0f] bg-[#f0f]/10 p-3 mt-2">
            <AlertTriangle className="w-4 h-4 text-[#f0f] shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#f0f] uppercase tracking-wider font-mono leading-tight">
              EXTERNAL APIS REQUIRE ENVIRONMENT AUTHENTICATION KEYS IN SETTINGS (.ENV). 
              FALLBACK TO LOCAL UPLOAD IF KEYS ARE UNAVAILABLE.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
