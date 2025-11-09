import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, db } from './firebaseConfig.js'
import { collection, getDocs, getCountFromServer } from 'firebase/firestore'

const Home = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(null);
  const [loadingCount, setLoadingCount] = useState(true);
  const [countError, setCountError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoadingCount(true);
      setCountError(null);
      setCount(null);

      if (!currentUser) {
        setLoadingCount(false);
        return;
      }

      try {
        const activitiesRef = collection(db, 'users', currentUser.uid, 'activities');
        if (typeof getCountFromServer === 'function') {
          const aggSnap = await getCountFromServer(activitiesRef);
          setCount(aggSnap.data().count || 0);
        } else {
          const snap = await getDocs(activitiesRef);
          setCount(snap.size || 0);
        }
      } catch (err) {
        console.error('Failed to fetch activity count', err);
        setCountError(err);
      } finally {
        setLoadingCount(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-4xl font-bold">Welcome to EcoBuddy!</h1>
      <p className="">
        {loadingCount ? (
          'Loading actions...'
        ) : countError ? (
          `Error loading actions: ${countError.message}`
        ) : (
          `You have logged ${count ?? 0} actions so far.`
        )}
      </p>
      <h2 className="text-2xl font-bold">What would you like to do today?</h2>
      <div className="flex gap-4 mt-4">
        <button onClick={() => navigate('/recycle')}>
          Recyclability Analysis
        </button>

        <button onClick={() => navigate('/compost')}>
          Compostability Analysis
        </button>

        <button onClick={() => navigate('/action')}>
          Action Log
        </button>

        <button onClick={() => navigate('/leaderboard')}>
          Leaderboard
        </button>

        <button onClick={() => navigate('/settings')}>
          Settings
        </button>

        <button
          onClick={async () => {
            try {
              await signOut(auth)
            } catch (err) {
              console.warn('Sign out failed', err)
            } finally {
              navigate('/')
            }
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;