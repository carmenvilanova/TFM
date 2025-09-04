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
      content:
        '¡Bienvenido al panel de Búsqueda de Ayudas! Aquí puedes buscar subvenciones y ayudas públicas. Pregúntame sobre cualquier tipo de ayuda que necesites.',
      timestamp: new Date(),
    };

    const documentWelcomeMessage = {
      id: (Date.now() + 1).toString(),
      type: 'system' as const,
      content:
        '¡Bienvenido al panel de Consulta de Documentos! Aquí puedes analizar documentos específicos de subvenciones. Sube un documento para comenzar.',
      timestamp: new Date(),
    };

    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Nueva Consulta',
      messages: [searchWelcomeMessage], // compat
      searchMessages: [searchWelcomeMessage],
      documentMessages: [documentWelcomeMessage],
      phase: 'search',
      createdAt: new Date(),
      uploadedFiles: [],
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    return newSession;
  }, []);

  const selectSession = useCallback((session: ChatSession) => {
    // Migración para sesiones antiguas
    const migrated: ChatSession = {
      ...session,
      searchMessages:
        session.searchMessages ||
        session.messages.filter(m => !m.phase || m.phase === 'search'),
      documentMessages:
        session.documentMessages ||
        session.messages.filter(m => m.phase === 'document'),
      phase: (session as any).phase || 'search',
      uploadedFiles: session.uploadedFiles ?? [], // PATCH: normaliza a []
    };
    setCurrentSession(migrated);
  }, []);

  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) setCurrentSession(null);
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

      const updatedSession: ChatSession = {
        ...currentSession,
        phase: panel, // PATCH: sincroniza fase con el panel
        messages: [...currentSession.messages, userMessage],
        searchMessages:
          panel === 'search'
            ? [...currentSession.searchMessages, userMessage]
            : currentSession.searchMessages,
        documentMessages:
          panel === 'document'
            ? [...currentSession.documentMessages, userMessage]
            : currentSession.documentMessages,
        title:
          currentSession.title === 'Nueva Consulta'
            ? content.slice(0, 30) + '...'
            : currentSession.title,
      };

      setCurrentSession(updatedSession);
      setSessions(prev => prev.map(s => (s.id === updatedSession.id ? updatedSession : s)));
      setIsLoading(true);

      try {
        const API_URL = 'https://tfm-docker.onrender.com';
        let res, data;

        if (panel === 'document') {
          // Preguntas a documentos (RAG)
          res = await fetch(`${API_URL}/preguntar_rag`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pregunta: content }),
          });
          data = await res.json();

          const respuesta = data.resultados?.[0]?.respuesta || data.error || 'Sin respuesta';
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: respuesta,
            timestamp: new Date(),
            phase: panel,
          };

          const finalSession: ChatSession = {
            ...updatedSession,
            messages: [...updatedSession.messages, assistantMessage],
            documentMessages: [...updatedSession.documentMessages, assistantMessage],
          };
          setCurrentSession(finalSession);
          setSessions(prev => prev.map(s => (s.id === finalSession.id ? finalSession : s)));
        } else {
          // Búsqueda de convocatorias (tarjetas)
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
            content: JSON.stringify(data),
            timestamp: new Date(),
            phase: panel,
          };

          const finalSession: ChatSession = {
            ...updatedSession,
            messages: [...updatedSession.messages, assistantMessage],
            searchMessages: [...updatedSession.searchMessages, assistantMessage],
          };
          setCurrentSession(finalSession);
          setSessions(prev => prev.map(s => (s.id === finalSession.id ? finalSession : s)));
        }
      } catch (e) {
        console.error('Error sending message:', e);
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession]
  );

  const changePhase = useCallback((phase: 'search' | 'document') => {
    if (!currentSession) return;
    const updated = { ...currentSession, phase };
    setCurrentSession(updated);
    setSessions(prev => prev.map(s => (s.id === updated.id ? updated : s)));
  }, [currentSession]);

  const handleFileUpload = useCallback((files: File[]) => {
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

    const updatedSession: ChatSession = {
      ...currentSession,
      phase: 'document', // PATCH: cambia a Documentos al instante
      // PATCH: sin mensajes de sistema extra; la UI de archivos depende solo de uploadedFiles
      messages: currentSession.messages,
      documentMessages: currentSession.documentMessages,
      uploadedFiles: [...(currentSession.uploadedFiles || []), ...uploadedFiles],
    };

    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => (s.id === updatedSession.id ? updatedSession : s)));
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
    setSessions(prev => prev.map(s => (s.id === updatedSession.id ? updatedSession : s)));
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
    handleFileUpload,
    handleFileDownload,
    handleFileRemove,
  };
};
