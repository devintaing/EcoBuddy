import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";

const RecycleAI = () => {
  const [result, setResult] = useState("");
  const ai = new GoogleGenAI({apiKey: "AIzaSyBOHLCW_GJIZfYDV7VMxZOyySarrZpISws"}); // Replace with your API key

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const base64Image = await toBase64(file); // Convert file to base64
    const contents = [
      {
        inlineData: {
          mimeType: file.type,
          data: base64Image,
        },
      },
      { text: "Point out which items are and aren't recyclable in this image" },
    ];

    console.log("waiting for Gemini...");
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    
    console.log(response);
    setResult(response.candidates[0].content.parts[0].text);
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

  return (
    <div>
      <h3>Upload an image to caption</h3>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {result && (
        <div>
          <h4>Caption:</h4>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
};

export default RecycleAI;
