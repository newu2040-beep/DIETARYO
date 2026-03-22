import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { DietFasting } from './pages/DietFasting';
import { AISuggestions } from './pages/AISuggestions';
import { HistoryStats } from './pages/HistoryStats';
import { Settings } from './pages/Settings';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sparkles, LogIn } from 'lucide-react';

const AuthScreen: React.FC = () => {
  const { login, loginError } = useAppContext();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 theme-peach">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-3xl flex flex-col items-center text-center max-w-sm w-full gap-6"
      >
        <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-2">
          <Sparkles className="w-10 h-10 text-orange-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">DIETARYO</h1>
          <p className="opacity-70">Your personal AI diet assistant. Track everything, improve every day.</p>
        </div>
        
        {loginError && (
          <div className="w-full p-4 bg-red-500/10 text-red-500 text-sm rounded-xl text-left">
            {loginError}
          </div>
        )}
        
        <button
          onClick={login}
          className="w-full py-4 bg-[var(--primary-btn)] text-[var(--primary-btn-text)] rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg mt-2"
        >
          <LogIn className="w-5 h-5" />
          Continue with Google
        </button>
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

