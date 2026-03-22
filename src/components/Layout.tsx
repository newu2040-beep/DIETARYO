import React, { useEffect } from 'react';
import { Home, Utensils, Activity, Settings, Sparkles, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { profile, updateProfile } = useAppContext();

  useEffect(() => {
    if (profile?.theme) {
      document.body.className = `theme-${profile.theme}`;
    }
  }, [profile?.theme]);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'diet', label: 'Diet', icon: Utensils },
    { id: 'ai', label: 'AI', icon: Sparkles },
    { id: 'history', label: 'Stats', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const toggleTheme = () => {
    const isDark = profile?.theme === 'dark';
    updateProfile({ theme: isDark ? 'light' : 'dark' });
  };

  return (
    <div className="min-h-screen w-full max-w-md mx-auto relative overflow-hidden flex flex-col bg-[var(--bg-gradient-from)]">
      {/* Header */}
      <header className="flex items-center justify-between p-5 z-20">
        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--primary-btn)]">
          DIETARYO
        </h1>
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-full bg-black/5 hover:bg-black/10 transition-colors relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={profile?.theme === 'dark' ? 'dark' : 'light'}
              initial={{ y: -20, opacity: 0, rotate: -90 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 20, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              {profile?.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.div>
          </AnimatePresence>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-5 pb-28 relative z-10 scrollbar-hide">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 px-4 pointer-events-none">
        <nav className="bg-[var(--bg-gradient-from)]/90 backdrop-blur-xl border border-black/5 shadow-2xl rounded-3xl p-2 flex items-center justify-between w-full max-w-md pointer-events-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="relative p-3 rounded-2xl flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-bubble"
                    className="absolute inset-0 bg-[var(--primary-btn)] rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-6 h-6 transition-colors ${isActive ? 'text-[var(--primary-btn-text)]' : 'opacity-50'}`} />
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-[var(--primary-btn-text)]' : 'opacity-50'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
