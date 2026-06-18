import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  User,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserData {
  account_type: 'masjid' | 'khateeb';
  email: string;
  name?: string;
  created_at?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchUserData(currentUser: User | null) {
      if (!currentUser) {
        if (mounted) {
          setUserData(null);
          setLoading(false);
        }
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (mounted) {
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {
            setUserData(null);
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error('User fetch error:', err);
          setUserData(null);
          setLoading(false);
        }
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (mounted) {
        setUser(currentUser);
        setLoading(true);
        fetchUserData(currentUser);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = async (defaultType?: 'khateeb' | 'masjid' | null) => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore
      const userRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userRef);
      
      const isNewUser = !userDoc.exists() || !userDoc.data().name;
      
      if (!userDoc.exists() && defaultType) {
        await setDoc(userRef, {
          account_type: defaultType,
          email: result.user.email,
          created_at: new Date().toISOString()
        });
      }

      const updatedDoc = await getDoc(userRef);
      return { user: result.user, isNewUser, userData: updatedDoc.exists() ? updatedDoc.data() : null };
    } catch (error: any) {
      console.error("Google login failed:", error.code, error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Logout failed:", error.message);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, defaultType?: 'khateeb' | 'masjid' | null) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        account_type: defaultType || 'khateeb',
        email: result.user.email,
        created_at: new Date().toISOString()
      });
      return { user: result.user };
    } catch (error: any) {
      console.error("Sign up failed:", error.code, error.message);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userRef);
      
      const isNewUser = !userDoc.exists() || !userDoc.data().name;
      return { user: result.user, isNewUser, userData: userDoc.exists() ? userDoc.data() : null };
    } catch (error: any) {
      console.error("Sign in failed:", error.code, error.message);
      throw error;
    }
  };

  return { 
    user, 
    userData, 
    loading,
    loginWithGoogle,
    loginWithEmail,
    signUpWithEmail,
    logout
  };
}

