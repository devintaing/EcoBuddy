import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
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