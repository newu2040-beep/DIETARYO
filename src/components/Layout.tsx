import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Utensils, Droplets, Activity, Settings, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { profile, logout } = useAppContext();

  useEffect(() => {
    if (profile?.theme) {
      document.body.className = `theme-${profile.theme}`;
    }
  }, [profile?.theme]);

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'diet', label: 'Diet & Fasting', icon: Utensils },
    { id: 'ai', label: 'AI Suggestions', icon: Sparkles },
    { id: 'history', label: 'History & Stats', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen w-full max-w-md mx-auto relative overflow-hidden flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 z-20">
        <h1 className="text-xl font-semibold tracking-tight">DIETARYO</h1>
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-2 rounded-full hover:bg-black/5 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-24 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Hamburger Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-[var(--bg-gradient-from)] shadow-2xl z-50 flex flex-col"
            >
              <div className="p-4 flex justify-end">
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-black/5 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="flex-1 px-4 py-8 flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                        activeTab === item.id 
                          ? 'bg-[var(--primary-btn)] text-[var(--primary-btn-text)]' 
                          : 'hover:bg-black/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-black/10">
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-3 text-center text-sm font-medium opacity-70 hover:opacity-100"
                >
                  Log Out
                </button>
                <p className="text-center text-xs opacity-50 mt-4">
                  Made with love by Rahul Shah
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
