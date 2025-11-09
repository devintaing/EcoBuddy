import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";

const RecycleAI = () => {
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState("Find out what items can be recycled in an image!");
  const ai = new GoogleGenAI({apiKey: "AIzaSyBOHLCW_GJIZfYDV7VMxZOyySarrZpISws"}); // Replace with your API key

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    // Create a temporary local URL for preview
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
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

    setResult("waiting for Gemini...");
    
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
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-center text-5xl font-bold">Upload an image to analyze</h1>
        
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4 w-5/6">
        {preview && (
          <div className="flex flex-col items-center space-y-2">
            <img
              src={preview}
              alt="Preview"
              className="max-w-xs rounded-lg shadow-lg"
            />
            
          </div>
        )}

        {result && <p className="text-gray-700">{result}</p>}
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <label
          htmlFor="file-upload"
          className="text-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
        >
          Upload Image
        </label>
      </div>
    </div>
    
  );
};

export default RecycleAI;
