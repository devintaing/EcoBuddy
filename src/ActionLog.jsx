import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { doc, getDoc, getDocs, collection, addDoc, serverTimestamp, setDoc, runTransaction } from 'firebase/firestore';
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
  const [deletingId, setDeletingId] = useState(null);


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
              Points: 10,
              CarbonSaved: carbon,
              CreatedAt: serverTimestamp(),
              ActionType: "Action Logged",
          });


          // Fetch the created document
          const newDocSnap = await getDoc(docRef);
          const newActivity = { id: docRef.id, ...newDocSnap.data() };

          setActivities(prev => [...prev, newActivity]); // append to array

          // Update totals, streak and lastUpdated in a transaction
          try {
            const userRef = doc(db, 'users', user.uid);
            const carbonNum = Number(carbon) || 0;

            await runTransaction(db, async (transaction) => {
              const uSnap = await transaction.get(userRef);
              const prev = uSnap.exists() ? uSnap.data() : {};

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
                  newStreak = prevStreak || 1;
                } else if (daysDiff === 1) {
                  newStreak = (prevStreak || 0) + 1;
                } else {
                  newStreak = 1;
                }
              } else {
                newStreak = 1;
              }

              if (uSnap.exists()) {
                transaction.update(userRef, {
                  totalPoints: (prev.totalPoints || 0) + 10,
                  totalCO2Saved: (prev.totalCO2Saved || 0) + carbonNum,
                  streak: newStreak,
                  lastUpdated: serverTimestamp()
                });
              } else {
                transaction.set(userRef, {
                  totalPoints: 10,
                  totalCO2Saved: carbonNum,
                  streak: newStreak,
                  lastUpdated: serverTimestamp()
                }, { merge: true });
              }
            });
          } catch (err) {
            console.warn('Failed to update user totals/streak after creating activity', err);
          }


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
    <div className="min-h-screen bg-ivory px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/50 px-5 py-4 shadow-lg shadow-black/5 backdrop-blur-md">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-leaf-700">Impact tracker</p>
            <h1 className="text-3xl font-serif text-ink sm:text-4xl">Action Log</h1>
            <p className="text-xs text-ink/60 sm:text-sm">Estimate carbon savings with AI and keep your streak going.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-ink/80 shadow-md shadow-black/5 transition-all hover:-translate-y-0.5 hover:text-leaf-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300 active:translate-y-0 cursor-pointer"
          >
            Back to Home
          </button>
        </header>

        <div className="grid min-h-[70vh] gap-5 overflow-hidden lg:h-[calc(100vh-150px)] lg:grid-cols-[1.7fr_1fr]">
          <section className="relative flex flex-col rounded-[2rem] bg-white p-10 shadow-xl shadow-black/5">
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.3em] text-leaf-700">Log an action</p>
              <h2 className="text-5xl font-serif text-ink sm:text-6xl">What did you do today?</h2>
              <p className="max-w-3xl text-sm text-ink/70 sm:text-base">
                Describe your eco-action and we’ll estimate the carbon saved. Keep your streak alive with daily entries.
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-4">
              <textarea
                className="min-h-[220px] w-full resize-none rounded-[1.5rem] bg-transparent px-6 py-6 text-3xl text-ink placeholder:text-ink/30 focus:outline-none focus:ring-0"
                placeholder="Type like a journal… “Biked to work and skipped the car.”"
                onChange={(e) => setAction(e.target.value)}
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => logAction()}
                  className="inline-flex items-center justify-center rounded-full bg-[#58B27C] px-7 py-3 text-base font-semibold text-white shadow-lg shadow-black/10 transition-all hover:bg-[#4AA46E] hover:shadow-xl active:translate-y-px focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {calculatingCarbon ? 'Calculating…' : 'Calculate Carbon Saved'}
                </button>
                {!calculatingCarbon && carbonSaved ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-fern-300/70 px-4 py-2 text-sm font-semibold text-ink shadow-md shadow-black/10">
                    {carbonSaved} lbs CO₂e saved
                  </span>
                ) : (
                  <span className="text-xs text-ink/60">+10 pts per action • streak updates automatically</span>
                )}
              </div>
              {calculatingCarbon && <p className="text-sm text-ink/70">Calculating carbon impact…</p>}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#58B27C] px-5 py-5 text-white shadow-lg shadow-black/10">
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">Entries Logged</p>
                <p className="mt-2 text-3xl font-semibold">{activities.length}</p>
                <p className="text-xs text-white/70">All-time entries recorded</p>
              </div>
              <div className="rounded-2xl bg-[#58B27C] px-5 py-5 text-white shadow-lg shadow-black/10">
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">Total Points</p>
                <p className="mt-2 text-3xl font-semibold">{activities.length * 10}</p>
                <p className="text-xs text-white/70">Based on +10 pts per action</p>
              </div>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden rounded-[2rem] bg-white/90 p-5 shadow-xl shadow-black/5 backdrop-blur-sm">
              <div className="flex items-center justify-between px-1 py-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-ink/60">Recent updates</p>
                  <h3 className="text-lg font-semibold text-ink">Your latest actions</h3>
                </div>
              </div>

              <div className="mt-2 flex-1 space-y-3 overflow-y-auto pr-1">
                {activitiesLoading && (
                  <div className="rounded-2xl bg-white px-4 py-3 text-sm text-ink/70 shadow-sm shadow-black/5">
                    Loading your actions…
                  </div>
                )}
                {activitiesError && (
                  <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm shadow-black/5">
                    Error loading activities. Please try again.
                  </div>
                )}
                {!activitiesLoading && !activitiesError && activities.length === 0 && (
                  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl bg-white px-4 py-6 text-center text-sm text-ink/70 shadow-sm shadow-black/5">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-fern-300/60 text-2xl text-ink">🌱</div>
                    <p className="font-semibold text-ink">No actions yet</p>
                    <p className="mt-1 text-xs text-ink/60">Log your first eco-action to see it here.</p>
                  </div>
                )}
                {!activitiesLoading && !activitiesError && activities.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm shadow-black/5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">{a.Action}</p>
                      <p className="text-xs text-ink/60">Saved {a.CarbonSaved} lbs CO₂e</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-fern-300/70 px-3 py-1 text-xs font-semibold text-ink">+{a.Points} pts</span>
                      <button
                        onClick={async () => {
                          if (!user) return;
                          if (!confirm('Delete this activity? This will remove its points and CO₂ from your totals.')) return;
                          setDeletingId(a.id);
                          try {
                            const activityRef = doc(db, 'users', user.uid, 'activities', a.id);
                            const userRef = doc(db, 'users', user.uid);

                            await runTransaction(db, async (transaction) => {
                              const actSnap = await transaction.get(activityRef);
                              if (!actSnap.exists()) return;
                              const act = actSnap.data() || {};
                              const pts = Number(act.Points) || 0;
                              const carbon = Number(act.CarbonSaved) || 0;

                              const uSnap = await transaction.get(userRef);
                              const prev = uSnap.exists() ? uSnap.data() : {};

                              transaction.delete(activityRef);

                              const newPoints = Math.max(0, (prev.totalPoints || 0) - pts);
                              const newCO2 = Math.max(0, (prev.totalCO2Saved || 0) - carbon);

                              if (uSnap.exists()) {
                                transaction.update(userRef, { totalPoints: newPoints, totalCO2Saved: newCO2 });
                              } else {
                                transaction.set(userRef, { totalPoints: newPoints, totalCO2Saved: newCO2 }, { merge: true });
                              }
                            });

                            // remove from local list
                            setActivities((prev) => prev.filter((it) => it.id !== a.id));
                          } catch (err) {
                            console.error('Failed to delete activity', err);
                            setActivitiesError(err);
                          } finally {
                            setDeletingId(null);
                          }
                        }}
                        disabled={deletingId === a.id}
                        className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 shadow-sm shadow-black/5 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === a.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );


};

export default ActionLog;
