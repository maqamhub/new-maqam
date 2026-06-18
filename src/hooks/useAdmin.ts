import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export function useAdmin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAdmin(currentUser: User | null) {
      if (!currentUser) {
        if (mounted) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      try {
        const adminDoc = await getDoc(doc(db, 'admin_users', currentUser.uid));
        
        if (mounted) {
          setIsAdmin(adminDoc.exists());
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error('Admin check error:', err);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (mounted) {
        setUser(currentUser);
        setLoading(true);
        checkAdmin(currentUser);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { user, isAdmin, loading };
}
