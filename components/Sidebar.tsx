
import React from 'react';
import { Plus, Trash2, X, MessageSquare, Calendar } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteAll: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, onClose, sessions, currentSessionId, onSelectSession, onNewChat, onDeleteAll 
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 bg-[#1e1f20]/95 backdrop-blur-xl border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-wide">History</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl flex items-center justify-center gap-2 font-medium shadow-lg transition-all active:scale-95"
          >
            <Plus size={20} />
            New Page
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center text-gray-500 mt-10 text-sm">
              No history yet.
            </div>
          ) : (
            sessions.slice().reverse().map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  onSelectSession(session.id);
                  onClose();
                }}
                className={`w-full p-3 rounded-xl flex items-start gap-3 text-left transition-colors border ${
                  currentSessionId === session.id
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                    : 'bg-white/5 border-transparent hover:bg-white/10 text-gray-300'
                }`}
              >
                <MessageSquare size={16} className="mt-1 flex-shrink-0 opacity-70" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {session.title || 'New Chat'}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(session.date).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => {
               if (window.confirm("Are you sure you want to delete ALL history? This cannot be undone.")) {
                   onDeleteAll();
                   onClose();
               }
            }}
            className="w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors"
          >
            <Trash2 size={16} />
            Delete All History
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
