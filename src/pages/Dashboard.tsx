import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Droplets, Flame, Utensils, Award, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { user, profile } = useAppContext();
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) return;

    const recordRef = collection(db, `users/${user.uid}/daily_records`);
    const qRecord = query(recordRef, where('date', '==', today));
    
    const unsubRecord = onSnapshot(qRecord, (snapshot) => {
      if (!snapshot.empty) {
        setTodayRecord(snapshot.docs[0].data());
      } else {
        setTodayRecord({ waterIntake: 0, fastingStart: null, fastingEnd: null });
      }
    }, (error) => {
      console.error("Error fetching daily record:", error);
    });

    const mealRef = collection(db, `users/${user.uid}/meals`);
    const qMeal = query(mealRef, where('date', '==', today));
    
    const unsubMeal = onSnapshot(qMeal, (snapshot) => {
      setMeals(snapshot.docs.map(doc => doc.data()));
    }, (error) => {
      console.error("Error fetching meals:", error);
    });

    return () => {
      unsubRecord();
      unsubMeal();
    };
  }, [user, today]);

  const waterProgress = profile?.waterGoal ? (todayRecord?.waterIntake / profile.waterGoal) * 100 : 0;
  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div className="mt-4">
        <h2 className="text-3xl font-light tracking-tight">
          Hello, <span className="font-medium">{user?.displayName?.split(' ')[0] || 'Friend'}</span>
        </h2>
        <p className="text-sm opacity-70 mt-1">Ready to crush your goals today?</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Water Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass-card p-5 rounded-3xl flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-500/10 rounded-full text-blue-500">
              <Droplets className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium opacity-60">Water</span>
          </div>
          <div>
            <div className="text-2xl font-semibold">{todayRecord?.waterIntake || 0}</div>
            <div className="text-xs opacity-60">/ {profile?.waterGoal || 2000} ml</div>
          </div>
          <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(waterProgress, 100)}%` }}
              className="h-full bg-blue-400 rounded-full"
            />
          </div>
        </motion.div>

        {/* Fasting Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass-card p-5 rounded-3xl flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-orange-500/10 rounded-full text-orange-500">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium opacity-60">Fasting</span>
          </div>
          <div>
            <div className="text-2xl font-semibold">
              {todayRecord?.fastingStart && !todayRecord?.fastingEnd ? 'Active' : 'Off'}
            </div>
            <div className="text-xs opacity-60">
              {todayRecord?.fastingStart ? 'Tracking now' : 'Start your fast'}
            </div>
          </div>
        </motion.div>

        {/* Diet Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass-card p-5 rounded-3xl flex flex-col gap-3 col-span-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="font-medium">Today's Diet</span>
            </div>
            <span className="text-sm font-semibold">{totalCalories} kcal</span>
          </div>
          <div className="flex gap-2 mt-2">
            {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => {
              const count = meals.filter(m => m.type === type).length;
              return (
                <div key={type} className={`flex-1 py-2 text-center rounded-xl text-xs font-medium ${count > 0 ? 'bg-[var(--primary-btn)] text-[var(--primary-btn-text)]' : 'bg-black/5'}`}>
                  {type.charAt(0)}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* AI Mini Suggestion */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5 rounded-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Award className="w-16 h-16" />
        </div>
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          AI Insight
        </h3>
        <p className="text-sm opacity-80 leading-relaxed">
          You're doing great! Remember to drink a glass of water before your next meal to stay hydrated and manage portions.
        </p>
      </motion.div>
    </div>
  );
};
