import React, { useState } from 'react';
import { Send, Mic, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading = false, 
  placeholder = "Pregunta sobre ayudas..." 
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 p-4 bg-white border-t border-amber-200">
      <div className="flex-1 relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full px-4 py-3 pr-12 bg-amber-50 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none min-h-[52px] max-h-32 text-gray-800"
          rows={1}
        />
        <button
          type="button"
          className="absolute right-2 top-2 p-2 text-amber-400 hover:text-amber-600 transition-colors"
          disabled={isLoading}
        >
          <Paperclip className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="p-3 text-amber-400 hover:text-amber-600 transition-colors"
          disabled={isLoading}
        >
          <Mic className="w-5 h-5" />
        </button>
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
        >
          <Send className="w-4 h-4" />
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </form>
  );
};