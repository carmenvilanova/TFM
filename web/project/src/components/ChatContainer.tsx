import React, { useRef, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { PhaseSelector } from './PhaseSelector';
import { GrantCard } from './GrantCard';
import { ChatSession, GrantCall } from '../types/chat';

interface ChatContainerProps {
  session: ChatSession;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onPhaseChange: (phase: 'search' | 'document') => void;
  onGrantSelect: (grant: GrantCall) => void;
  onFileUpload?: (file: File) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  session,
  isLoading,
  onSendMessage,
  onPhaseChange,
  onGrantSelect,
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

  // Busca el último mensaje del asistente con grants reales
  const lastAssistantMsgWithGrants = [...session.messages]
    .reverse()
    .find(msg => msg.type === 'assistant' && Array.isArray((msg as any).grants) && (msg as any).grants.length > 0);

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

        {lastAssistantMsgWithGrants && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-600" />
              Ayudas Disponibles
            </h3>
            <div className="grid gap-4">
              {(lastAssistantMsgWithGrants as any).grants.map((grant: GrantCall) => (
                <GrantCard 
                  key={grant.id} 
                  grant={grant} 
                  onSelect={onGrantSelect}
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
      />
    </div>
  );
};