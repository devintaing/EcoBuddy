import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useAuthListener } from "./hooks/useAuthListener";
import Navbar from './components/Navbar';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const EcofriendlyRecommendations = () => {
  const { user, userDoc, loading, error } = useAuthListener();
  const navigate = useNavigate();
  const [gettingRec, setGettingRec] = useState(false);

  const [product, setProduct] = useState("");
  const [productRec, setProductRec] = useState("");

  const recommendProduct = async() => {
    const ai = new GoogleGenAI({apiKey: apiKey}); 
    setGettingRec(true);

    const contents = [
      { text: `Name an eco friendly alternative to ${product}
      Explain how this is more eco friendly.` },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    console.log(response);
    // a reponse has a candidates array.
    // each item in candidates has a hash called content, and content is a hash too
    // inside of content is an array of parts. parts is a hash
    setProductRec(response.candidates[0].content.parts[0].text);
    setGettingRec(false);
  }

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

          <div className="grid min-h-[70vh] gap-5 overflow-hidden lg:h-[calc(100vh-150px)] lg:grid-cols-[1.7fr_1fr]">
            <section className="relative flex flex-col rounded-[2rem] bg-white p-10 shadow-xl shadow-black/5">
              <div className="flex flex-col gap-3">
                <p className="text-xs uppercase tracking-[0.3em] text-leaf-700">Log a product</p>
                <h2 className="text-5xl font-serif text-ink sm:text-6xl">What do you use?</h2>
                <p className="max-w-3xl text-sm text-ink/70 sm:text-base">
                  Describe your product and we’ll suggest you an eco friendly alternative.
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-4">
                <textarea
                  className="min-h-[220px] w-full resize-none rounded-[1.5rem] bg-transparent px-6 py-6 text-3xl text-ink placeholder:text-ink/30 focus:outline-none focus:ring-0"
                  placeholder="Try something like an airplane ticket"
                  onChange={(e) => setProduct(e.target.value)}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => recommendProduct()}
                    className="inline-flex items-center justify-center rounded-full bg-[#58B27C] px-7 py-3 text-base font-semibold text-white shadow-lg shadow-black/10 transition-all hover:bg-[#4AA46E] hover:shadow-xl active:translate-y-px focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"  
                  >
                      Go!
                  </button>
                  {gettingRec && <p>Getting recommendation...</p>}
                  {!gettingRec && <p>{productRec}</p>}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );


};

export default EcofriendlyRecommendations;
