import React, { useEffect } from 'react';
import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useAuthListener } from "./hooks/useAuthListener";
import Navbar from './components/Navbar';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const EcofriendlyRecommendations = () => {
  const { user } = useAuthListener();
  const [gettingRec, setGettingRec] = useState(false);
  const [product, setProduct] = useState("");
  const [productRec, setProductRec] = useState(null);
  const [error, setError] = useState(null);

  const recommendProduct = async () => {
    if (!product) return;

    setGettingRec(true);
    setError(null);
    setProductRec(null);

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const prompt = `
      You are an expert in eco-friendly products.  
      Given the user's product input, respond ONLY in the following JSON format (do NOT add extra text):

      {
        "original_product": "<the product the user entered>",
        "eco_alternative": "<a recommended eco-friendly alternative>",
        "reason": "<why this alternative is better for the environment>"
      }

      Example:

      {
        "original_product": "Plastic water bottle",
        "eco_alternative": "Stainless steel water bottle",
        "reason": "Reusable and durable, reduces plastic waste and pollution"
      }

      User product: "${product}"
      `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ text: prompt }],
      });

      const rawText = response.candidates[0].content.parts[0].text;

      const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(cleanedText);
      setProductRec(parsed);
    } catch (err) {
      console.error(err);
      setError("Failed to generate recommendation. Please try again.");
    } finally {
      setGettingRec(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-ivory px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/50 px-5 py-4 shadow-lg shadow-black/5 backdrop-blur-md">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-leaf-700">Impact tracker</p>
              <h1 className="text-3xl font-serif text-ink sm:text-4xl">Product Recommender</h1>
              <p className="text-xs text-ink/60 sm:text-sm">Find eco friendly alternatives to your favorite products</p>
            </div>
          </header>

          
            <section className="relative flex flex-col rounded-[2rem] bg-white p-10 shadow-xl shadow-black/5">
              <div className="flex flex-col gap-3">
                <p className="text-xs uppercase tracking-[0.3em] text-leaf-700">Log a product</p>
                <h2 className="text-5xl font-serif text-ink sm:text-10xl">What do you use?</h2>
                <p className="max-w-3xl text-sm text-ink/70 sm:text-base">
                  Describe your product and we’ll suggest you an eco friendly alternative.
                </p>
              </div>

              <div className="mt-2 flex flex-col gap-2">
                <textarea
                  className="min-h-[120px] w-full resize-none rounded-[1.5rem] bg-transparent py-6 text-2xl text-ink placeholder:text-ink/30 focus:outline-none focus:ring-0"
                  placeholder="Try something like 'Plastic water bottle'"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                />

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={recommendProduct}
                    className="text-center bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-full shadow-lg cursor-pointer transition duration-300 ease-in-out transform hover:scale-105"
                  >
                      Go!
                  </button>
                  {gettingRec && <p>Getting recommendation...</p>}
                </div>

                {productRec && (
                  <div className="mt-6 w-full bg-white p-6 border-2 border-green-700 rounded-lg shadow-2xl space-y-3">
                    <h3 className="text-2xl font-bold text-green-700">Recommendation</h3>
                    <p><span className="font-semibold">Original Product:</span> {productRec.original_product}</p>
                    <p><span className="font-semibold">Eco Alternative:</span> {productRec.eco_alternative}</p>
                    <p><span className="font-semibold">Reason:</span> {productRec.reason}</p>
                  </div>
                )}

                {error && <p className="text-red-600 mt-4">{error}</p>}
              </div>
            </section>

        </div>
      </div>
    </div>
  );


};

export default EcofriendlyRecommendations;
