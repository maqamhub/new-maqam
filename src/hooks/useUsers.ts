import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from './useAuth';

export interface PlatformUser {
  id: string;
  name: string;
  account_type: 'masjid' | 'khateeb';
  profile?: any;
  status: string;
  created_at: any;
}

export function useUsers(accountType?: 'masjid' | 'khateeb') {
  const { user } = useAuth();
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUsers([]);
      setLoading(false);
      return;
    }

    let q = query(collection(db, 'users'));
    if (accountType) {
      q = query(collection(db, 'users'), where('account_type', '==', accountType));
    }
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedUsers: PlatformUser[] = [];
      querySnapshot.forEach((doc) => {
        fetchedUsers.push({ id: doc.id, ...doc.data() } as PlatformUser);
      });
      setUsers(fetchedUsers);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching users:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [accountType, user]);

  const updateUser = async (id: string, data: Partial<PlatformUser>) => {
    try {
      await updateDoc(doc(db, 'users', id), data);
      return true;
    } catch(e) {
      console.error("Error updating user: ", e);
      return false;
    }
  };

  const createUser = async (data: any) => {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...data,
        status: data.status || 'verified',
        created_at: Timestamp.now()
      });
      return docRef.id;
    } catch(e) {
      console.error("Error creating user: ", e);
      return null;
    }
  }

  return { users, loading, updateUser, createUser };
}
