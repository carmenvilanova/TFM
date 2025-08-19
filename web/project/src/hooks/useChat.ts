import { useState, useCallback } from 'react';
import { Message, ChatSession, UploadedFile } from '../types/chat';

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
        content:
          '¡Bienvenido al Asistente de Subvenciones! Puedo ayudarte a buscar ayudas públicas o responder preguntas sobre documentos específicos de subvenciones. Elige tu modo arriba y comienza a hacer preguntas.',
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

  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
    },
    [currentSession]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentSession) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content,
        timestamp: new Date(),
        phase: currentSession.phase,
      };

      const updatedSession: ChatSession = {
        ...currentSession,
        messages: [...currentSession.messages, userMessage],
        title:
          currentSession.title === 'Nueva Consulta'
            ? content.slice(0, 30) + '...'
            : currentSession.title,
      };

      setCurrentSession(updatedSession);
      setSessions(prev =>
        prev.map(s => (s.id === updatedSession.id ? updatedSession : s))
      );
      setIsLoading(true);

      try {
        const API_URL = 'http://localhost:8000';

        const res = await fetch(`${API_URL}/convocatorias`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texto: content }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: JSON.stringify(data), // Keep as JSON for SearchResultsList to parse
          timestamp: new Date(),
          phase: currentSession.phase,
        };

        const finalSession: ChatSession = {
          ...updatedSession,
          messages: [...updatedSession.messages, assistantMessage],
        };

        setCurrentSession(finalSession);
        setSessions(prev =>
          prev.map(s => (s.id === finalSession.id ? finalSession : s))
        );
      } catch (error: any) {
        console.error('Error sending message:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession]
  );

  const changePhase = useCallback(
    (phase: 'search' | 'document') => {
      if (!currentSession) return;
      const updatedSession = { ...currentSession, phase };
      setCurrentSession(updatedSession);
      setSessions(prev =>
        prev.map(s => (s.id === updatedSession.id ? updatedSession : s))
      );
    },
    [currentSession]
  );

  const handleFileUpload = useCallback(
    (files: File[]) => {
      if (!currentSession || files.length === 0) return;

      const uploadedFiles: UploadedFile[] = files.map((file, index) => ({
        id: (Date.now() + index).toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        uploadedAt: new Date(),
        file,
      }));

      const systemMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: files.length === 1 
          ? `Archivo "${files[0].name}" (${(files[0].size / 1024).toFixed(1)} KB) subido correctamente.`
          : `${files.length} archivos subidos correctamente: ${files.map(f => f.name).join(', ')}`,
        timestamp: new Date(),
      };

      const updatedSession = {
        ...currentSession,
        messages: [...currentSession.messages, systemMessage],
        uploadedFiles: [
          ...(currentSession.uploadedFiles || []),
          ...uploadedFiles,
        ],
      };

      setCurrentSession(updatedSession);
      setSessions(prev =>
        prev.map(s => (s.id === updatedSession.id ? updatedSession : s))
      );
    },
    [currentSession]
  );

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

  const handleFileRemove = useCallback(
    (fileId: string) => {
      if (!currentSession) return;
      const updatedSession = {
        ...currentSession,
        uploadedFiles: (currentSession.uploadedFiles || []).filter(
          f => f.id !== fileId
        ),
      };
      setCurrentSession(updatedSession);
      setSessions(prev =>
        prev.map(s => (s.id === updatedSession.id ? updatedSession : s))
      );
    },
    [currentSession]
  );

  return {
    sessions,
    currentSession,
    isLoading,
    createNewSession,
    selectSession,
    deleteSession,
    sendMessage,
    changePhase,
    handleFileUpload,
    handleFileDownload,
    handleFileRemove,
  };
};
