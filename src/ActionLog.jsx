import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { doc, getDoc, getDocs, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseConfig.js'
import { useAuthListener } from "./hooks/useAuthListener";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const ActionLog = () => {
  const { user, userDoc, loading, error } = useAuthListener();
  const [action, setAction] = useState("");
  const [carbonSaved, setCarbonSaved] = useState(0);
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState(null);
  const [calculatingCarbon, setCalulatingCarbon] = useState(false);


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

  const createActivity = async (carbon) => {
      try {
          const activitiesRef = collection(db, "users", user.uid, "activities");
          const docRef = await addDoc(activitiesRef, {
              Action: action,
              Points: carbon,
              CarbonSaved: carbon,
              CreatedAt: serverTimestamp(),
              ActionType: "Test",
          });


          // Fetch the created document
          const newDocSnap = await getDoc(docRef);
          const newActivity = { id: docRef.id, ...newDocSnap.data() };

          setActivities(prev => [...prev, newActivity]); // append to array


      } catch (err) {
          console.error("Failed to create test activity", err);
      }
    };


  const logAction = async() => {
    setCalulatingCarbon(true);
    const ai = new GoogleGenAI({apiKey: apiKey}); // Replace with your API key

    const contents = [
      { text: `Respond with just the number of pounds of C02 saved on the first line.
        The action taken is ${action}` },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    console.log(response);
    // a reponse has a candidates array.
    // each item in candidates has a hash called content, and content is a hash too
    // inside of content is an array of parts. parts is a hash
    setCarbonSaved(response.candidates[0].content.parts[0].text);
    createActivity(response.candidates[0].content.parts[0].text);
    setCalulatingCarbon(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-4xl font-bold">Action Log</h1>
      <h2 className="text-2xl font-bold">Find out the impact of an action you took.</h2>
      
    <div className="w-full max-w-sm min-w-[200px] flex items-center space-x-2">
      <input
        className="flex-grow bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
        placeholder="Your carbon-saving action here..."
        onChange={(e) => setAction(e.target.value)}
      />

      <button onClick={ () => logAction() } className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 border border-green-700 rounded whitespace-nowrap">
        {calculatingCarbon && "Calculating Carbon..." }
        {!calculatingCarbon && "Calculate Carbon Saved" }
      </button>
    </div>
    
      {calculatingCarbon && <p>Calculating Carbon...</p>}
      {!calculatingCarbon && <p>Carbon Saved: {carbonSaved} pounds</p>}

      <button onClick={() => navigate('/home')}>
        Back to Home
      </button>
      
      <h1>Your Actions</h1>
      <ul>
          {activities.map((a) => (
              <li key={a.id}>
                  <strong>{a.Action}</strong> — {a.Points} pts — Saved {a.CarbonSaved}
              </li>
          ))}
      </ul>
    </div>

  );


};

export default ActionLog;
