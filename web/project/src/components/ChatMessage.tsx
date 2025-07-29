import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Info } from 'lucide-react';
import { Message } from '../types/chat';
import { fadeInLeft, fadeInRight, scaleIn, hoverScale } from '../utils/animations';

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
    <motion.div 
      className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      initial="hidden"
      animate="visible"
      variants={isUser ? fadeInRight : fadeInLeft}
      layout
    >
      {!isUser && (
        <motion.div 
          className={`w-8 h-8 rounded-full flex items-center justify-center ${getIconStyle()}`}
          variants={scaleIn}
          whileHover="hover"
        >
          {getIcon()}
        </motion.div>
      )}
      <motion.div 
        className={`max-w-[70%] rounded-lg px-4 py-2 ${getMessageStyle()}`}
        variants={scaleIn}
        whileHover={{ 
          y: -2,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }}
        transition={{ duration: 0.2 }}
        layout
      >
        <motion.div 
          className="text-sm font-medium mb-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {isUser ? 'Tú' : isSystem ? 'Sistema' : 'Asistente de Subvenciones'}
        </motion.div>
        <motion.div 
          className="whitespace-pre-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {message.content}
        </motion.div>
        <motion.div 
          className="text-xs opacity-70 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {message.timestamp.toLocaleTimeString()}
        </motion.div>
      </motion.div>
      {isUser && (
        <motion.div 
          className={`w-8 h-8 rounded-full flex items-center justify-center ${getIconStyle()}`}
          variants={scaleIn}
          whileHover="hover"
        >
          {getIcon()}
        </motion.div>
      )}
    </motion.div>
  );
};