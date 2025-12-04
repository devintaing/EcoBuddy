import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import { useAuthListener } from "./hooks/useAuthListener";
import { doc, runTransaction, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { db } from './firebaseConfig.js'
import Navbar from './components/Navbar';
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const RecycleAI = () => {
  const [preview, setPreview] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [initialText, setInitialText] = useState("Find out what items can be recycled in an image!");
  const ai = new GoogleGenAI({apiKey: apiKey});
  const prompt = `You are an expert waste and recycling assistant. Your task is to analyze the provided image of a single object (which may be a composite of materials) and generate a JSON object with specific recycling and disposal information.

    The JSON object must contain four keys:
    1.  **main_object**: A concise, two-to-three word description of the primary object in the image (e.g., "Plastic food storage container with silicone lid").
    2.  **category**: A single categorical classification for the disposal of the **largest or most valuable part** of the object, chosen from *only* the following four options: **Recycle**, **Compost**, **Landfill/Trash**, or **Hazardous Waste**.
    3.  **instructions**: A short, easy-to-read, step-by-step list of clear instructions for the user on how to properly prepare and dispose of the object. **For composite items (like plastic with a silicone lid), the instructions must clearly state which parts need to be separated and how to dispose of each part.** Include a maximum of 3 key steps.
    4.  **co2_saved_lbs**: The estimated pounds of CO2 saved by properly recycling or composting this item compared to throwing it in the landfill/trash. If the category is "Landfill/Trash" or "Hazardous Waste", set this to 0. Base estimates on typical material weights and carbon impact data.

    **Crucially, format the entire output as a valid JSON object.**

    **Example of expected and ONLY format:**
    {
      "main_object": "Plastic food storage container with silicone lid",
      "category": "Recycle",
      "instructions": [
        "Separate the plastic container from the silicone lid.",
        "Rinse the plastic container and place it loosely in your recycling bin.",
        "The silicone lid must be thrown into the Landfill/Trash."
      ],
      "co2_saved_lbs": 0.8
    }`
  
  const { user } = useAuthListener();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    // Create a temporary local URL for preview
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
    setAnalysisResult(null);
    setInitialText(null);
    if (!file) return;

    const base64Image = await toBase64(file); // Convert file to base64
    const contents = [
      {
        inlineData: {
          mimeType: file.type,
          data: base64Image,
        },
      },
      { text: prompt},
    ];

    setInitialText("Analyzing..."); // Show loading message
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
      });
  
      console.log(response.candidates[0].content.parts[0].text);
  
      const cleanedResponse = response.candidates[0].content.parts[0].text.replace('```json', '').replace('```', '').trim();
      const parsedResponse = JSON.parse(cleanedResponse);

      // Round CO2 to 2 decimal points
      const roundedCO2 = Math.round((Number(parsedResponse.co2_saved_lbs) || 0) * 100) / 100;
      parsedResponse.co2_saved_lbs = roundedCO2;

      console.log(parsedResponse);
      setAnalysisResult(parsedResponse);
      setInitialText(null); // Clear loading/initial text

      // If a user is signed in, create an activity and update totals/streak
      if (user) {
        try {
          const activitiesRef = collection(db, 'users', user.uid, 'activities');
          const pts = 5;
          const carbonSaved = Number(parsedResponse.co2_saved_lbs) || 0;
          const roundedCarbon = Math.round(carbonSaved * 100) / 100; // 2 decimal points
          const actionText = `Photo Analysis: ${parsedResponse.main_object}`;

          // create the activity document
          const docRef = await addDoc(activitiesRef, {
            Action: actionText,
            Points: pts,
            CarbonSaved: roundedCarbon,
            CreatedAt: serverTimestamp(),
            ActionType: 'Photo'
          });

          const userRef = doc(db, 'users', user.uid);
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
                totalPoints: (prev.totalPoints || 0) + pts,
                totalCO2Saved: (prev.totalCO2Saved || 0) + roundedCarbon,
                streak: newStreak,
                lastUpdated: serverTimestamp()
              });
            } else {
              transaction.set(userRef, {
                totalPoints: pts,
                totalCO2Saved: roundedCarbon,
                streak: newStreak,
                lastUpdated: serverTimestamp()
              }, { merge: true });
            }
          });
        } catch (err) {
          console.warn('Failed to create activity/update streak after image upload', err);
        }
      }
    }
    catch (error){
      console.error("Analysis Error:", error);
      setInitialText("Error analyzing image. Please try again.");
      setAnalysisResult(null);
    }
    
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(",")[1]; // Remove data:image/jpeg;base64,
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
        case 'recycle': return 'text-blue-600';
        case 'compost': return 'text-green-700';
        case 'landfill/trash': return 'text-red-600';
        case 'hazardous waste': return 'text-yellow-600';
        default: return 'text-gray-700';
    }
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-ivory px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/50 px-5 py-4 shadow-lg shadow-black/5 backdrop-blur-md">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-leaf-700">Impact tracker</p>
              <h1 className="text-3xl font-serif text-ink sm:text-4xl">Photo Recyclability Analysis</h1>
              <p className="text-xs text-ink/60 sm:text-sm">Upload a photo or item and get fast guidance on how to recycle or compost it responsibly.</p>
            </div>
          </header>
            <section className="relative flex flex-col items-center rounded-[2rem] bg-white p-10 shadow-xl shadow-black/5">
              <div className="flex flex-col items-center justify-center min-h-screen space-y-8 w-5/6 p-6">
                {preview && (
                  <div className="flex flex-col items-center space-y-2">
                    <h2 className="text-2xl font-semibold">Image Preview</h2>
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-xs rounded-lg shadow-lg border-4 border-gray-300"
                    />
                  </div>
                )}

                {initialText && (
                  <p className="text-gray-700 text-xl font-medium">{initialText}</p>
                )}

                {analysisResult && (
                  <div className="w-full max-w-md bg-white p-6 border-2 border-green-700 rounded-lg shadow-2xl space-y-4">
                    <h2 className="text-3xl font-bold text-green-700 text-center border-b pb-2">Disposal Guide</h2>
                    
                    {/* Object */}
                    <div className="border-l-4 border-green-700 pl-3">
                      <h3 className="text-lg font-semibold text-gray-800">🗑️ Main Object:</h3>
                      <p className="text-2xl font-extrabold text-gray-900 mt-1">{analysisResult.main_object}</p>
                    </div>

                    {/* Category */}
                    <div className="border-l-4 border-green-700 pl-3 pt-3">
                      <h3 className="text-lg font-semibold text-gray-800">♻️ Dispose In:</h3>
                      <p className={`text-3xl font-extrabold ${getCategoryColor(analysisResult.category)} mt-1`}>
                        {analysisResult.category.toUpperCase()}
                      </p>
                    </div>

                    {/* Instructions */}
                    <div className="pt-3">
                      <h3 className="text-lg font-semibold text-gray-800 border-t pt-3">📝 Instructions:</h3>
                      <ul className="list-disc list-inside space-y-2 mt-2 text-gray-700">
                        {analysisResult.instructions.map((instruction, index) => (
                          <li key={index} className="text-left font-medium">
                            {instruction}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CO2 Saved */}
                    {analysisResult.co2_saved_lbs > 0 && (
                      <div className="border-l-4 border-green-700 pl-3 pt-3">
                        <h3 className="text-lg font-semibold text-gray-800">🌍 CO₂ Impact:</h3>
                        <p className="text-2xl font-extrabold text-green-700 mt-1">
                          {analysisResult.co2_saved_lbs} lbs CO₂e saved
                        </p>
                        <p className="text-sm text-gray-600 mt-1">vs. throwing in landfill</p>
                      </div>
                    )}
                  </div>
                )}
  
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <label
                  htmlFor="file-upload"
                  className="text-center bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-full shadow-lg cursor-pointer transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Upload Image
                </label>
              </div>
            </section>

        </div>
      </div>



      
    </div>
    
  );
};

export default RecycleAI;
