
import React, { useRef, useEffect } from 'react';
import { type ChatMessage } from '../types';

interface ChatWindowProps {
  messages: ChatMessage[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  return (
    <div ref={scrollRef} className="flex-grow p-6 space-y-6 overflow-y-auto bg-slate-50">
      {messages.map((msg, index) => (
        <div key={index} className={`flex items-end gap-3 ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
          {msg.speaker === 'ai' && (
            <div className="w-10 h-10 rounded-full bg-[#5D3EBE] flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
              AI
            </div>
          )}
          <div
            className={`max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl shadow ${
              msg.speaker === 'ai'
                ? 'bg-[#5D3EBE] text-white rounded-bl-none'
                : 'bg-white text-slate-800 rounded-br-none border border-slate-200'
            }`}
          >
            <p className="text-sm md:text-base whitespace-pre-wrap">{msg.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;