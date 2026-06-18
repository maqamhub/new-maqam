import { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, Timestamp, orderBy } from 'firebase/firestore';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  created_at: Date;
  read: boolean;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notifs.push({
          id: doc.id,
          ...data,
          created_at: data.created_at ? data.created_at.toDate() : new Date(),
        } as Notification);
      });
      setNotifications(notifs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addNotification = async (userId: string, type: string, message: string) => {
    try {
      if (!userId) return null;
      const docRef = await addDoc(collection(db, 'notifications'), {
        userId,
        type,
        message,
        created_at: Timestamp.now(),
        read: false
      });
      return docRef.id;
    } catch (e) {
      console.error("Error adding notification: ", e);
      return null;
    }
  };

  return { notifications, loading, addNotification };
}
