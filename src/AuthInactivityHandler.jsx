import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { auth } from './firebaseConfig'
import { signOut } from 'firebase/auth'

const INACTIVITY_TIMEOUT = 60 * 5 * 1000 // sign out the user after 5 minutes of inactivity

export default function AuthInactivityHandler() {
  const timerRef = useRef(null)
  const navigate = useNavigate();
  const location = useLocation()

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    const startTimer = () => {
      clearTimer()
      timerRef.current = setTimeout(async () => {
        try {
          if (auth && auth.currentUser) {
            await signOut(auth)
            try {
              if ((location?.pathname !== '/login') && (location?.pathname !== '/')) {
              navigate('/login')
              }
              console.log('Signed out user due to inactivity')
            } catch (navErr) {
              console.error('Navigation error after inactivity sign-out', navErr)
            }
          }
        } catch (err) {
          console.error('Error signing out after inactivity', err)
        }
      }, INACTIVITY_TIMEOUT)
    }

    const resetTimer = () => startTimer()

    // start the inactivity timer
    startTimer()

    events.forEach((ev) => window.addEventListener(ev, resetTimer))

    const handleVisibility = () => {
      // if the user returns to the tab, reset the timer
      if (!document.hidden) resetTimer()
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearTimer()
      events.forEach((ev) => window.removeEventListener(ev, resetTimer))
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return null
}
