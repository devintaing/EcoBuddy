import React from 'react';
import { useNavigate } from "react-router-dom";

const ActionLog = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-4xl font-bold">Action Log</h1>
      <h2 className="text-2xl font-bold">Find out the impact of an action you took.</h2>
      <button onClick={() => navigate('/home')}>
        Back to Home
      </button>
    </div>
  );
};

export default ActionLog;
