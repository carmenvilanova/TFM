import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthForm } from './components/AuthForm';
import { UserMenu } from './components/UserMenu';
import { Sidebar } from './components/Sidebar';
import { PanelChatContainer } from './components/PanelChatContainer';
import { LanguageSelector } from './components/LanguageSelector';
import { Footer } from './components/Footer';
import { useChat } from './hooks/useChat';
import { useAuth } from './hooks/useAuth';
import { Building2, Sparkles } from 'lucide-react';
import { AuthMode } from './types/auth';

function App() {
  const { t } = useTranslation();
  
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    login,
    register,
    loginAsGuest,
    logout,
  } = useAuth();
  
  const [authMode, setAuthMode] = React.useState<AuthMode>('login');
  
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
    handleFileUpload,
    handleFileDownload,
    handleFileRemove,
  } = useChat();

  // Move useEffect to top level to avoid Rules of Hooks violation
  useEffect(() => {
    // Solo crear una sesión inicial si no hay sesiones
    if (isAuthenticated && sessions.length === 0) {
      createNewSession();
    }
  }, [isAuthenticated, sessions.length, createNewSession]);

  // Show auth form if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthForm
        mode={authMode}
        onModeChange={setAuthMode}
        onLogin={login}
        onRegister={register}
        onGuestLogin={loginAsGuest}
        isLoading={authLoading}
      />
    );
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 flex flex-col animate-fade-in">
        <div className="flex-1 flex items-center justify-center">
          <div className="absolute top-4 right-4">
            <LanguageSelector />
          </div>
          <div className="text-center animate-slide-in-left">
            <Building2 className="w-20 h-20 text-red-600 mx-auto mb-6 animate-bounce-gentle hover:scale-110 transition-transform-smooth" />
            <h1 className="text-3xl font-bold text-gray-800 mb-3">{t('app.title')}</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{t('app.description')}</p>
            <button
              onClick={createNewSession}
              className="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all-smooth font-medium shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              {t('welcome.startNewQuery')}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 flex animate-fade-in">
      <Sidebar
        sessions={sessions}
        currentSession={currentSession}
        onSessionSelect={selectSession}
        onNewSession={createNewSession}
        onDeleteSession={deleteSession}
      />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-amber-200 px-6 py-5 shadow-sm animate-slide-in-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-10 h-10 text-red-600 transition-transform-smooth hover:scale-110" />
                <Sparkles className="w-6 h-6 text-amber-500 animate-pulse-gentle" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{t('app.title')}</h1>
                <p className="text-sm text-gray-600">{t('app.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <UserMenu user={user!} onLogout={logout} />
            </div>
          </div>
        </header>
        
        <PanelChatContainer
          session={currentSession}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onGrantSelect={selectGrant}
          onFileUpload={handleFileUpload}
          onFileDownload={handleFileDownload}
          onFileRemove={handleFileRemove}
        />
        
        <Footer />
      </div>
    </div>
  );
}

export default App;