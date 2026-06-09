import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig'; // NEED TO CREATE firebaseConfig.ts
import { Attempt } from '../types';

export default function UserDashboard() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttempts() {
      if (!auth.currentUser) return;
      
      const q = query(collection(db, 'attempts'), where('userId', '==', auth.currentUser.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data() as Attempt);
      setAttempts(data);
      setLoading(false);
    }
    fetchAttempts();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      {loading ? <p>Loading...</p> : (
        <ul className="space-y-4">
          {attempts.map((attempt, i) => (
            <li key={i} className="p-4 bg-white rounded shadow">
              <p>Subject: {attempt.subject}</p>
              <p>Score: {attempt.score}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
