import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, Calendar, TrendingUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { format, parseISO } from 'date-fns';
import { useTranslation } from '../utils/translations';

export const HistoryStats: React.FC = () => {
  const { user, profile } = useAppContext();
  const t = useTranslation(profile?.language);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const recordRef = collection(db, `users/${user.uid}/daily_records`);
    const qRecord = query(recordRef, orderBy('date', 'desc'), limit(7));
    
    const unsubRecord = onSnapshot(qRecord, (snapshot) => {
      setRecords(snapshot.docs.map(doc => doc.data()));
    }, (error) => {
      console.error("Error fetching history:", error);
    });

    return () => unsubRecord();
  }, [user]);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t('historyStats')}</h2>
          <p className="text-sm opacity-60">{t('last7Days')}</p>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-10 opacity-50">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No history yet. Start tracking today!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {records.map((record) => (
            <motion.div 
              key={record.date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5 rounded-3xl flex flex-col gap-4"
            >
              <div className="flex justify-between items-center border-b border-black/5 pb-3">
                <span className="font-semibold text-lg">
                  {format(parseISO(record.date), 'EEE, MMM d')}
                </span>
                <span className="text-xs px-3 py-1 bg-black/5 rounded-full font-medium">
                  {record.waterIntake || 0} ml
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <span className="text-xs opacity-60 uppercase tracking-wider font-semibold">{t('fasting')}</span>
                  <span className="font-medium">
                    {record.fastingStart && record.fastingEnd 
                      ? 'Completed' 
                      : record.fastingStart ? t('active') : 'Skipped'}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-xs opacity-60 uppercase tracking-wider font-semibold">{t('weight')}</span>
                  <span className="font-medium">
                    {record.weight ? `${record.weight} kg` : '--'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
