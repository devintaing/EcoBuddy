import React from "react";
import { useNavigate } from "react-router-dom";

const CompostAI = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-4xl font-bold">Compostability Analysis</h1>
      <h2 className="text-2xl font-bold">Analyze the compostability of an item.</h2>
      <button onClick={() => navigate('/home')}>
        Back to Home
      </button>
    </div>
  );
};

export default CompostAI;