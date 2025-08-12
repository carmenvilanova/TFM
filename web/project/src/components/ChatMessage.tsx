import React from 'react';
import { User, Bot, Info } from 'lucide-react';
import { Message } from '../types/chat';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  const getIcon = () => {
    if (isUser) return <User className="w-5 h-5" />;
    if (isSystem) return <Info className="w-5 h-5" />;
    return <Bot className="w-5 h-5" />;
  };

  const getMessageStyle = () => {
    if (isUser) return 'bg-red-600 text-white ml-12';
    if (isSystem) return 'bg-amber-50 text-amber-800 border border-amber-200';
    return 'bg-gray-50 text-gray-800 mr-12 border border-gray-200';
  };

  const getIconStyle = () => {
    if (isUser) return 'bg-red-600 text-white';
    if (isSystem) return 'bg-amber-600 text-white';
    return 'bg-gray-700 text-white';
  };

  return (
    <div className={`flex gap-3 mb-4 animate-fade-in ${isUser ? 'justify-end animate-slide-in-right' : 'justify-start animate-slide-in-left'}`}>
      {!isUser && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all-smooth hover:scale-110 ${getIconStyle()}`}>
          {getIcon()}
        </div>
      )}
      <div className={`max-w-[70%] rounded-lg px-4 py-2 transition-all-smooth hover:shadow-md ${getMessageStyle()}`}>
        <div className="text-sm font-medium mb-1">
          {isUser ? 'Tú' : isSystem ? 'Sistema' : 'Asistente de Subvenciones'}
        </div>
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div className="text-xs opacity-70 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
      {isUser && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all-smooth hover:scale-110 ${getIconStyle()}`}>
          {getIcon()}
        </div>
      )}
    </div>
  );
};