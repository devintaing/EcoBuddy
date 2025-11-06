import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import Login from './Login.jsx'
import RecycleAI from './RecycleAI.jsx';
import Home from './Home.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recycle" element={<RecycleAI />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  </StrictMode>,
)
