import React, { useEffect, useState, useRef } from 'react';
import { LiveClient } from '../services/liveService';
import { MicOff, Activity, Zap, Phone } from 'lucide-react';
import { LiveToolHandlers } from '../types';

interface LiveSessionProps {
  onClose: () => void;
}

const LiveSession: React.FC<LiveSessionProps> = ({ onClose }) => {
  const [status, setStatus] = useState('Initializing...');
  const [volume, setVolume] = useState(0);
  const [client] = useState(() => new LiveClient());
  const [hasFlashlight, setHasFlashlight] = useState(false);
  const videoStreamRef = useRef<MediaStream | null>(null);

  // Tool Handlers
  const toolHandlers: LiveToolHandlers = {
    onToggleFlashlight: async (on: boolean) => {
        try {
            if (on) {
                // Request Camera for Torch
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment' } 
                });
                videoStreamRef.current = stream;
                const track = stream.getVideoTracks()[0];
                
                // Check if torch is supported
                const capabilities = track.getCapabilities() as any;
                if (!capabilities.torch) {
                    console.warn("Torch not supported on this device");
                    return false;
                }

                await track.applyConstraints({
                    advanced: [{ torch: true } as any]
                });
                setHasFlashlight(true);
            } else {
                // Turn off
                if (videoStreamRef.current) {
                    const track = videoStreamRef.current.getVideoTracks()[0];
                    await track.applyConstraints({
                        advanced: [{ torch: false } as any]
                    });
                    track.stop(); // Stop stream to release camera
                    videoStreamRef.current = null;
                    setHasFlashlight(false);
                }
            }
            return true;
        } catch (e) {
            console.error("Flashlight Error", e);
            return false;
        }
    },
    onMakeCall: async (number: string) => {
        try {
            window.location.href = `tel:${number}`;
            return true;
        } catch (e) {
            console.error("Call Error", e);
            return false;
        }
    }
  };

  useEffect(() => {
    // Pass setVolume to receive real-time audio level updates
    // Pass toolHandlers to execute actions
    client.connect(setStatus, setVolume, toolHandlers);
    return () => {
      client.disconnect();
      // Ensure flashlight is off on exit
      if (videoStreamRef.current) {
          videoStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [client]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-transparent text-white overflow-hidden relative">
      {/* Background Ambience (Transparent/Gradient overlay on top of global BG) */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-64 h-64 flex items-center justify-center">
             {/* Reactive Glow Ring (Listening Cue) */}
             <div 
                className="absolute inset-0 rounded-full bg-blue-500/20 blur-3xl transition-transform duration-75 ease-out will-change-transform"
                style={{ 
                    transform: `scale(${1 + volume * 1.5})`,
                    opacity: 0.3 + (volume * 0.5)
                }}
             ></div>

             {/* Inner Ring */}
             <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-md flex items-center justify-center relative animate-pulse border border-white/10">
                <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[spin_10s_linear_infinite]"></div>
                
                {/* Icon Scales Slightly with Voice */}
                <div style={{ transform: `scale(${1 + volume * 0.2})`, transition: 'transform 0.1s' }}>
                    <Activity size={64} className="text-blue-400 drop-shadow-[0_0_10px_rgba(60,130,246,0.5)]" />
                </div>
             </div>
        </div>
        
        <h2 className="mt-10 text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
            ahmedkoka_1_ai Live
        </h2>
        
        <p className={`mt-3 text-sm font-mono flex items-center gap-2 ${status === 'Live' ? 'text-green-400' : 'text-yellow-500'}`}>
          <span className={`w-2 h-2 rounded-full ${status === 'Live' ? 'bg-green-400 animate-pulse' : 'bg-yellow-500'}`}></span>
          {status}
        </p>

        {/* Status Indicators */}
        <div className="flex gap-4 mt-4 h-6">
            {hasFlashlight && (
                <div className="flex items-center gap-1 text-yellow-400 text-xs animate-pulse">
                    <Zap size={12} fill="currentColor" /> Flashlight On
                </div>
            )}
        </div>

        <div className="mt-12 flex gap-6">
            <button 
                onClick={onClose}
                className="px-8 py-4 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md text-red-200 rounded-full transition-all border border-red-500/30 flex items-center gap-3 font-medium active:scale-95 shadow-lg"
            >
                <MicOff size={20} /> End Session
            </button>
        </div>
        
        <div className="mt-8 text-xs text-gray-400 max-w-md text-center px-4">
            Try saying "Turn on flash" or "Call 011..."
        </div>
      </div>
    </div>
  );
};

export default LiveSession;