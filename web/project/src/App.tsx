import React, { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatContainer } from './components/ChatContainer';
import { useChat } from './hooks/useChat';
import { Building2, Sparkles } from 'lucide-react';

function App() {
  const {
    sessions,
    currentSession,
    isLoading,
    createNewSession,
    selectSession,
    deleteSession,
    sendMessage,
    changePhase,
    selectGrant,
  } = useChat();

  useEffect(() => {
    // Solo crear una sesión inicial si no hay sesiones
    if (sessions.length === 0) {
      createNewSession();
    }
  }, [sessions.length, createNewSession]);

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-20 h-20 text-red-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Asistente de Subvenciones</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Búsqueda inteligente de ayudas y subvenciones públicas con análisis de documentos</p>
          <button
            onClick={createNewSession}
            className="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            Comenzar Nueva Consulta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 flex">
      <Sidebar
        sessions={sessions}
        currentSession={currentSession}
        onSessionSelect={selectSession}
        onNewSession={createNewSession}
        onDeleteSession={deleteSession}
      />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-amber-200 px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-10 h-10 text-red-600" />
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Asistente de Subvenciones</h1>
              <p className="text-sm text-gray-600">Búsqueda inteligente de ayudas públicas</p>
            </div>
          </div>
        </header>
        
        <ChatContainer
          session={currentSession}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onPhaseChange={changePhase}
          onGrantSelect={selectGrant}
        />
      </div>
    </div>
  );
}

export default App;