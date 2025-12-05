
import React, { useState, useEffect, useRef } from 'react';
import TopNavigation from './components/TopNavigation';
import LoginScreen from './components/LoginScreen';
import InputArea from './components/InputArea';
import MessageBubble from './components/MessageBubble';
import LiveSession from './components/LiveSession';
import Sidebar from './components/Sidebar';
import RainEffect from './components/RainEffect'; // Import Rain
import { generateResponse, generateImage, generateSpeech, generateNanoImage } from './services/geminiService';
import { FeatureMode, Message, Attachment, ChatSession } from './types';
import { Sparkles, Compass, Lightbulb, Code, Mic, Zap, Image as ImageIcon, MessageSquare, BrainCircuit, Search, MapPin, Edit, Mic2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | undefined>();

  const [mode, setMode] = useState<FeatureMode>(FeatureMode.CHAT);
  
  // Session & Message State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState<GeolocationCoordinates | undefined>();
  const [wakeWordListening, setWakeWordListening] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Mode Transition Animation State
  const [showModeSplash, setShowModeSplash] = useState<{icon: any, label: string} | null>(null);

  // --- Persistence Keys ---
  const SESSIONS_KEY = 'ahmedkoka_sessions_v2';
  const AUTH_KEY = 'ahmedkoka_auth_session';
  const USER_KEY = 'ahmedkoka_auth_user';

  // Check Login Session
  useEffect(() => {
    const session = localStorage.getItem(AUTH_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (session && storedUser) {
        setIsAuthenticated(true);
        setUsername(storedUser);
    }
  }, []);

  const handleLogin = (user: string) => {
    setIsAuthenticated(true);
    setUsername(user);
    localStorage.setItem(AUTH_KEY, 'active');
    localStorage.setItem(USER_KEY, user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    setUsername(undefined);
    setMessages([]);
    setCurrentSessionId(null);
  };

  // Load Sessions on Mount
  useEffect(() => {
    const saved = localStorage.getItem(SESSIONS_KEY);
    if (saved) {
        try {
            const parsedSessions = JSON.parse(saved);
            setSessions(parsedSessions);
            if (parsedSessions.length > 0) {
               const lastSession = parsedSessions[parsedSessions.length - 1];
               setCurrentSessionId(lastSession.id);
               setMessages(lastSession.messages);
            }
        } catch (e) {
            console.error("Failed to load sessions", e);
        }
    }
  }, []);

  // Save Sessions whenever they change
  useEffect(() => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // Update Current Session in Sessions List when Messages Change
  useEffect(() => {
    if (!currentSessionId) return;
    
    setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
            let title = s.title;
            if (title === 'New Chat' && messages.length > 0 && messages[0].text) {
                title = messages[0].text.substring(0, 30) + (messages[0].text.length > 30 ? '...' : '');
            }
            return { ...s, messages: messages, title };
        }
        return s;
    }));
  }, [messages, currentSessionId]);

  const createNewChat = () => {
      const newId = Date.now().toString();
      const newSession: ChatSession = {
          id: newId,
          title: 'New Chat',
          date: Date.now(),
          messages: []
      };
      setSessions(prev => [...prev, newSession]);
      setCurrentSessionId(newId);
      setMessages([]);
      setMode(FeatureMode.CHAT);
  };

  const selectSession = (id: string) => {
      const session = sessions.find(s => s.id === id);
      if (session) {
          setCurrentSessionId(id);
          setMessages(session.messages);
      }
  };

  const deleteAllHistory = () => {
    setSessions([]);
    setMessages([]);
    setCurrentSessionId(null);
    localStorage.removeItem(SESSIONS_KEY);
    createNewChat();
  };

  // --- Mode Switching with Visual Effect ---
  const handleModeChange = (newMode: FeatureMode) => {
      setMode(newMode);
      
      let Icon = MessageSquare;
      if (newMode === FeatureMode.IMAGE_GEN) Icon = ImageIcon;
      else if (newMode === FeatureMode.NANO_BANANA_GEN) Icon = Zap;
      else if (newMode === FeatureMode.THINKING) Icon = BrainCircuit;
      else if (newMode === FeatureMode.SEARCH) Icon = Search;
      else if (newMode === FeatureMode.MAPS) Icon = MapPin;
      else if (newMode === FeatureMode.IMAGE_EDIT) Icon = Edit;
      else if (newMode === FeatureMode.MUSIC_CRITIQUE) Icon = Mic2;

      setShowModeSplash({ icon: Icon, label: newMode });
      setTimeout(() => setShowModeSplash(null), 1500);
  };

  // --- Wake Word Listener ---
  useEffect(() => {
    if (!isAuthenticated) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; 

    recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult[0].transcript.toLowerCase().replace(/\s/g, '');
        if (transcript.includes('ahmedkoka')) {
            setMode(FeatureMode.LIVE);
        }
    };
    recognition.onend = () => { if (isAuthenticated && mode !== FeatureMode.LIVE) try { recognition.start(); } catch(e) {} };
    try { recognition.start(); setWakeWordListening(true); } catch (e) {}

    return () => { recognition.stop(); setWakeWordListening(false); };
  }, [isAuthenticated, mode]);


  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation(pos.coords),
        (err) => console.log("Location denied", err)
      );
    }
  }, []);

  const handleTTS = async (text: string) => {
      const audioBase64 = await generateSpeech(text);
      if (audioBase64) {
          const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
          audio.play();
      }
  };

  const handleMicTranscript = async (): Promise<string> => {
      return new Promise(async (resolve, reject) => {
         try {
             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
             const mediaRecorder = new MediaRecorder(stream);
             const chunks: BlobPart[] = [];
             mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
             mediaRecorder.onstop = async () => {
                 const blob = new Blob(chunks, { type: 'audio/webm' });
                 const reader = new FileReader();
                 reader.readAsDataURL(blob);
                 reader.onloadend = async () => {
                     const base64 = (reader.result as string).split(',')[1];
                     const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
                     const result = await ai.models.generateContent({
                         model: 'gemini-2.5-flash',
                         contents: { parts: [{ inlineData: { mimeType: 'audio/webm', data: base64 } }, { text: "Transcribe exactly." }] }
                     });
                     resolve(result.text || "");
                     stream.getTracks().forEach(t => t.stop());
                 };
             };
             mediaRecorder.start();
             setTimeout(() => mediaRecorder.stop(), 3000); 
         } catch (e) { reject(e); }
      });
  };

  const handleSend = async (text: string, attachments: Attachment[]) => {
    if (!currentSessionId) createNewChat();

    const userMsg: Message = { role: 'user', text, image: attachments.find(a=>a.mimeType.startsWith('image'))?.data ? `data:${attachments.find(a=>a.mimeType.startsWith('image'))!.mimeType};base64,${attachments.find(a=>a.mimeType.startsWith('image'))!.data}` : undefined };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let responseMsg: Message;

      if (mode === FeatureMode.IMAGE_GEN) {
         const arMatch = text.match(/(\d+:\d+)/);
         responseMsg = await generateImage(text, arMatch ? arMatch[0] : "1:1");
      }
      else if (mode === FeatureMode.NANO_BANANA_GEN) {
          responseMsg = await generateNanoImage(text);
      }
      // Music Critique handled by standard generateResponse but with specific system prompts in service
      else {
        responseMsg = await generateResponse(mode, messages, text, attachments, location);
      }
      
      if (mode === FeatureMode.THINKING) responseMsg.isThinking = true;

      setMessages(prev => [...prev, responseMsg]);

    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'model', text: `System Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { icon: Compass, text: "Planning a trip to Japan" },
    { icon: Code, text: "Write a React hook for fetching data" },
    { icon: Lightbulb, text: "Explain quantum computing simply" },
    { icon: Sparkles, text: "Generate a cyberpunk city image" },
  ];

  if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-transparent text-white font-sans relative">
      
      {/* Global Rain Effect */}
      <RainEffect />

      {/* Subtle Breathing Glow Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-blue-500/5 animate-[pulse_5s_ease-in-out_infinite]"></div>

      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={selectSession}
        onNewChat={createNewChat}
        onDeleteAll={deleteAllHistory}
      />

      {/* Mode Splash Animation */}
      {showModeSplash && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className="p-6 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl mb-4">
                     <showModeSplash.icon size={64} className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
                <div className="text-xl font-bold text-white bg-black/40 px-4 py-1 rounded-full border border-white/5 backdrop-blur-md">
                    {showModeSplash.label}
                </div>
            </div>
        </div>
      )}

      <TopNavigation 
        currentMode={mode} 
        setMode={handleModeChange} 
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onLogout={handleLogout}
        username={username}
      />

      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden z-10">
        
        {mode === FeatureMode.LIVE ? (
          <LiveSession onClose={() => setMode(FeatureMode.CHAT)} />
        ) : (
          <>
             <div className="absolute top-2 right-2 z-30 pointer-events-none">
                 {wakeWordListening && (
                     <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-gray-400 border border-white/5">
                         <Mic size={10} className="animate-pulse text-blue-400" />
                         Listening for "AhmedKoka"...
                     </div>
                 )}
             </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="relative group cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-300">
                         <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                         <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 mb-8 flex items-center justify-center shadow-2xl relative z-10 border border-white/10">
                            <Sparkles size={40} className="text-white drop-shadow-md" />
                        </div>
                    </div>
                  
                  <h2 className="text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-blue-100 to-gray-500 mb-3 drop-shadow-sm">
                    {username || 'Friend'}
                  </h2>
                  <p className="text-lg text-gray-400 max-w-md mb-12 font-light">
                    ahmedkoka_1_ai is ready to create.
                  </p>
                  
                  {mode === FeatureMode.MUSIC_CRITIQUE ? (
                       <div className="p-6 bg-pink-500/10 border border-pink-500/30 rounded-2xl max-w-md animate-in slide-in-from-bottom-5">
                          <Mic2 size={32} className="text-pink-400 mx-auto mb-3" />
                          <h3 className="text-lg font-bold text-white mb-2">Music Evaluation</h3>
                          <p className="text-sm text-gray-300">Upload an MP3 of your singing. I will evaluate your voice, pitch, and tone!</p>
                       </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full px-4">
                        {suggestions.map((s, i) => (
                            <button 
                                key={i}
                                onClick={() => handleSend(s.text, [])}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-[#1e1f20]/40 hover:bg-[#2a2b2d]/60 backdrop-blur-lg transition-all duration-300 text-left border border-white/5 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 active:scale-95 group"
                            >
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 group-hover:from-blue-900/40 group-hover:to-purple-900/40 transition-colors border border-white/5">
                                    <s.icon size={20} className="text-blue-400 group-hover:text-blue-300" />
                                </div>
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{s.text}</span>
                            </button>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <MessageBubble key={idx} message={msg} onPlayTTS={handleTTS} />
                ))
              )}
              {isLoading && (
                 <div className="flex justify-start w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2 text-gray-400 bg-[#1e1f20]/40 backdrop-blur-xl border border-white/5 px-5 py-3 rounded-3xl rounded-tl-none shadow-lg">
                         <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                         <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                         <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
                    </div>
                 </div>
              )}
            </div>

            <div className="relative z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent pt-10 pb-2">
                <InputArea onSend={handleSend} isLoading={isLoading} onTranscriptRequest={handleMicTranscript} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
