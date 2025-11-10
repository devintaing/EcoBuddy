import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from 'firebase/auth'
import { auth } from '../firebaseConfig.js'

const LeafLogo = ({ className = 'h-12 w-12 text-leaf-600' }) => (
  <svg
    role="img"
    aria-label="EcoBuddy logo"
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M14 50c14 4 24 2 34-8 10-10 12-20 8-34-14-4-24-2-34 8C12 26 10 36 14 50Z" fill="#2E7D32" />
    <path d="M20 44c10 2 18-1 24-7s9-14 7-24" stroke="#FAFDF7" strokeWidth="4" strokeLinecap="round" />
  </svg>
)

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.warn('Sign out failed', err)
    } finally {
      navigate('/')
    }
  }

  return (
    <nav className="w-full bg-gray-50 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <LeafLogo className="h-10 w-10 text-leaf-600" />
          <span className="font-semibold text-lg text-gray-800 tracking-tight">
            EcoBuddy
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/home")}
            className="text-gray-700 hover:text-green-700 transition font-medium"
          >
            Home
          </button>
          
          <button
            onClick={() => navigate("/settings")}
            className="text-gray-700 hover:text-green-700 transition font-medium"
          >
            Settings
          </button>
        </div>

        <div className="ml-[5%]">
          <button
            onClick={handleLogout}
            className="self-start rounded-full border border-line bg-white px-4 py-2 text-sm 
              font-medium text-ink/70 transition-all hover:border-leaf-600 hover:bg-leaf-600/10 
              hover:text-leaf-700 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none 
              focus-visible:ring-4 focus-visible:ring-leaf-300/60 active:translate-y-0 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
