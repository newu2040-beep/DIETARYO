import React from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Palette, Globe, Target, LogOut } from 'lucide-react';
import { useAppContext, Theme, Language } from '../context/AppContext';

export const Settings: React.FC = () => {
  const { profile, updateProfile, logout } = useAppContext();

  const themes: { id: Theme; label: string; color: string }[] = [
    { id: 'peach', label: 'Peach Glow', color: 'bg-orange-200' },
    { id: 'mint', label: 'Mint Breeze', color: 'bg-green-200' },
    { id: 'lavender', label: 'Lavender Soft', color: 'bg-purple-200' },
    { id: 'blue', label: 'Baby Blue', color: 'bg-blue-200' },
    { id: 'sand', label: 'Soft Sand', color: 'bg-stone-200' },
    { id: 'dark', label: 'Dark Mode', color: 'bg-gray-800' },
    { id: 'light', label: 'Light Mode', color: 'bg-gray-100' },
  ];

  const languages: { id: Language; label: string }[] = [
    { id: 'en', label: 'English' },
    { id: 'ne', label: 'Nepali' },
    { id: 'ja', label: 'Japanese' },
  ];

  return (
    <div className="flex flex-col gap-6 pt-4 pb-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-black/5 rounded-2xl">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="text-sm opacity-60">Personalize your experience</p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-3xl flex flex-col gap-6">
        {/* Theme Selection */}
        <div className="flex flex-col gap-3">
          <h3 className="font-medium flex items-center gap-2">
            <Palette className="w-4 h-4 opacity-50" />
            Theme
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => updateProfile({ theme: theme.id })}
                className={`h-12 rounded-2xl transition-all border-2 ${theme.color} ${
                  profile?.theme === theme.id ? 'border-[var(--text-primary)] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
                title={theme.label}
              />
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div className="flex flex-col gap-3">
          <h3 className="font-medium flex items-center gap-2">
            <Globe className="w-4 h-4 opacity-50" />
            Language
          </h3>
          <div className="flex gap-2">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => updateProfile({ language: lang.id })}
                className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-colors ${
                  profile?.language === lang.id ? 'bg-[var(--primary-btn)] text-[var(--primary-btn-text)]' : 'bg-black/5 hover:bg-black/10'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="flex flex-col gap-3">
          <h3 className="font-medium flex items-center gap-2">
            <Target className="w-4 h-4 opacity-50" />
            Daily Goals
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-80">Water Goal (ml)</span>
              <input 
                type="number" 
                value={profile?.waterGoal || 2000}
                onChange={(e) => updateProfile({ waterGoal: parseInt(e.target.value) || 2000 })}
                className="w-24 p-2 bg-black/5 rounded-xl text-center font-medium border-none outline-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-80">Weight Goal (kg)</span>
              <input 
                type="number" 
                value={profile?.weightGoal || 70}
                onChange={(e) => updateProfile({ weightGoal: parseInt(e.target.value) || 70 })}
                className="w-24 p-2 bg-black/5 rounded-xl text-center font-medium border-none outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full py-4 mt-4 bg-red-500/10 text-red-500 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </button>
    </div>
  );
};
