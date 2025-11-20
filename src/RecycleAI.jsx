import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const RecycleAI = () => {
  const [preview, setPreview] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [initialText, setInitialText] = useState("Find out what items can be recycled in an image!");
  const ai = new GoogleGenAI({apiKey: apiKey});
  const prompt = `You are an expert waste and recycling assistant. Your task is to analyze the provided image of a single object (which may be a composite of materials) and generate a JSON object with specific recycling and disposal information.

    The JSON object must contain three keys:
    1.  **main_object**: A concise, two-to-three word description of the primary object in the image (e.g., "Plastic food storage container with silicone lid").
    2.  **category**: A single categorical classification for the disposal of the **largest or most valuable part** of the object, chosen from *only* the following four options: **Recycle**, **Compost**, **Landfill/Trash**, or **Hazardous Waste**.
    3.  **instructions**: A short, easy-to-read, step-by-step list of clear instructions for the user on how to properly prepare and dispose of the object. **For composite items (like plastic with a silicone lid), the instructions must clearly state which parts need to be separated and how to dispose of each part.** Include a maximum of 3 key steps.

    **Crucially, format the entire output as a valid JSON object.**

    **Example of expected and ONLY format:**
    {
      "main_object": "Plastic food storage container with silicone lid",
      "category": "Recycle",
      "instructions": [
        "Separate the plastic container from the silicone lid.",
        "Rinse the plastic container and place it loosely in your recycling bin.",
        "The silicone lid must be thrown into the Landfill/Trash."
      ]
    }`
  
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
  
      // const result = `${parsedResponse.main_object} \n 
      //   Dispose in: ${parsedResponse.category} \n 
      //   Instructions: ${parsedResponse.instructions}`;
  
      console.log(parsedResponse);
      // setResult(response.candidates[0].content.parts[0].text);
      setAnalysisResult(parsedResponse);
      setInitialText(null); // Clear loading/initial text
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
        case 'compost': return 'text-green-600';
        case 'landfill/trash': return 'text-red-600';
        case 'hazardous waste': return 'text-yellow-600';
        default: return 'text-gray-700';
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-center text-5xl font-bold">Upload an image to analyze</h1>
        
      <div className="flex flex-col items-center justify-center min-h-screen space-y-8 w-5/6 p-6 bg-gray-50 rounded-lg shadow-xl">
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
            <div className="w-full max-w-md bg-white p-6 border-2 border-green-500 rounded-lg shadow-2xl space-y-4">
                <h2 className="text-3xl font-bold text-green-700 text-center border-b pb-2">Disposal Guide</h2>
                
                {/* Field 1: Object */}
                <div className="border-l-4 border-green-500 pl-3">
                    <h3 className="text-lg font-semibold text-gray-800">🗑️ Main Object:</h3>
                    <p className="text-2xl font-extrabold text-gray-900 mt-1">{analysisResult.main_object}</p>
                </div>

                {/* Field 2: Category */}
                <div className="border-l-4 border-green-500 pl-3 pt-3">
                    <h3 className="text-lg font-semibold text-gray-800">♻️ Dispose In:</h3>
                    <p className={`text-3xl font-extrabold ${getCategoryColor(analysisResult.category)} mt-1`}>
                        {analysisResult.category.toUpperCase()}
                    </p>
                </div>

                {/* Field 3: Instructions */}
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
          className="text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg cursor-pointer transition duration-300 ease-in-out transform hover:scale-105"
        >
          Upload Image
        </label>
      </div>
    </div>
    
  );
};

export default RecycleAI;
