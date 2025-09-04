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

const mockGrants: GrantCall[] = [
  { id: '1', title: 'Programa de Ayudas para Vivienda Social', description: '...', deadline: '15 de marzo, 2024', amount: 'Hasta 500.000€', category: 'Vivienda' },
  { id: '2', title: 'Iniciativa de Vivienda Comunitaria', description: '...', deadline: '30 de abril, 2024', amount: 'Hasta 250.000€', category: 'Vivienda' },
  { id: '3', title: 'Fondo de Innovación en Vivienda Sostenible', description: '...', deadline: '20 de mayo, 2024', amount: 'Hasta 1.000.000€', category: 'Vivienda' },
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

  // Inicia el tab con la fase REAL de la sesión
  const [activePanel, setActivePanel] = useState<'search' | 'document'>(session.phase);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.searchMessages, session.documentMessages, activePanel]);

  // PATCH: sincroniza el tab cuando cambie session.phase (no depende de activePanel)
  useEffect(() => {
    setActivePanel(session.phase);
  }, [session.phase]);

  // PATCH: red de seguridad SOLO cuando pasamos de 0 -> >0 archivos
  const prevUploadCount = useRef<number>(session.uploadedFiles?.length ?? 0);
  useEffect(() => {
    const count = session.uploadedFiles?.length ?? 0;
    if (prevUploadCount.current === 0 && count > 0) {
      setActivePanel('document');
    }
    prevUploadCount.current = count;
  }, [session.uploadedFiles?.length]); // ← ya no depende de activePanel

  const getPlaceholder = () =>
    activePanel === 'search' ? t('chat.searchPlaceholder') : t('chat.documentPlaceholder');

  const getCurrentMessages = (): Message[] =>
    activePanel === 'search' ? session.searchMessages : session.documentMessages;

  const shouldShowGrantCards =
    activePanel === 'search' &&
    session.searchMessages.some(
      msg =>
        msg.type === 'user' &&
        (msg.content.toLowerCase().includes('vivienda') ||
          msg.content.toLowerCase().includes('housing'))
    );

  const handleSendMessage = (message: string) => {
    onSendMessage(message, activePanel);
  };

  const files = session.uploadedFiles ?? [];
  const hasUploads = files.length > 0;

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header + tabs */}
      <div className="border-b border-amber-200 p-5 bg-gradient-to-r from-red-50 to-amber-50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">{session.title}</h2>

          <div className="flex gap-1 p-1 bg-amber-100 rounded-lg shadow-inner animate-fade-in">
            <button
              onClick={() => setActivePanel('search')}
              className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all-smooth hover:scale-105 ${
                activePanel === 'search'
                  ? 'bg-white text-red-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <Search className="w-4 h-4" />
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
              <FileText className="w-4 h-4" />
              {t('chat.documentPhase')}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Mensajes del panel activo */}
        {getCurrentMessages().map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Grant Cards (solo en búsqueda) */}
        {shouldShowGrantCards && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-600" />
              {t('grants.available', { defaultValue: 'Ayudas Disponibles' })}
            </h3>
            <div className="grid gap-4">
              {mockGrants.map(grant => (
                <GrantCard key={grant.id} grant={grant} onSelect={onGrantSelect} />
              ))}
            </div>
          </div>
        )}

        {/* Archivos subidos: visible en Documentos apenas haya archivos */}
        {activePanel === 'document' && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-600" />
              {t('files.uploaded', { defaultValue: 'Archivos Subidos' })}
              {hasUploads ? ` (${files.length})` : ''}
            </h3>

            {hasUploads ? (
              <div className="grid gap-4">
                {files.map(file => (
                  <FileMetadata
                    key={file.id}
                    file={file}
                    onDownload={onFileDownload}
                    onRemove={onFileRemove}
                  />
                ))}
              </div>
            ) : (
              <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
                {t('files.emptyState', { defaultValue: 'Sube un documento para procesarlo.' })}
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        placeholder={getPlaceholder()}
        // cambio inmediato a Documentos al subir (UX)
        onFileUpload={(files) => {
          onFileUpload(files);
          setActivePanel('document');
        }}
        allowFileUpload={activePanel === 'document'}
      />
    </div>
  );
};
