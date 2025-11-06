import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-4xl font-bold">Welcome to EcoBuddy!</h1>
      <h2 className="text-2xl font-bold">What would you like to do?</h2>
      <div className="flex gap-4 mt-4">
        <button onClick={() => navigate('/recycle')}>
          Recyclability Analysis
        </button>

        <button onClick={() => navigate('/compost')}>
          Compostability Analysis
        </button>

        <button onClick={() => navigate('/action')}>
          Action Log
        </button>

        <button onClick={() => navigate('/settings')}>
          Settings
        </button>


      </div>
    </div>
  );
};

export default Home;