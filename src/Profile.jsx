import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { useAuthListener } from "./hooks/useAuthListener";

function Profile() {
    const { user, userDoc, loading, error } = useAuthListener();
    const [creating, setCreating] = useState(false);
    const [createSuccess, setCreateSuccess] = useState(null);
    const [createError, setCreateError] = useState(null);

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

    // Create test activity
    const createTestActivity = async () => {
        setCreating(true);
        setCreateError(null);
        setCreateSuccess(null);

        try {
            const activitiesRef = collection(db, "users", user.uid, "activities");
            const docRef = await addDoc(activitiesRef, {
                Action: "test action written from /profile",
                Points: 10,
                CarbonSaved: 20,
                CreatedAt: serverTimestamp(),
                ActionType: "Test",
            });

            setCreateSuccess(`Created activity ${docRef.id}`);
        } catch (err) {
            console.error("Failed to create test activity", err);
            setCreateError(err.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div>
            <h2>Welcome, {user.displayName || user.email}!</h2>
            <p>User ID: {user.uid}</p>

            <button onClick={createTestActivity} disabled={creating}>
                {creating ? "Creating..." : "Create test action"}
            </button>

            {createSuccess && <p style={{ color: "green" }}>{createSuccess}</p>}
            {createError && <p style={{ color: "red" }}>{createError}</p>}
            {error && <p style={{ color: "red" }}>{error.message}</p>}

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
