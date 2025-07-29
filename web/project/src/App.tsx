import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthForm } from './components/AuthForm';
import { UserMenu } from './components/UserMenu';
import { Sidebar } from './components/Sidebar';
import { ChatContainer } from './components/ChatContainer';
import { useChat } from './hooks/useChat';
import { useAuth } from './hooks/useAuth';
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';
import { Building2, Sparkles } from 'lucide-react';
import { AuthMode } from './types/auth';
import { 
  fadeInUp, 
  scaleIn, 
  slideInUp, 
  pageTransition, 
  hoverScale, 
  iconBounce,
  textReveal 
} from './utils/animations';

function App() {
  const { shouldReduceMotion } = usePerformanceMonitor();
  
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
      <AnimatePresence mode="wait">
        <motion.div
          key="auth"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageTransition}
        >
          <AuthForm
            mode={authMode}
            onModeChange={setAuthMode}
            onLogin={login}
            onRegister={register}
            onGuestLogin={loginAsGuest}
            isLoading={authLoading}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!currentSession) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 flex items-center justify-center"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <motion.div 
          className="text-center"
          variants={slideInUp}
        >
          <motion.div
            variants={scaleIn}
            whileHover="hover"
          >
            <Building2 className="w-20 h-20 text-red-600 mx-auto mb-6" />
          </motion.div>
          
          <motion.h1 
            className="text-3xl font-bold text-gray-800 mb-3"
            variants={textReveal}
          >
            Asistente de Subvenciones
          </motion.h1>
          
          <motion.p 
            className="text-gray-600 mb-8 max-w-md mx-auto"
            variants={textReveal}
          >
            Búsqueda inteligente de ayudas y subvenciones públicas con análisis de documentos
          </motion.p>
          
          <motion.button
            onClick={createNewSession}
            className="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-lg"
            variants={scaleIn}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Comenzar Nueva Consulta
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 flex"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      <Sidebar
        sessions={sessions}
        currentSession={currentSession}
        onSessionSelect={selectSession}
        onNewSession={createNewSession}
        onDeleteSession={deleteSession}
      />
      
      <div className="flex-1 flex flex-col">
        <motion.header 
          className="bg-white border-b border-amber-200 px-6 py-5 shadow-sm"
          variants={slideInUp}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover="hover"
                  variants={iconBounce}
                >
                  <Building2 className="w-10 h-10 text-red-600" />
                </motion.div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-6 h-6 text-amber-500" />
                </motion.div>
              </div>
              <div>
                <motion.h1 
                  className="text-2xl font-bold text-gray-800"
                  variants={textReveal}
                >
                  Asistente de Subvenciones
                </motion.h1>
                <motion.p 
                  className="text-sm text-gray-600"
                  variants={textReveal}
                >
                  Búsqueda inteligente de ayudas públicas
                </motion.p>
              </div>
            </div>
            <UserMenu user={user!} onLogout={logout} />
          </div>
        </motion.header>
        
        <ChatContainer
          session={currentSession}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onPhaseChange={changePhase}
          onGrantSelect={selectGrant}
        />
      </div>
    </motion.div>
  );
}

export default App;