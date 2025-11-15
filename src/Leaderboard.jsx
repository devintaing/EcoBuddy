import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseConfig.js'

const Leaderboard = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(10));
    const unsub = onSnapshot(q, (snap) => {
      setRows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error('Leaderboard listener error', err)
    })
    return () => unsub()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-4xl font-bold">Leaderboard</h1>
      <h2 className="text-2xl font-bold">See how you stack up against others.</h2>
      <ol className="w-full max-w-md space-y-2">
        {rows.map((r, idx) => (
          <li key={r.id} className="flex justify-between px-4 py-3 rounded border">
            <span>{idx + 1}. {r.displayName || r.email || r.id}</span>
            <span className="font-semibold">{r.totalPoints ?? 0} pts</span>
          </li>
        ))}
      </ol>
      <button onClick={() => navigate('/home')}>
        Back to Home
      </button>
    </div>
  );
};

export default Leaderboard;
