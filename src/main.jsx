import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import Login from './Login.jsx'
import RecycleAI from './RecycleAI.jsx';
import Home from './Home.jsx';
import Settings from './Settings.jsx';
import CompostAI from './CompostAI.jsx';
import ActionLog from './ActionLog.jsx';
import Leaderboard from './Leaderboard.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recycle" element={<RecycleAI />} />
        <Route path="/home" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/compost" element={<CompostAI />} />
        <Route path="/action" element={<ActionLog />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  </StrictMode>,
)
