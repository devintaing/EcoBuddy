import React, { useState, useEffect } from "react";
import { useAuthListener } from "./hooks/useAuthListener";
import { doc, getDoc, collection, addDoc, serverTimestamp, setDoc, increment, runTransaction, getDocs } from 'firebase/firestore';
import { auth, db } from './firebaseConfig.js'

function Profile() {
    const { user, userDoc, loading, error } = useAuthListener();
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [createSuccess, setCreateSuccess] = useState(null);

    // Activities state
    const [activities, setActivities] = useState([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    const [activitiesError, setActivitiesError] = useState(null);

    // Load user activities
    useEffect(() => {
        if (!user) return;

        async function fetchActivities() {
            setActivitiesLoading(true);

            try {
                const activitiesRef = collection(db, "users", user.uid, "activities");
                const snapshot = await getDocs(activitiesRef);

                const list = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setActivities(list);
            } catch (err) {
                console.error("Failed to load activities:", err);
                setActivitiesError(err);
            } finally {
                setActivitiesLoading(false);
            }
        }

        fetchActivities();
    }, [user]);

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

            <hr />

            <h3>Your Activities</h3>

            {activitiesLoading && <p>Loading activities...</p>}
            {activitiesError && <p style={{ color: "red" }}>{activitiesError.message}</p>}

            {!activitiesLoading && activities.length === 0 && (
                <p>You have no activities yet.</p>
            )}

            <ul>
                {activities.map((a) => (
                    <li key={a.id}>
                        <strong>{a.Action}</strong> — {a.Points} pts — Saved {a.CarbonSaved}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Profile;