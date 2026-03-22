import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { DietFasting } from './pages/DietFasting';
import { AISuggestions } from './pages/AISuggestions';
import { HistoryStats } from './pages/HistoryStats';
import { Settings } from './pages/Settings';
import { Tools } from './pages/Tools';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sparkles, LogIn, UserCircle2 } from 'lucide-react';
import { useTranslation } from './utils/translations';

const AuthScreen: React.FC = () => {
  const { login, loginAsGuest, loginError } = useAppContext();
  const t = useTranslation('en'); // Default to English on auth screen
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 theme-peach">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-card p-8 rounded-3xl flex flex-col items-center text-center max-w-sm w-full gap-6"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-2"
        >
          <Sparkles className="w-10 h-10 text-orange-500" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">DIETARYO</h1>
          <p className="opacity-70">{t('appDescription')}</p>
        </div>
        
        {loginError && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="w-full p-4 bg-red-500/10 text-red-500 text-sm rounded-xl text-left"
          >
            {loginError}
          </motion.div>
        )}
        
        <div className="w-full flex flex-col gap-3 mt-2">
          <button
            onClick={loginAsGuest}
            className="w-full py-4 bg-black/5 hover:bg-black/10 text-[var(--text-primary)] rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <UserCircle2 className="w-5 h-5" />
            {t('continueAsGuest')}
          </button>
          
          <button
            onClick={login}
            className="w-full py-4 bg-[var(--primary-btn)] text-[var(--primary-btn-text)] rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <LogIn className="w-5 h-5" />
            {t('continueWithGoogle')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const MainApp: React.FC = () => {
  const { user, isAuthReady } = useAppContext();
  const [activeTab, setActiveTab] = useState('home');

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8 opacity-20" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'home' && <Dashboard />}
      {activeTab === 'diet' && <DietFasting />}
      {activeTab === 'ai' && <AISuggestions />}
      {activeTab === 'history' && <HistoryStats />}
      {activeTab === 'tools' && <Tools />}
      {activeTab === 'settings' && <Settings />}
    </Layout>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </ErrorBoundary>
  );
}

