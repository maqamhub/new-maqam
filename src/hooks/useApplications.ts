import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, Timestamp, orderBy } from 'firebase/firestore';
import { useAuth } from './useAuth';

export interface Application {
  id: string;
  slotId: string;
  masjidId: string;
  khateebId: string;
  khateebName?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  type: 'application' | 'invitation';
  message?: string;
  created_at: Date;
}

export function useApplications(filterType: 'masjid' | 'khateeb') {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setApplications([]);
      setLoading(false);
      return;
    }

    const field = filterType === 'masjid' ? 'masjidId' : 'khateebId';
    const q = query(
      collection(db, 'applications'),
      where(field, '==', user.uid),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appData: Application[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        appData.push({
          id: doc.id,
          ...data,
          created_at: data.created_at ? data.created_at.toDate() : new Date(),
        } as Application);
      });
      setApplications(appData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching applications: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, filterType]);

  const sendApplication = async (data: Partial<Application>) => {
    if (!user) return null;
    try {
      const docRef = await addDoc(collection(db, 'applications'), {
        ...data,
        khateebId: filterType === 'khateeb' ? user.uid : data.khateebId,
        masjidId: filterType === 'masjid' ? user.uid : data.masjidId,
        status: 'pending',
        type: filterType === 'khateeb' ? 'application' : 'invitation',
        created_at: Timestamp.now(),
      });
      return docRef.id;
    } catch (e) {
      console.error("Error sending application: ", e);
      return null;
    }
  };

  const updateApplicationStatus = async (id: string, status: 'pending' | 'accepted' | 'rejected' | 'withdrawn') => {
    try {
      const docRef = doc(db, 'applications', id);
      await updateDoc(docRef, { status });
      return true;
    } catch (e) {
      console.error("Error updating application: ", e);
      return false;
    }
  };

  return { applications, loading, sendApplication, updateApplicationStatus };
}
