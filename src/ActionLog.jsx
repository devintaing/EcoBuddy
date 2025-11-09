import React from 'react';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const ActionLog = () => {
  const [action, setAction] = useState("");
  const [carbonSaved, setCarbonSaved] = useState(0);
  const navigate = useNavigate();

  const logAction = async() => {
    const ai = new GoogleGenAI({apiKey: "AIzaSyBOHLCW_GJIZfYDV7VMxZOyySarrZpISws"}); // Replace with your API key

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
        Calculate Carbon Saved
      </button>
    </div>


      <p>Carbon Saved: {carbonSaved}</p>
      <button onClick={() => navigate('/home')}>
        Back to Home
      </button>
    </div>
  );
};

export default ActionLog;
