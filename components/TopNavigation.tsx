
import React, { useRef, useState } from 'react';
import { FeatureMode } from '../types';
import { 
  MessageSquare, BrainCircuit, Search, MapPin, 
  Image as ImageIcon, Edit, Radio, Zap, Menu, LogOut, Share2, Check, Info, 
  ChevronDown, ChevronUp, Mic2, X
} from 'lucide-react';

interface TopNavigationProps {
  currentMode: FeatureMode;
  setMode: (mode: FeatureMode) => void;
  onToggleSidebar: () => void;
  onLogout: () => void;
  username?: string;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ currentMode, setMode, onToggleSidebar, onLogout, username }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);

  const handleShare = () => {
    const link = "https://ahmedkoka-1-ai.web.app"; 
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const modes = [
    { mode: FeatureMode.CHAT, icon: MessageSquare, label: 'Chat' },
    { mode: FeatureMode.MUSIC_CRITIQUE, icon: Mic2, label: 'Music & Songs', color: 'text-pink-400' }, 
    { mode: FeatureMode.THINKING, icon: BrainCircuit, label: 'Deep Think' },
    { mode: FeatureMode.LIVE, icon: Radio, label: 'Live', special: true },
    { mode: FeatureMode.NANO_BANANA_GEN, icon: Zap, label: 'Nano (Free)', color: 'text-yellow-400' },
    { mode: FeatureMode.IMAGE_GEN, icon: ImageIcon, label: 'Pro Image' },
    { mode: FeatureMode.IMAGE_EDIT, icon: Edit, label: 'Edit' },
    { mode: FeatureMode.SEARCH, icon: Search, label: 'Search' },
    // Maps removed from UI list as requested, but logic remains in services
  ];

  return (
    <>
    <div className="bg-[#1e1f20]/80 backdrop-blur-md border-b border-white/10 flex flex-col z-40 shadow-md relative transition-all duration-300">
      {/* Top Row: Brand & User Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
           <button 
                onClick={onToggleSidebar}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95"
            >
                <Menu size={20} />
            </button>
           <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
            ahmedkoka_1_ai
          </h1>
        </div>

        <div className="flex items-center gap-2">
            <button 
                onClick={handleShare}
                className="p-2 text-blue-400 hover:text-white hover:bg-blue-900/20 rounded-full transition-all active:scale-95 flex items-center gap-2"
                title="Copy Link"
            >
                {copied ? <Check size={18} /> : <Share2 size={18} />}
            </button>

            <button
                onClick={() => setShowInfo(true)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95"
                title="Developer Info"
            >
                <Info size={18} />
            </button>
            
            <div className="flex items-center gap-2 pl-2 border-l border-gray-700 ml-1">
                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-gradient-to-br from-green-400/10 to-blue-500/10 border border-blue-500/20">
                     <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white cursor-default shadow-md">
                        {username ? username[0].toUpperCase() : 'U'}
                    </div>
                </div>
               
                <button 
                    onClick={onLogout}
                    className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-all active:scale-95"
                    title="Sign Out"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </div>
      </div>

      {/* Mode Selection Toggle */}
      <div className="w-full flex justify-center -mt-0.5 relative z-50">
          <button 
            onClick={() => setIsMenuExpanded(!isMenuExpanded)}
            className="bg-[#1e1f20] border-b border-l border-r border-white/10 rounded-b-xl px-4 py-0.5 text-gray-400 hover:text-blue-400 transition-colors shadow-lg flex items-center gap-1 text-[10px] uppercase tracking-widest"
          >
            {isMenuExpanded ? (
                <><ChevronUp size={14} /> Hide Menu</>
            ) : (
                <><ChevronDown size={14} /> Select Mode</>
            )}
          </button>
      </div>

      {/* Collapsible Bottom Row: Navigation Modes */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuExpanded ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div 
            ref={scrollRef}
            className="flex items-center overflow-x-auto py-3 px-2 scrollbar-hide gap-1 mask-linear-fade justify-center"
            style={{ scrollBehavior: 'smooth' }}
        >
            {modes.map((item) => (
            <button
                key={item.mode}
                onClick={() => {
                    setMode(item.mode);
                    // Optional: Close menu after selection
                    // setIsMenuExpanded(false); 
                }}
                className={`flex-shrink-0 flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95 border ${
                currentMode === item.mode
                    ? 'bg-[#37393b]/80 border-blue-500/50 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'bg-transparent border-transparent text-gray-400 hover:bg-white/10 hover:text-gray-200'
                }`}
            >
                <item.icon className={`mr-1.5 h-4 w-4 ${item.special ? 'text-red-400 animate-pulse' : ''} ${item.color || ''}`} />
                {item.label}
            </button>
            ))}
        </div>
      </div>
    </div>

    {/* Developer Info Modal (Same as before) */}
    {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-[#1e1f20]/90 backdrop-blur-xl border border-gray-700 rounded-3xl w-full max-w-sm p-6 relative shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <button 
                    onClick={() => setShowInfo(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white active:scale-90 transition-transform"
                >
                    <X size={20} />
                </button>
                
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Info size={24} className="text-blue-400 drop-shadow-md" />
                    App Info
                </h3>
                
                 <div className="space-y-4">
                     <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                        <p className="text-gray-300 text-sm leading-relaxed">
                            <strong className="text-white">ahmedkoka_1_ai</strong> is a personal AI assistant featuring advanced multi-modal capabilities including Gemini 2.5 Flash, Deep Thinking, Live Conversation, and Image Generation.
                        </p>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-3">
                         <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                             <div className="text-2xl font-bold text-blue-400">2.5</div>
                             <div className="text-[10px] text-gray-400 uppercase tracking-wider">Gemini Model</div>
                         </div>
                         <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
                             <div className="text-2xl font-bold text-purple-400">Pro</div>
                             <div className="text-[10px] text-gray-400 uppercase tracking-wider">Capabilities</div>
                         </div>
                     </div>

                     <div className="text-center text-gray-400 text-sm pt-2">Created by Ahmed Mohamed</div>
                 </div>
            </div>
        </div>
    )}
    </>
  );
};

export default TopNavigation;
