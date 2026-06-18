import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, Timestamp, orderBy } from 'firebase/firestore';
import { useAuth } from './useAuth';

export interface Slot {
  id: string;
  masjidId: string;
  date: Date;
  time: string;
  hadiyyaAmount: string | number;
  status: 'open' | 'filled' | 'cancelled';
  khateebId?: string;
  khateebName?: string;
  topic?: string;
  created_at: Date;
  applicants?: number;
}

export function useAllSlots() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSlots([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'slots'),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const slotData: Slot[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        slotData.push({
          id: doc.id,
          ...data,
          date: data.date ? data.date.toDate() : new Date(),
          created_at: data.created_at ? data.created_at.toDate() : new Date(),
        } as Slot);
      });
      setSlots(slotData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching slots: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateSlot = async (id: string, updateData: Partial<Slot>) => {
    try {
      const docRef = doc(db, 'slots', id);
      const toUpdate = { ...updateData };
      if (toUpdate.date) {
        (toUpdate as any).date = Timestamp.fromDate(toUpdate.date);
      }
      await updateDoc(docRef, toUpdate);
      return true;
    } catch (e) {
      console.error("Error updating slot: ", e);
      return false;
    }
  };

  return { slots, loading, updateSlot };
}

export function useMasjidSlots() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSlots([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'slots'),
      where('masjidId', '==', user.uid),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const slotData: Slot[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        slotData.push({
          id: doc.id,
          ...data,
          date: data.date ? data.date.toDate() : new Date(),
          created_at: data.created_at ? data.created_at.toDate() : new Date(),
        } as Slot);
      });
      setSlots(slotData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching slots: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createSlot = async (slotData: Partial<Slot>) => {
    if (!user) return null;
    try {
      const docRef = await addDoc(collection(db, 'slots'), {
        ...slotData,
        masjidId: user.uid,
        status: 'open',
        created_at: Timestamp.now(),
        date: slotData.date ? Timestamp.fromDate(slotData.date) : Timestamp.now()
      });
      return docRef.id;
    } catch (e) {
      console.error("Error adding document: ", e);
      return null;
    }
  };

  const updateSlot = async (id: string, updateData: Partial<Slot>) => {
    try {
      const docRef = doc(db, 'slots', id);
      const toUpdate = { ...updateData };
      if (toUpdate.date) {
        (toUpdate as any).date = Timestamp.fromDate(toUpdate.date);
      }
      await updateDoc(docRef, toUpdate);
      return true;
    } catch (e) {
      console.error("Error updating slot: ", e);
      return false;
    }
  };

  const deleteSlot = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'slots', id));
      return true;
    } catch (e) {
      console.error("Error deleting slot: ", e);
      return false;
    }
  };

  return { slots, loading, createSlot, updateSlot, deleteSlot };
}
