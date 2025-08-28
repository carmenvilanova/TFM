import { useState, useCallback } from 'react';
import { Message, ChatSession, UploadedFile } from '../types/chat';

export const useChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createNewSession = useCallback(() => {
    const searchWelcomeMessage = {
      id: Date.now().toString(),
      type: 'system' as const,
      content: '¡Bienvenido al panel de Búsqueda de Ayudas! Aquí puedes buscar subvenciones y ayudas públicas. Pregúntame sobre cualquier tipo de ayuda que necesites.',
      timestamp: new Date(),
    };

    const documentWelcomeMessage = {
      id: (Date.now() + 1).toString(),
      type: 'system' as const,
      content: '¡Bienvenido al panel de Consulta de Documentos! Aquí puedes analizar documentos específicos de subvenciones. Sube un documento para comenzar.',
      timestamp: new Date(),
    };

    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Nueva Consulta',
      messages: [searchWelcomeMessage], // Deprecated - keeping for backward compatibility
      searchMessages: [searchWelcomeMessage],
      documentMessages: [documentWelcomeMessage],
      phase: 'search', // Deprecated - keeping for backward compatibility
      createdAt: new Date(),
      uploadedFiles: [],
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    return newSession;
  }, []);

  const selectSession = useCallback((session: ChatSession) => {
    // Migrate old sessions to new panel structure if needed
    const migratedSession: ChatSession = {
      ...session,
      searchMessages: session.searchMessages || session.messages.filter(msg => !msg.phase || msg.phase === 'search'),
      documentMessages: session.documentMessages || session.messages.filter(msg => msg.phase === 'document'),
    };
    setCurrentSession(migratedSession);
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
    async (content: string, panel: 'search' | 'document') => {
      if (!currentSession) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content,
        timestamp: new Date(),
        phase: panel,
      };

      // Update the appropriate panel's messages
      const currentPanelMessages = panel === 'search' 
        ? currentSession.searchMessages 
        : currentSession.documentMessages;

      const updatedSession: ChatSession = {
        ...currentSession,
        messages: [...currentSession.messages, userMessage], // Deprecated - keeping for backward compatibility
        searchMessages: panel === 'search' 
          ? [...currentSession.searchMessages, userMessage]
          : currentSession.searchMessages,
        documentMessages: panel === 'document' 
          ? [...currentSession.documentMessages, userMessage]
          : currentSession.documentMessages,
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
        const API_URL = 'https://tfm-docker.onrender.com';
        let res;
        let data;

        if (panel === 'document') {
          // RAG (igual que antes)
          res = await fetch(`${API_URL}/preguntar_rag`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pregunta: content }),
          });
          data = await res.json();

          const respuesta = data.resultados?.[0]?.respuesta || data.error || "Sin respuesta";
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: respuesta,
            timestamp: new Date(),
            phase: panel,
          };

          const finalSession: ChatSession = {
            ...updatedSession,
            messages: [...updatedSession.messages, assistantMessage], // Deprecated - keeping for backward compatibility
            documentMessages: [...updatedSession.documentMessages, assistantMessage],
          };
          setCurrentSession(finalSession);
          setSessions(prev =>
            prev.map(s => (s.id === finalSession.id ? finalSession : s))
          );

        } else {
          // Búsqueda normal (convocatorias) en formato tarjetas
          res = await fetch(`${API_URL}/convocatorias`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto: content }),
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          data = await res.json();

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: JSON.stringify(data), // JSON para que el componente renderice tarjetas
            timestamp: new Date(),
            phase: panel,
          };

          const finalSession: ChatSession = {
            ...updatedSession,
            messages: [...updatedSession.messages, assistantMessage], // Deprecated - keeping for backward compatibility
            searchMessages: [...updatedSession.searchMessages, assistantMessage],
          };
          setCurrentSession(finalSession);
          setSessions(prev =>
            prev.map(s => (s.id === finalSession.id ? finalSession : s))
          );
        }
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
        phase: 'document',
      };

      const updatedSession = {
        ...currentSession,
        messages: [...currentSession.messages, systemMessage], // Deprecated - keeping for backward compatibility
        documentMessages: [...currentSession.documentMessages, systemMessage],
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
