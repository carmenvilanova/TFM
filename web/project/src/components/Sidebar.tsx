import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { ChatSession } from '../types/chat';

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
  const { t } = useTranslation();
  return (
    <div className="w-72 bg-white border-r border-amber-200 flex flex-col shadow-sm">
      <div className="p-4 border-b border-amber-200 bg-gradient-to-r from-red-50 to-amber-50">
        <button
          onClick={onNewSession}
          className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all-smooth font-medium shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 transition-transform-smooth group-hover:rotate-90" />
          {t('sidebar.newQuery')}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">{t('sidebar.recentQueries')}</h3>
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer group transition-all-smooth animate-fade-in hover-lift ${
                currentSession?.id === session.id
                  ? 'bg-red-100 text-red-800 shadow-sm'
                  : 'hover:bg-amber-50 hover:shadow-sm'
              }`}
              onClick={() => onSessionSelect(session)}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0 transition-transform-smooth group-hover:scale-110" />
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium">{session.title}</div>
                <div className="text-xs text-gray-500 flex gap-2">
                  <span className="flex items-center gap-1">
                    {/* 📚 {(session.searchMessages || session.messages.filter(m => !m.phase || m.phase === 'search')).length} */}
                  </span>
                  <span className="flex items-center gap-1">
                    {/* 📄 {(session.documentMessages || session.messages.filter(m => m.phase === 'document')).length} */}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-all-smooth hover:scale-110 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4 transition-transform-smooth hover:rotate-12" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};