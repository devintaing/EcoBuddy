import React from 'react';
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-4xl font-bold">Settings</h1>
      <button onClick={() => navigate('/home')}>
        Back to Home
      </button>
    </div>
  );
};

export default Settings;
