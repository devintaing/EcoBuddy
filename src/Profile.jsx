// App.js or AuthContext.js
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getAuth } from 'firebase/auth';
import { collection, getDocs, where, query } from 'firebase/firestore';
import { db } from './firebaseConfig.js'

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Action: UserId(String), Action(String), CarbonSaved(Number)
    const [actions, setActions] = useState([]);

    useEffect(() => {
    const auth = getAuth();
        const getUser = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            getUserActivities(currentUser);
        });
        
        
        const getUserActivities = async(currentUser) => {
            const userActivities = collection(db, 'UserActivities');
            const q = query(userActivities, 
                where("UserId", "==", currentUser.uid));
            const activityDocs = await getDocs(q);
            
            const actionsData = activityDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setActions(actionsData);
            console.log(actionsData, actionsData.length);
            console.log(currentUser.uid == "AYWEuadqcxRDIZoJfSLtLboawPq1")
        };

        // Clean up the listener when the component unmounts
        return () => getUser();
    }, []);

    if (loading) {
    return <p>Loading user data...</p>;
    }

    if (!user) {
    return <p>No user is signed in.</p>;
    }

    return (
    <div>
        <h2>Welcome, {user.displayName || user.email}!</h2>
        <p>User ID: {user.uid}</p>
        {actions.map(action => (
            <li key={action.Action}>{action.Action} {action.CarbonSaved}</li>
        ))}
    </div>
    );
}

export default Profile;