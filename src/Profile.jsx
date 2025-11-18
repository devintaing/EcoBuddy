import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, addDoc, serverTimestamp, setDoc, increment, runTransaction } from 'firebase/firestore';
import { auth, db } from './firebaseConfig.js'

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userDoc, setUserDoc] = useState(null);
    const [error, setError] = useState(null);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [createSuccess, setCreateSuccess] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (!currentUser) {
                setUserDoc(null);
                setLoading(false);
                return;
            }

            try {
                // Read the Firestore document at /users/{uid}
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setUserDoc({ id: userSnap.id, ...userSnap.data() });
                } else {
                    // Document does not exist
                    setUserDoc(null);
                }
            } catch (err) {
                console.error('Failed to fetch user document:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <p>Loading user data...</p>;

    if (!user) return <p>No user is signed in.</p>;

    return (
        <div>
            <h2>Welcome, {user.displayName || user.email}!</h2>
            <p>User ID: {user.uid}</p>
                    <div style={{ margin: '12px 0' }}>
                        <button
                            onClick={async () => {
                                if (!user) return;
                                setCreating(true);
                                setCreateError(null);
                                setCreateSuccess(null);
                                try {
                                    const activitiesRef = collection(db, 'users', user.uid, 'activities');
                                    const docRef = await addDoc(activitiesRef, {
                                        Action: 'test action written from /profile',
                                        Points: 10,
                                        CarbonSaved: 20,
                                        CreatedAt: serverTimestamp(),
                                        ActionType: 'Test'
                                    });

                                    const userRef = doc(db, 'users', user.uid);

                                    await runTransaction(db, async (transaction) => {
                                        const userSnap = await transaction.get(userRef);
                                        const prev = userSnap.exists() ? userSnap.data() : {};

                                        const prevLast = prev.lastUpdated;
                                        const prevStreak = prev.streak || 0;

                                        // compute days between prevLast and now
                                        let newStreak = 1;
                                        if (prevLast && typeof prevLast.toDate === 'function') {
                                            const lastDate = prevLast.toDate();
                                            const nowDate = new Date();
                                            const utcLast = Date.UTC(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
                                            const utcNow = Date.UTC(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
                                            const daysDiff = Math.floor((utcNow - utcLast) / (24 * 60 * 60 * 1000));

                                            if (daysDiff === 0) {
                                                // already logged today — keep the current streak
                                                newStreak = prevStreak || 1;
                                            } else if (daysDiff === 1) {
                                                // consecutive day
                                                newStreak = (prevStreak || 0) + 1;
                                            } else {
                                                // gap — reset
                                                newStreak = 1;
                                            }
                                        } else {
                                            newStreak = 1;
                                        }

                                        if (userSnap.exists()) {
                                            transaction.update(userRef, {
                                                totalPoints: (prev.totalPoints || 0) + 10,
                                                totalCO2Saved: (prev.totalCO2Saved || 0) + 20,
                                                streak: newStreak,
                                                lastUpdated: serverTimestamp()
                                            });
                                        } else {
                                            transaction.set(userRef, {
                                                totalPoints: 10,
                                                totalCO2Saved: 20,
                                                streak: newStreak,
                                                lastUpdated: serverTimestamp()
                                            }, { merge: true });
                                        }
                                    });

                                    setCreateSuccess(`Created activity ${docRef.id}`);
                                } catch (err) {
                                    console.error('Failed to create test activity', err);
                                    setCreateError(err);
                                } finally {
                                    setCreating(false);
                                }
                            }}
                            disabled={!user || creating}
                        >
                            {creating ? 'Creating...' : 'Create test action'}
                        </button>
                    </div>

            {error && <p style={{ color: 'red' }}>Error loading profile: {error.message}</p>}
        </div>
    );
}

export default Profile;