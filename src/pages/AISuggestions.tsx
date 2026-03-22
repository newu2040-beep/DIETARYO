import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Copy, Check, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useAppContext } from '../context/AppContext';

let aiClient: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is missing. Please add it to your environment variables.');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
};

export const AISuggestions: React.FC = () => {
  const { profile } = useAppContext();
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [topic, setTopic] = useState<'diet' | 'fasting' | 'hydration'>('diet');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const generateSuggestion = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const ai = getAI();
      const prompt = `Act as a friendly, motivating AI diet assistant for an app called DIETARYO.
      The user's language preference is ${profile?.language || 'en'}.
      Provide a short, actionable, and encouraging tip about ${topic}.
      Keep it under 3 sentences. Use emojis.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setSuggestion(response.text || 'Stay hydrated and keep up the great work! 💧');
    } catch (error: any) {
      console.error('Error generating suggestion:', error);
      if (error.message?.includes('GEMINI_API_KEY')) {
        setErrorMsg('API Key is missing. Please add GEMINI_API_KEY to your Vercel/GitHub environment variables.');
      } else {
        setSuggestion('Oops! I need a quick break. Try asking me again in a moment. 🌿');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!suggestion) return;
    navigator.clipboard.writeText(suggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 pt-4 h-full">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">AI Insights</h2>
          <p className="text-sm opacity-60">Your personal diet assistant</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'diet', label: 'Healthy Diet', emoji: '🥗' },
          { id: 'fasting', label: 'Fasting Tips', emoji: '⏳' },
          { id: 'hydration', label: 'Hydration', emoji: '💧' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTopic(t.id as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              topic === t.id ? 'bg-[var(--primary-btn)] text-[var(--primary-btn-text)]' : 'bg-black/5 hover:bg-black/10'
            }`}
          >
            <span>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      <motion.div 
        className="glass-card flex-1 rounded-3xl p-6 flex flex-col relative overflow-hidden min-h-[300px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10" />
        
        <div className="flex-1 flex items-center justify-center relative z-10">
          {isLoading ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-purple-500"
            >
              <RefreshCw className="w-8 h-8 opacity-50" />
            </motion.div>
          ) : errorMsg ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center flex flex-col items-center gap-3"
            >
              <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
                <Sparkles className="w-8 h-8" />
              </div>
              <p className="text-red-500 font-medium">{errorMsg}</p>
            </motion.div>
          ) : suggestion ? (
            <motion.p 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xl font-medium leading-relaxed text-center"
            >
              {suggestion}
            </motion.p>
          ) : (
            <div className="text-center opacity-50 flex flex-col items-center gap-4">
              <Sparkles className="w-12 h-12 opacity-20" />
              <p>Tap below to get a personalized insight.</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6 relative z-10">
          <button
            onClick={generateSuggestion}
            disabled={isLoading}
            className="flex-1 py-4 bg-[var(--primary-btn)] text-[var(--primary-btn-text)] rounded-2xl font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Thinking...' : 'Generate Tip'}
          </button>
          
          {suggestion && (
            <button
              onClick={handleCopy}
              className="p-4 bg-black/5 rounded-2xl hover:bg-black/10 transition-colors flex items-center justify-center"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6" />}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
