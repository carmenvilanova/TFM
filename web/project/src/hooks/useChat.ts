import { useState, useCallback } from 'react';
import { Message, ChatSession, GrantCall, UploadedFile } from '../types/chat';

export const useChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Nueva Consulta',
      messages: [{
        id: Date.now().toString(),
        type: 'system',
        content: '¡Bienvenido al Asistente de Subvenciones! Puedo ayudarte a buscar ayudas públicas o responder preguntas sobre documentos específicos de subvenciones. Elige tu modo arriba y comienza a hacer preguntas.',
        timestamp: new Date(),
      }],
      phase: 'search',
      createdAt: new Date(),
      uploadedFiles: [],
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    return newSession;
  }, []);

  const selectSession = useCallback((session: ChatSession) => {
    setCurrentSession(session);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
  }, [currentSession]);

  const sendMessage = useCallback(async (content: string) => {
    if (!currentSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
      phase: currentSession.phase,
    };

    // Update current session with user message
    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      title: currentSession.title === 'Nueva Consulta' ? content.slice(0, 30) + '...' : currentSession.title,
    };

    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    setIsLoading(true);

    try {
      // Simulate API call to your chatbot backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: currentSession.phase === 'search' 
          ? `He encontrado varias ayudas relacionadas con "${content}". Aquí tienes algunas opciones relevantes:\n\n• Programa de Ayudas para Vivienda Social - Hasta 500.000€\n• Iniciativa de Vivienda Comunitaria - Hasta 250.000€\n• Programa de Vivienda Asequible - Hasta 1.000.000€\n\n¿Te gustaría que te proporcione más detalles sobre alguna de estas ayudas?`
          : `Basándome en el documento de la ayuda, aquí están los detalles clave sobre "${content}":\n\n• Los requisitos de elegibilidad incluyen...\n• Las fechas límite de solicitud son...\n• La documentación requerida incluye...\n\n¿Te gustaría que aclare algún aspecto específico?`,
        timestamp: new Date(),
        phase: currentSession.phase,
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage],
      };

      setCurrentSession(finalSession);
      setSessions(prev => prev.map(s => s.id === finalSession.id ? finalSession : s));
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentSession]);

  const changePhase = useCallback((phase: 'search' | 'document') => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      phase,
    };

    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
  }, [currentSession]);

  const selectGrant = useCallback((grant: GrantCall) => {
    if (!currentSession) return;

    const systemMessage: Message = {
      id: Date.now().toString(),
      type: 'system',
      content: `Has seleccionado "${grant.title}" para consultas detalladas. Ahora tengo acceso al documento completo de la ayuda. Puedes hacerme preguntas específicas sobre elegibilidad, requisitos, plazos o cualquier otro detalle.`,
      timestamp: new Date(),
    };

    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, systemMessage],
      phase: 'document' as const,
    };

    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
  }, [currentSession]);

  const handleFileUpload = useCallback((file: File) => {
    if (!currentSession) return;

    const uploadedFile: UploadedFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      uploadedAt: new Date(),
      file: file,
    };

    const systemMessage: Message = {
      id: Date.now().toString(),
      type: 'system',
      content: `Archivo "${file.name}" (${(file.size / 1024).toFixed(1)} KB) subido correctamente. Metadatos disponibles abajo. Ahora puedes hacer preguntas sobre el contenido de este documento.`,
      timestamp: new Date(),
    };

    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, systemMessage],
      uploadedFiles: [...(currentSession.uploadedFiles || []), uploadedFile],
    };

    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));

    console.log('Archivo subido con metadatos:', uploadedFile);
  }, [currentSession]);

  const handleFileDownload = useCallback((uploadedFile: UploadedFile) => {
    const url = URL.createObjectURL(uploadedFile.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = uploadedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleFileRemove = useCallback((fileId: string) => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      uploadedFiles: (currentSession.uploadedFiles || []).filter(f => f.id !== fileId),
    };

    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
  }, [currentSession]);

  return {
    sessions,
    currentSession,
    isLoading,
    createNewSession,
    selectSession,
    deleteSession,
    sendMessage,
    changePhase,
    selectGrant,
    handleFileUpload,
    handleFileDownload,
    handleFileRemove,
  };
};