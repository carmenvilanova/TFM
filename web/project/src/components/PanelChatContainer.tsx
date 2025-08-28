import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Search, FileText } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { GrantCard } from './GrantCard';
import { FileMetadata } from './FileMetadata';
import { ChatSession, GrantCall, UploadedFile, Message } from '../types/chat';

interface PanelChatContainerProps {
  session: ChatSession;
  isLoading: boolean;
  onSendMessage: (message: string, panel: 'search' | 'document') => void;
  onGrantSelect: (grant: GrantCall) => void;
  onFileUpload: (files: File[]) => void;
  onFileDownload: (file: UploadedFile) => void;
  onFileRemove: (fileId: string) => void;
}

// Mock grant data for demonstration
const mockGrants: GrantCall[] = [
  {
    id: '1',
    title: 'Programa de Ayudas para Vivienda Social',
    description: 'Financiación para proyectos de desarrollo de vivienda asequible en comunidades desfavorecidas. Esta ayuda apoya nueva construcción y rehabilitación de viviendas existentes.',
    deadline: '15 de marzo, 2024',
    amount: 'Hasta 500.000€',
    category: 'Vivienda',
  },
  {
    id: '2',
    title: 'Iniciativa de Vivienda Comunitaria',
    description: 'Apoyo para iniciativas de vivienda comunitaria incluyendo programas para compradores primerizos y asistencia de alquiler.',
    deadline: '30 de abril, 2024',
    amount: 'Hasta 250.000€',
    category: 'Vivienda',
  },
  {
    id: '3',
    title: 'Fondo de Innovación en Vivienda Sostenible',
    description: 'Subvenciones para soluciones innovadoras de vivienda sostenible y tecnologías de construcción verde.',
    deadline: '20 de mayo, 2024',
    amount: 'Hasta 1.000.000€',
    category: 'Vivienda',
  },
];

export const PanelChatContainer: React.FC<PanelChatContainerProps> = ({
  session,
  isLoading,
  onSendMessage,
  onGrantSelect,
  onFileUpload,
  onFileDownload,
  onFileRemove,
}) => {
  const { t } = useTranslation();
  const [activePanel, setActivePanel] = useState<'search' | 'document'>('search');
  const [hasSubmittedWithFiles, setHasSubmittedWithFiles] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.searchMessages, session.documentMessages, activePanel]);

  const getPlaceholder = () => {
    return activePanel === 'search' 
      ? t('chat.searchPlaceholder')
      : t('chat.documentPlaceholder');
  };

  const getCurrentMessages = (): Message[] => {
    return activePanel === 'search' ? session.searchMessages : session.documentMessages;
  };

  const shouldShowGrantCards = activePanel === 'search' && 
    session.searchMessages.some(msg => msg.type === 'user' && 
      (msg.content.toLowerCase().includes('vivienda') || msg.content.toLowerCase().includes('housing')));

  const handleSendMessage = (message: string) => {
    onSendMessage(message, activePanel);
    // Mark that we've submitted with files if there are files in the session
    if (activePanel === 'document' && session.uploadedFiles && session.uploadedFiles.length > 0) {
      setHasSubmittedWithFiles(true);
    }
  };

  // Reset submission state when switching panels
  useEffect(() => {
    setHasSubmittedWithFiles(false);
  }, [activePanel]);

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Panel Header with Tabs */}
      <div className="border-b border-amber-200 p-5 bg-gradient-to-r from-red-50 to-amber-50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {session.title}
          </h2>
          
          {/* Panel Tabs */}
          <div className="flex gap-1 p-1 bg-amber-100 rounded-lg shadow-inner animate-fade-in">
            <button
              onClick={() => setActivePanel('search')}
              className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all-smooth hover:scale-105 ${
                activePanel === 'search'
                  ? 'bg-white text-red-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <Search className="w-4 h-4 transition-transform-smooth group-hover:scale-110" />
              {t('chat.searchPhase')}
            </button>
            <button
              onClick={() => setActivePanel('document')}
              className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all-smooth hover:scale-105 ${
                activePanel === 'document'
                  ? 'bg-white text-red-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <FileText className="w-4 h-4 transition-transform-smooth group-hover:scale-110" />
              {t('chat.documentPhase')}
            </button>
          </div>
        </div>
      </div>
      
      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Messages for current panel */}
        {getCurrentMessages().map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {/* Grant Cards (only in search panel) */}
        {shouldShowGrantCards && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-600" />
              {t('grants.available', { defaultValue: 'Ayudas Disponibles' })}
            </h3>
            <div className="grid gap-4">
              {mockGrants.map((grant) => (
                <GrantCard 
                  key={grant.id} 
                  grant={grant} 
                  onSelect={onGrantSelect}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Uploaded Files (only in document panel and after submission) */}
        {activePanel === 'document' && session.uploadedFiles && session.uploadedFiles.length > 0 && hasSubmittedWithFiles && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-600" />
              {t('files.uploaded', { defaultValue: 'Archivos Subidos' })} ({session.uploadedFiles.length})
            </h3>
            <div className="grid gap-4">
              {session.uploadedFiles.map((file) => (
                <FileMetadata
                  key={file.id}
                  file={file}
                  onDownload={onFileDownload}
                  onRemove={onFileRemove}
                />
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        placeholder={getPlaceholder()}
        onFileUpload={onFileUpload}
        allowFileUpload={activePanel === 'document'}
      />
    </div>
  );
};
