import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, Timestamp, orderBy, or, and } from 'firebase/firestore';
import { useAuth } from './useAuth';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  created_at: Date;
  read: boolean;
}

export function useChat(otherUserId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !otherUserId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'messages'),
      or(
        and(where('senderId', '==', user.uid), where('receiverId', '==', otherUserId)),
        and(where('senderId', '==', otherUserId), where('receiverId', '==', user.uid))
      ),
      orderBy('created_at', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          id: doc.id,
          ...data,
          created_at: data.created_at ? data.created_at.toDate() : new Date(),
        } as Message);
      });
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching messages: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, otherUserId]);

  const sendMessage = async (text: string) => {
    if (!user || !otherUserId || !text.trim()) return null;
    try {
      const docRef = await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        receiverId: otherUserId,
        text: text.trim(),
        created_at: Timestamp.now(),
        read: false
      });
      return docRef.id;
    } catch (e) {
      console.error("Error sending message: ", e);
      return null;
    }
  };

  return { messages, loading, sendMessage };
}
