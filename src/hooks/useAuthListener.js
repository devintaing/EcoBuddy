import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export function useAuthListener() {
    const [user, setUser] = useState(null);
    const [userDoc, setUserDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (!currentUser) {
                setUserDoc(null);
                setLoading(false);
                return;
            }

            try {
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);

                setUserDoc(userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null);
            } catch (err) {
                console.error("Failed to fetch user document:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return { user, userDoc, loading, error };
}
