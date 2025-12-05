import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { Bot, User, Map, Volume2, Download, Sparkles, BrainCircuit } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onPlayTTS: (text: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onPlayTTS }) => {
  const isUser = message.role === 'user';

  // Function to overlay watermark on image for download
  const downloadImageWithWatermark = async (url: string, filename: string) => {
    try {
        const img = new Image();
        img.src = url;
        img.crossOrigin = "anonymous";
        await new Promise((resolve) => { img.onload = resolve; });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            return;
        }

        ctx.drawImage(img, 0, 0);

        const text = "ahmedkoka_1";
        const fontSize = Math.max(20, img.height * 0.04); 
        ctx.font = `600 ${fontSize}px sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const metrics = ctx.measureText(text);
        const padding = fontSize; 
        
        const x = canvas.width - metrics.width - padding;
        const y = canvas.height - padding;

        ctx.fillText(text, x, y);

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
    }
  };

  const handleDownloadVideo = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
        className={`flex w-full mb-8 group animate-in slide-in-from-bottom-4 duration-500 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[90%] md:max-w-[80%] lg:max-w-[70%] items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110 ${
            isUser 
                ? 'bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600' 
                : 'bg-black border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
        }`}>
          {isUser ? <User size={18} className="text-gray-300" /> : <Bot size={18} className="text-blue-400" />}
        </div>

        {/* Content Bubble */}
        <div className="flex flex-col relative w-full">
            
            {/* Thinking Badge */}
            {!isUser && message.isThinking && (
                 <div className="flex items-center gap-2 mb-2 ml-1 opacity-70">
                    <div className="p-1 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <BrainCircuit size={12} className="text-purple-400 animate-pulse"/>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-purple-300 font-semibold">Deep Thinking</span>
                 </div>
            )}

            <div 
                className={`relative px-6 py-4 shadow-xl backdrop-blur-2xl transition-all duration-300 ${
                isUser 
                    ? 'bg-gradient-to-br from-blue-600 to-violet-700 text-white rounded-2xl rounded-tr-none border border-white/10' 
                    : 'bg-[#151617]/70 text-gray-100 rounded-2xl rounded-tl-none border border-white/10 hover:border-blue-500/30 hover:bg-[#1a1b1c]/80'
                }`}
            >
                {/* Glow Effect for AI bubbles */}
                {!isUser && <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl -z-10"></div>}

                {/* Images */}
                {message.image && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-white/10 relative group/media shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                    <img src={message.image} alt="Generated" className="w-full h-auto object-cover transform transition-transform duration-700 group-hover/media:scale-105" />
                    
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 pointer-events-none z-10">
                        <div className="bg-black/50 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
                             <Sparkles size={14} className="text-blue-400" />
                        </div>
                        <span className="text-sm font-bold text-white tracking-wide font-sans drop-shadow-md">
                            ahmedkoka_1
                        </span>
                    </div>

                    <button 
                        onClick={() => downloadImageWithWatermark(message.image!, `ahmedkoka_image_${Date.now()}.png`)}
                        className="absolute top-3 right-3 p-2.5 bg-black/60 hover:bg-blue-600 text-white rounded-xl opacity-0 group-hover/media:opacity-100 transition-all duration-300 backdrop-blur-md border border-white/10 active:scale-95 shadow-lg"
                        title="Download"
                    >
                        <Download size={18} />
                    </button>
                    </div>
                )}

                {/* Videos */}
                {message.video && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-white/10 relative group/media shadow-2xl">
                    <video src={message.video} controls className="w-full h-auto bg-black" />
                    
                    <div className="absolute top-4 left-4 z-10 pointer-events-none opacity-0 group-hover/media:opacity-100 transition-opacity">
                         <span className="bg-blue-600/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                            Veo Gen
                         </span>
                    </div>

                    <div className="absolute bottom-16 right-4 flex items-center gap-2 pointer-events-none z-10">
                         <span className="text-xs font-bold text-white/80 tracking-widest drop-shadow-lg">
                            ahmedkoka_1
                        </span>
                    </div>

                    <button 
                        onClick={() => handleDownloadVideo(message.video!, `ahmedkoka_video_${Date.now()}.mp4`)}
                        className="absolute top-3 right-3 p-2.5 bg-black/60 hover:bg-blue-600 text-white rounded-xl opacity-0 group-hover/media:opacity-100 transition-all duration-300 backdrop-blur-md border border-white/10 active:scale-95 z-20"
                        title="Download Video"
                    >
                        <Download size={18} />
                    </button>
                    </div>
                )}

                {/* Text Content */}
                {message.text && (
                    <div className={`markdown prose prose-invert prose-sm max-w-none leading-relaxed ${isUser ? 'text-white/95' : 'text-gray-200'}`}>
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                    </div>
                )}
                
                {/* Action Bar (TTS) */}
                {!isUser && message.text && (
                    <div className="absolute -bottom-6 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                            onClick={() => onPlayTTS(message.text!)}
                            className="text-gray-500 hover:text-blue-400 transition-colors p-1"
                            title="Read aloud"
                        >
                            <Volume2 size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Grounding Chips */}
            {message.groundingLinks && message.groundingLinks.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 ml-1 animate-in fade-in duration-700">
                    {message.groundingLinks.map((link, i) => (
                        <a 
                            key={i} 
                            href={link.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] font-medium bg-[#1e1f20]/80 hover:bg-blue-900/30 border border-gray-700 hover:border-blue-500/50 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all text-gray-400 hover:text-blue-300 truncate max-w-[200px]"
                        >
                            <Map size={10} />
                            {link.title}
                        </a>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;