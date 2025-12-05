import React, { useRef, useState } from 'react';
import { Send, Mic, Paperclip, X } from 'lucide-react';
import { Attachment } from '../types';

interface InputAreaProps {
  onSend: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
  onTranscriptRequest: () => Promise<string>; // Simple one-shot transcription
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading, onTranscriptRequest }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    onSend(text, attachments);
    setText('');
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newAttachments: Attachment[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = (evt) => {
            if (evt.target?.result) {
              const base64 = (evt.target.result as string).split(',')[1];
              newAttachments.push({
                mimeType: file.type,
                data: base64,
                name: file.name
              });
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
      setAttachments(prev => [...prev, ...newAttachments]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleMic = async () => {
    if (isListening) return;
    setIsListening(true);
    try {
        const transcript = await onTranscriptRequest();
        setText(prev => prev + (prev ? ' ' : '') + transcript);
    } catch (e) {
        console.error("Mic error", e);
    } finally {
        setIsListening(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2">
      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 bg-[#1e1f20]/90 backdrop-blur-sm rounded-lg border border-gray-700">
          {attachments.map((att, idx) => (
            <div key={idx} className="relative group">
              <div className="w-16 h-16 bg-gray-800 rounded overflow-hidden flex items-center justify-center text-xs text-gray-500 border border-gray-600">
                {att.mimeType.startsWith('image') ? (
                  <img src={`data:${att.mimeType};base64,${att.data}`} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <span>File</span>
                )}
              </div>
              <button 
                onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative flex items-end bg-[#1e1f20]/90 backdrop-blur-md rounded-2xl border border-white/10 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-lg">
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple
        />
        
        <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-400 hover:text-white transition-colors"
            title="Attach file"
        >
          <Paperclip size={20} />
        </button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask ahmedkoka_1_ai..."
          className="w-full bg-transparent text-gray-100 placeholder-gray-500 p-3 max-h-48 min-h-[50px] resize-none focus:outline-none scrollbar-hide"
          rows={1}
          style={{ height: 'auto', minHeight: '50px' }}
        />

        <div className="flex items-center pr-2 pb-2">
            <button 
                onClick={toggleMic}
                className={`p-2 rounded-full transition-colors mr-1 ${isListening ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white'}`}
            >
                <Mic size={20} className={isListening ? 'animate-pulse' : ''}/>
            </button>
            <button
                onClick={handleSend}
                disabled={isLoading || (!text.trim() && attachments.length === 0)}
                className={`p-2 rounded-full transition-colors ${
                isLoading || (!text.trim() && attachments.length === 0)
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Send size={18} />
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default InputArea;