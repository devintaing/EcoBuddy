import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebaseConfig.js'
import { onAuthStateChanged } from 'firebase/auth';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [topRows, setTopRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(10));
    const unsub = onSnapshot(q, (snap) => {
      setTopRows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error('Leaderboard listener error', err)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let mounted = true;
    const ensureUserIncluded = async () => {
      let merged = Array.isArray(topRows) ? [...topRows] : [];
      if (currentUser && currentUser.uid) {
        const exists = merged.find(r => r.id === currentUser.uid);
        if (!exists) {
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
              merged = [...merged, { id: userDoc.id, ...userDoc.data() }];
            }
          } catch (e) {
            console.error('Error fetching current user for leaderboard', e);
          }
        }
      }
      if (mounted) setRows(merged);
    };
    ensureUserIncluded();
    return () => { mounted = false };
  }, [topRows, currentUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-4xl font-bold">Leaderboard</h1>
      <h2 className="text-2xl font-bold">See how you stack up against others.</h2>
      <ol className="w-full max-w-md space-y-2">
        {rows.map((r, idx) => (
            <li key={r.id} className="flex justify-between px-4 py-3 rounded border">
              <span>
                {idx + 1}. {r.anonymous ? 'Username Hidden' : (r.displayName || r.email || r.id)}
                {currentUser?.uid === r.id ? ' (You)' : ''}
              </span>
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
