import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Droplets, Flame, Utensils, X, Check, Dumbbell } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { collection, doc, setDoc, getDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { useTranslation } from '../utils/translations';

export const DietFasting: React.FC = () => {
  const { user, profile } = useAppContext();
  const t = useTranslation(profile?.language);
  const [activeTab, setActiveTab] = useState<'diet' | 'fasting' | 'water' | 'workout'>('diet');
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  
  // Meal Form State
  const [mealType, setMealType] = useState('Breakfast');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [isJunk, setIsJunk] = useState(false);

  // Workout Form State
  const [workoutType, setWorkoutType] = useState('Cardio');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('Medium');
  const [workoutNotes, setWorkoutNotes] = useState('');

  // Data State
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) return;
    const recordRef = collection(db, `users/${user.uid}/daily_records`);
    const qRecord = query(recordRef, where('date', '==', today));
    const unsubRecord = onSnapshot(qRecord, (snapshot) => {
      if (!snapshot.empty) {
        setTodayRecord({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setTodayRecord(null);
      }
    }, (error) => {
      console.error("Error fetching daily record:", error);
    });

    const mealRef = collection(db, `users/${user.uid}/meals`);
    const qMeal = query(mealRef, where('date', '==', today));
    const unsubMeal = onSnapshot(qMeal, (snapshot) => {
      setMeals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching meals:", error);
    });

    const workoutRef = collection(db, `users/${user.uid}/workouts`);
    const qWorkout = query(workoutRef, where('date', '==', today));
    const unsubWorkout = onSnapshot(qWorkout, (snapshot) => {
      setWorkouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching workouts:", error);
    });

    return () => {
      unsubRecord();
      unsubMeal();
      unsubWorkout();
    };
  }, [user, today]);

  const handleAddWater = async (amount: number) => {
    if (!user) return;
    const recordId = today;
    const recordRef = doc(db, `users/${user.uid}/daily_records`, recordId);
    const snap = await getDoc(recordRef);
    
    if (snap.exists()) {
      await setDoc(recordRef, {
        waterIntake: (snap.data().waterIntake || 0) + amount,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } else {
      await setDoc(recordRef, {
        uid: user.uid,
        date: today,
        waterIntake: amount,
        updatedAt: serverTimestamp()
      });
    }
  };

  const handleToggleFasting = async () => {
    if (!user) return;
    const recordId = today;
    const recordRef = doc(db, `users/${user.uid}/daily_records`, recordId);
    const snap = await getDoc(recordRef);
    
    if (snap.exists()) {
      const data = snap.data();
      if (data.fastingStart && !data.fastingEnd) {
        // Stop fasting
        await setDoc(recordRef, {
          fastingEnd: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } else {
        // Start fasting
        await setDoc(recordRef, {
          fastingStart: serverTimestamp(),
          fastingEnd: null,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } else {
      await setDoc(recordRef, {
        uid: user.uid,
        date: today,
        waterIntake: 0,
        fastingStart: serverTimestamp(),
        fastingEnd: null,
        updatedAt: serverTimestamp()
      });
    }
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !description) return;

    const mealId = Date.now().toString();
    const mealRef = doc(db, `users/${user.uid}/meals`, mealId);
    
    await setDoc(mealRef, {
      uid: user.uid,
      date: today,
      timestamp: serverTimestamp(),
      type: mealType,
      description,
      calories: calories ? parseInt(calories) : 0,
      notes,
      isJunk
    });

    setIsAddingMeal(false);
    setDescription('');
    setCalories('');
    setNotes('');
    setIsJunk(false);
  };

  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !duration) return;

    const workoutId = Date.now().toString();
    const workoutRef = doc(db, `users/${user.uid}/workouts`, workoutId);
    
    await setDoc(workoutRef, {
      uid: user.uid,
      date: today,
      timestamp: serverTimestamp(),
      type: workoutType,
      duration: parseInt(duration),
      intensity,
      notes: workoutNotes
    });

    setIsAddingWorkout(false);
    setDuration('');
    setWorkoutNotes('');
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Tabs */}
      <div className="flex p-1 bg-black/5 rounded-full overflow-x-auto scrollbar-hide">
        {['diet', 'fasting', 'water', 'workout'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-full transition-all capitalize whitespace-nowrap ${
              activeTab === tab ? 'bg-white shadow-sm text-black' : 'text-black/50 hover:text-black/80'
            }`}
          >
            {t(tab as keyof typeof t)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Diet Tab */}
        {activeTab === 'diet' && (
          <motion.div
            key="diet"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{t('todaysDiet')}</h3>
              <button 
                onClick={() => setIsAddingMeal(true)}
                className="p-2 bg-[var(--primary-btn)] text-[var(--primary-btn-text)] rounded-full shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {meals.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <Utensils className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>{t('noMealsLogged')}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {meals.map((meal) => (
                  <div key={meal.id} className="glass-card p-4 rounded-2xl flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold px-2 py-1 bg-black/5 rounded-md uppercase tracking-wider">
                          {meal.type}
                        </span>
                        <h4 className="font-medium mt-2">{meal.description}</h4>
                      </div>
                      {meal.calories > 0 && (
                        <span className="text-sm font-semibold opacity-70">{meal.calories} kcal</span>
                      )}
                    </div>
                    {meal.notes && <p className="text-xs opacity-60 mt-1">{meal.notes}</p>}
                    {meal.isJunk && (
                      <span className="text-xs text-red-500 font-medium mt-1 inline-block">
                        ⚠️ Junk Food Logged
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Fasting Tab */}
        {activeTab === 'fasting' && (
          <motion.div
            key="fasting"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col items-center justify-center py-10 gap-8"
          >
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-8 border-black/5" />
              <motion.div 
                className="absolute inset-0 rounded-full border-8 border-orange-400 border-t-transparent"
                animate={{ rotate: todayRecord?.fastingStart && !todayRecord?.fastingEnd ? 360 : 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <div className="text-center flex flex-col items-center">
                <Flame className={`w-10 h-10 mb-2 ${todayRecord?.fastingStart && !todayRecord?.fastingEnd ? 'text-orange-500' : 'opacity-20'}`} />
                <span className="text-3xl font-light">
                  {todayRecord?.fastingStart && !todayRecord?.fastingEnd ? t('fasting') : '00:00'}
                </span>
                <span className="text-sm opacity-50 mt-1">
                  {todayRecord?.fastingStart && !todayRecord?.fastingEnd ? 'Keep going!' : 'Ready to start?'}
                </span>
              </div>
            </div>

            <button
              onClick={handleToggleFasting}
              className={`px-8 py-4 rounded-full font-semibold shadow-lg transition-all ${
                todayRecord?.fastingStart && !todayRecord?.fastingEnd
                  ? 'bg-red-500 text-white'
                  : 'bg-[var(--primary-btn)] text-[var(--primary-btn-text)]'
              }`}
            >
              {todayRecord?.fastingStart && !todayRecord?.fastingEnd ? t('endFast') : t('startFast')}
            </button>
          </motion.div>
        )}

        {/* Water Tab */}
        {activeTab === 'water' && (
          <motion.div
            key="water"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col items-center justify-center py-10 gap-8"
          >
            <div className="text-center">
              <Droplets className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-4xl font-light">{todayRecord?.waterIntake || 0} <span className="text-xl opacity-50">ml</span></h3>
              <p className="opacity-50 mt-2">{t('dailyGoal')}: {profile?.waterGoal || 2000} ml</p>
            </div>

            <div className="flex gap-4">
              {[250, 500].map(amount => (
                <button
                  key={amount}
                  onClick={() => handleAddWater(amount)}
                  className="glass-card px-6 py-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-blue-500/10 transition-colors"
                >
                  <Plus className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">{amount} ml</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Workout Tab */}
        {activeTab === 'workout' && (
          <motion.div
            key="workout"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{t('todaysWorkout')}</h3>
              <button 
                onClick={() => setIsAddingWorkout(true)}
                className="p-2 bg-[var(--primary-btn)] text-[var(--primary-btn-text)] rounded-full shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {workouts.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>{t('noWorkoutsLogged')}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {workouts.map((workout) => (
                  <div key={workout.id} className="glass-card p-4 rounded-2xl flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold px-2 py-1 bg-black/5 rounded-md uppercase tracking-wider">
                          {workout.type}
                        </span>
                        <h4 className="font-medium mt-2">{workout.duration} mins - {workout.intensity}</h4>
                      </div>
                    </div>
                    {workout.notes && <p className="text-xs opacity-60 mt-1">{workout.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Meal Modal */}
      <AnimatePresence>
        {isAddingMeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[var(--bg-gradient-from)] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">{t('logMeal')}</h3>
                <button onClick={() => setIsAddingMeal(false)} className="p-2 bg-black/5 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMeal} className="flex flex-col gap-4">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMealType(type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        mealType === type ? 'bg-[var(--primary-btn)] text-[var(--primary-btn-text)]' : 'bg-black/5'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="What did you eat?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-black/5 border-none focus:ring-2 focus:ring-black/20 outline-none"
                  required
                />

                <input
                  type="number"
                  placeholder="Calories (optional)"
                  value={calories}
                  onChange={e => setCalories(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-black/5 border-none focus:ring-2 focus:ring-black/20 outline-none"
                />

                <textarea
                  placeholder="Notes or mood (optional)"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-black/5 border-none focus:ring-2 focus:ring-black/20 outline-none resize-none h-24"
                />

                <label className="flex items-center gap-3 p-4 rounded-2xl bg-black/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isJunk}
                    onChange={e => setIsJunk(e.target.checked)}
                    className="w-5 h-5 rounded border-black/20 text-[var(--primary-btn)] focus:ring-[var(--primary-btn)]"
                  />
                  <span className="font-medium">{t('markAsJunk')}</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-4 mt-2 bg-[var(--primary-btn)] text-[var(--primary-btn-text)] rounded-2xl font-semibold shadow-lg flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {t('saveEntry')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Workout Modal */}
      <AnimatePresence>
        {isAddingWorkout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[var(--bg-gradient-from)] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">{t('logWorkout')}</h3>
                <button onClick={() => setIsAddingWorkout(false)} className="p-2 bg-black/5 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddWorkout} className="flex flex-col gap-4">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {['Cardio', 'Strength', 'Yoga', 'Sports'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setWorkoutType(type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        workoutType === type ? 'bg-[var(--primary-btn)] text-[var(--primary-btn-text)]' : 'bg-black/5'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  placeholder={t('duration')}
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-black/5 border-none focus:ring-2 focus:ring-black/20 outline-none"
                  required
                />

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {['Low', 'Medium', 'High'].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setIntensity(level)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                        intensity === level ? 'bg-[var(--primary-btn)] text-[var(--primary-btn-text)]' : 'bg-black/5'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Notes (optional)"
                  value={workoutNotes}
                  onChange={e => setWorkoutNotes(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-black/5 border-none focus:ring-2 focus:ring-black/20 outline-none resize-none h-24"
                />

                <button
                  type="submit"
                  className="w-full py-4 mt-2 bg-[var(--primary-btn)] text-[var(--primary-btn-text)] rounded-2xl font-semibold shadow-lg flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {t('saveEntry')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
