import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { ChatSession } from '../types/chat';
import { 
  fadeInLeft, 
  staggerContainer, 
  staggerItem, 
  hoverScale, 
  hoverLift,
  scaleIn 
} from '../utils/animations';

interface SidebarProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  onSessionSelect: (session: ChatSession) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSession,
  onSessionSelect,
  onNewSession,
  onDeleteSession
}) => {
  return (
    <motion.div 
      className="w-72 bg-white border-r border-amber-200 flex flex-col shadow-sm"
      initial="hidden"
      animate="visible"
      variants={fadeInLeft}
    >
      <motion.div 
        className="p-4 border-b border-amber-200 bg-gradient-to-r from-red-50 to-amber-50"
        variants={scaleIn}
      >
        <motion.button
          onClick={onNewSession}
          className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-md"
          variants={hoverScale}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="w-4 h-4" />
          </motion.div>
          Nueva Consulta
        </motion.button>
      </motion.div>
      
      <motion.div 
        className="flex-1 overflow-y-auto p-4"
        variants={staggerContainer}
      >
        <motion.h3 
          className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide"
          variants={staggerItem}
        >
          Consultas Recientes
        </motion.h3>
        <motion.div 
          className="space-y-2"
          variants={staggerContainer}
        >
          <AnimatePresence>
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer group ${
                  currentSession?.id === session.id
                    ? 'bg-red-100 text-red-800 shadow-sm'
                    : 'hover:bg-amber-50 hover:shadow-sm'
                }`}
                onClick={() => onSessionSelect(session)}
                variants={staggerItem}
                whileHover="hover"
                whileTap="tap"
                custom={index}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium">{session.title}</div>
                  <div className="text-xs text-gray-500">
                    {session.phase === 'search' ? 'Búsqueda de Ayudas' : 'Consulta de Documentos'}
                  </div>
                </div>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  whileHover={{ scale: 1.1, rotate: 12 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};