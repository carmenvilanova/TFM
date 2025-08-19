import React, { useRef, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { PhaseSelector } from './PhaseSelector';
import { GrantCard } from './GrantCard';
import { FileMetadata } from './FileMetadata';
import { ChatSession, GrantCall, UploadedFile } from '../types/chat';

interface ChatContainerProps {
  session: ChatSession;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onPhaseChange: (phase: 'search' | 'document') => void;
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

export const ChatContainer: React.FC<ChatContainerProps> = ({
  session,
  isLoading,
  onSendMessage,
  onPhaseChange,
  onGrantSelect,
  onFileUpload,
  onFileDownload,
  onFileRemove,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  const getPlaceholder = () => {
    return session.phase === 'search' 
      ? 'Pregúntame sobre ayudas... (ej: "Busca ayudas para vivienda en Madrid")'
      : 'Haz preguntas sobre el documento de la ayuda seleccionada...';
  };

  const shouldShowGrantCards = session.phase === 'search' && 
    session.messages.some(msg => msg.type === 'user' && 
      (msg.content.toLowerCase().includes('vivienda') || msg.content.toLowerCase().includes('housing')));

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="border-b border-amber-200 p-5 bg-gradient-to-r from-red-50 to-amber-50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {session.title}
          </h2>
          <PhaseSelector 
            currentPhase={session.phase} 
            onPhaseChange={onPhaseChange}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {session.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {shouldShowGrantCards && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-600" />
              Ayudas Disponibles
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
        
        {session.uploadedFiles && session.uploadedFiles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-600" />
              Archivos Subidos ({session.uploadedFiles.length})
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
      
      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        placeholder={getPlaceholder()}
        onFileUpload={onFileUpload}
        allowFileUpload={session.phase === 'document'}
      />
    </div>
  );
};