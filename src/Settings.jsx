import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged, updateProfile, signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider, reauthenticateWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { doc, getDoc, setDoc, getDocs, collection, writeBatch, deleteDoc } from 'firebase/firestore'
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
  const [deletingData, setDeletingData] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(null);
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
    <div className="min-h-screen bg-ivory px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-serif text-ink sm:text-4xl">⚙️ Settings</h1>
          <p className="text-sm text-ink/70">Adjust your display name and choose how you show up on leaderboards.</p>
        </header>

        {loading ? (
          <div className="rounded-3xl border border-line bg-white/80 p-6 text-center text-sm text-ink/70 shadow-lg">Loading your preferences…</div>
        ) : !user ? (
          <div className="rounded-3xl border border-line bg-white/80 p-6 text-center text-sm text-ink/70 shadow-lg">No user is signed in.</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-line bg-white/90 p-6 shadow-lg backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-leaf-700">Profile</p>
              <h2 className="mt-2 text-xl font-semibold text-ink">Display name</h2>
              <p className="mt-1 text-sm text-ink/60">Shown in your Home dashboard and leaderboards. Max 50 characters.</p>
              <div className="mt-4 space-y-3">
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                  className="w-full rounded-2xl border border-line bg-white/90 px-4 py-3 text-sm text-ink shadow-inner placeholder:text-ink/40 focus:border-leaf-600 focus:outline-none"
                />
                <button
                  onClick={handleSave}
                  disabled={saving || displayName.trim() === initialDisplayName.trim()}
                  className="inline-flex items-center justify-center rounded-full border border-[#2E7D32] bg-[#2E7D32] px-5 py-2.5 text-sm font-semibold text-white shadow transition-all hover:-translate-y-0.5 hover:bg-[#256528] hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300 active:translate-y-0 cursor-pointer disabled:cursor-not-allowed disabled:bg-line disabled:text-ink/50 disabled:border-line disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:bg-line disabled:hover:text-ink/50"
                >
                  {saving ? 'Saving…' : 'Save display name'}
                </button>
                <p className="text-xs text-ink/50">Tip: Use your first name or a nickname. You can change it anytime.</p>
              </div>
              {success && <div className="mt-4 rounded-2xl border border-fern-300/60 bg-fern-300/30 px-4 py-2 text-sm font-medium text-leaf-700">{success}</div>}
              {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">Error: {error.message}</div>}
            </section>

            <section className="rounded-3xl border border-line bg-white/90 p-6 shadow-lg backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-leaf-700">Privacy</p>
              <h2 className="mt-2 text-xl font-semibold text-ink">Anonymous mode</h2>
              <p className="mt-1 text-sm text-ink/60">Hide your name on community leaderboards. You’ll still see your own stats.</p>
              <div className="mt-6 flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">Leaderboard visibility</p>
                  <p className="text-xs text-ink/60">Currently {anonymous ? 'hidden' : 'visible'} to others.</p>
                </div>
                <button
                  onClick={() => handleToggleAnonymous(!anonymous)}
                  disabled={savingAnonymous}
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300 active:translate-y-0 ${
                    anonymous
                      ? 'border border-[#2E7D32] bg-[#2E7D32] text-white hover:bg-[#256528]'
                      : 'border border-line bg-white text-ink hover:border-leaf-600 hover:text-leaf-700'
                  } ${savingAnonymous ? 'cursor-not-allowed bg-line text-ink/50 border-line hover:translate-y-0 hover:shadow-none' : 'cursor-pointer'}`}
                >
                  {savingAnonymous ? 'Saving…' : anonymous ? 'Anonymous On' : 'Anonymous Off'}
                </button>
              </div>
              <p className="mt-3 text-xs text-ink/60">Switch takes effect immediately for future leaderboard updates.</p>
            </section>
          </div>
        )}

        <section className="mt-6 rounded-3xl border border-line bg-white/90 p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.3em] text-red-600">Danger Zone</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">Delete all my Firestore data</h2>
          <p className="mt-1 text-sm text-ink/60">This will permanently delete your user document and activity records stored in Firestore. This cannot be undone.</p>
          <div className="mt-4">
            <button
              onClick={async () => {
                if (!user) return;
                const confirmation = window.prompt('Type DELETE to permanently remove your Firestore data for this account.');
                if (confirmation !== 'DELETE') return;
                setDeletingData(true);
                setDeleteError(null);
                setDeleteSuccess(null);
                try {
                  const activitiesRef = collection(db, 'users', user.uid, 'activities');
                  const snap = await getDocs(activitiesRef);
                  const docs = snap.docs || [];

                  for (let i = 0; i < docs.length; i += 500) {
                    const batch = writeBatch(db);
                    docs.slice(i, i + 500).forEach(d => batch.delete(d.ref));
                    await batch.commit();
                  }

                  // delete the user document
                  const userRef = doc(db, 'users', user.uid);
                  try {
                    await deleteDoc(userRef);
                  } catch (err) {
                    console.warn('Failed to delete user document:', err);
                  }

                  setDeleteSuccess('Your Firestore data has been deleted. You will be signed out.');

                  // attempt to delete the auth user too
                  try {
                    const currentUser = auth.currentUser;
                    if (currentUser) {
                      try {
                        await deleteUser(currentUser);
                        setDeleteSuccess('Your Firestore data and Authentication account have been deleted.');
                        navigate('/');
                        return;
                      } catch (errAuth) {
                        console.warn('Initial deleteUser failed.', errAuth);

                        setDeleteSuccess('Your Firestore data was deleted. Please sign out or delete your auth account separately.');
                        try { await signOut(auth); } catch (e) {}
                        navigate('/');
                        return;
                      }
                    }
                  } catch (errAuthOuter) {
                    console.warn('Failed to delete auth user', errAuthOuter);
                  }

                  // sign the user out and navigate home if auth deletion didn't occur
                  try { await signOut(auth); } catch (e) {}
                  navigate('/');
                } catch (err) {
                  console.error('Failed to delete user data:', err);
                  setDeleteError(err);
                } finally {
                  setDeletingData(false);
                }
              }}
              disabled={deletingData}
              className={`inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold ${deletingData ? 'bg-line text-ink/50 border-line' : 'border border-red-600 bg-red-600 text-white hover:bg-red-700'}`}
            >
              {deletingData ? 'Deleting…' : 'Delete my Firestore data'}
            </button>
            {deleteError && <div className="mt-3 text-sm text-red-700">Error: {deleteError.message}</div>}
            {deleteSuccess && <div className="mt-3 text-sm text-green-700">{deleteSuccess}</div>}
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="inline-flex items-center justify-center rounded-full border border-line bg-white px-5 py-2 text-sm font-medium text-ink/80 transition-all hover:-translate-y-0.5 hover:border-leaf-600 hover:text-leaf-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300 active:translate-y-0 cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
