import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export type Theme = 'peach' | 'mint' | 'lavender' | 'blue' | 'sand' | 'dark' | 'light';
export type Language = 'en' | 'ne' | 'ja';

interface UserProfile {
  uid: string;
  email: string;
  theme: Theme;
  language: Language;
  waterGoal: number;
  weightGoal: number;
  createdAt: any;
}

interface AppContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  isAuthReady: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          // Check if profile exists, if not create one
          const userRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userRef).catch(e => handleFirestoreError(e, OperationType.GET, `users/${currentUser.uid}`, auth));
          if (!docSnap.exists()) {
            const newProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              theme: 'peach' as Theme,
              language: 'en' as Language,
              waterGoal: 2000,
              weightGoal: 70,
              createdAt: serverTimestamp(),
            };
            await setDoc(userRef, newProfile).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${currentUser.uid}`, auth));
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
      } finally {
        setIsAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && isAuthReady) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setProfile(doc.data() as UserProfile);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`, auth);
      });
      return () => unsubscribe();
    }
  }, [user, isAuthReady]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), data, { merge: true }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`, auth));
  };

  return (
    <AppContext.Provider value={{ user, profile, isAuthReady, login, logout, updateProfile }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
