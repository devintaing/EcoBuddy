import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig.js'

const Settings = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [initialDisplayName, setInitialDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [savingAnonymous, setSavingAnonymous] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setDisplayName('');
        setInitialDisplayName('');
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(userRef);
        const nameFromDoc = snap.exists() ? snap.data().displayName : null;
        const anonFromDoc = snap.exists() ? Boolean(snap.data().anonymous) : false;

        const name = nameFromDoc || currentUser.displayName || '';
        setDisplayName(name);
        setInitialDisplayName(name);
  setAnonymous(anonFromDoc);
      } catch (err) {
        console.error('Failed to read user displayName:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    const trimmed = String(displayName || '').trim().slice(0, 50);
    if (!trimmed) {
      setError(new Error('Display name cannot be empty'));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateProfile(user, { displayName: trimmed });
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { displayName: trimmed }, { merge: true });

      setInitialDisplayName(trimmed);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to save displayName:', err);
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAnonymous = async (next) => {
    if (!user) return;
    setSavingAnonymous(true);
    setError(null);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { anonymous: !!next }, { merge: true });
      setAnonymous(!!next);
    } catch (err) {
      console.error('Failed to update anonymous flag:', err);
      setError(err);
    } finally {
      setSavingAnonymous(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-4xl font-bold">Settings</h1>

      <div className="w-full max-w-md">
        {loading ? (
          <p>Loading...</p>
        ) : user ? (
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Display Name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="w-full p-2 border rounded"
            />

              <div className="flex gap-2 items-center">
                <button
                  onClick={handleSave}
                  disabled={saving || displayName.trim() === initialDisplayName.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <label className="font-semibold">Anonymous</label>
                <button
                  onClick={() => handleToggleAnonymous(!anonymous)}
                  disabled={savingAnonymous}
                  className={`px-3 py-1 rounded ${anonymous ? 'bg-green-600 text-white' : 'bg-gray-200 text-black'}`}
                >
                  {savingAnonymous ? 'Saving…' : (anonymous ? 'On' : 'Off')}
                </button>
              </div>

            {success && <div style={{ color: 'green' }}>{success}</div>}
            {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
          </div>
        ) : (
          <p>No user is signed in.</p>
        )}
      </div>

      <button onClick={() => navigate('/home')}>
        Back to Home
      </button>
    </div>
  );
};

export default Settings;
