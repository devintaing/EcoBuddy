import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, db } from './firebaseConfig.js'
import { collection, getDocs, getCountFromServer } from 'firebase/firestore'

const featureCards = [
  {
    title: 'Recycle AI',
    description: 'Upload a photo or item and get fast guidance on how to recycle it responsibly.',
    icon: '♻️',
    path: '/recycle',
  },
  {
    title: 'Compost AI',
    description: 'Check if leftovers or packaging belong in your green bin with quick tips.',
    icon: '🌿',
    path: '/compost',
  },
  {
    title: 'Action Log',
    description: 'Review everything you’ve logged and see how your impact adds up.',
    icon: '📋',
    path: '/action',
  },
  {
    title: 'Leaderboard',
    description: 'Friendly competition with neighbors, coworkers, or friends.',
    icon: '🏅',
    path: '/leaderboard',
  },
]

const timelineEntries = []

const metrics = [
  { label: 'Current streak', value: 'No streak yet' },
  { label: 'Weekly points', value: '0 pts logged' },
  { label: 'CO₂ saved', value: '0 lbs CO₂e' },
]

const buttonStyles = {
  ghost:
    'inline-flex items-center justify-center rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink/80 transition-all hover:border-leaf-600 hover:bg-leaf-600/10 hover:text-leaf-700 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300/60 active:translate-y-0 cursor-pointer',
}

const LeafLogo = ({ className = 'h-10 w-10 text-leaf-600' }) => (
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

const Home = () => {
  const navigate = useNavigate()
  const [count, setCount] = useState(null)
  const [loadingCount, setLoadingCount] = useState(true)
  const [countError, setCountError] = useState(null)
  const [userName, setUserName] = useState('EcoBuddy friend')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoadingCount(true)
      setCountError(null)
      setCount(null)
      setUserName(currentUser?.displayName || currentUser?.email?.split('@')[0] || 'EcoBuddy friend')

      if (!currentUser) {
        setLoadingCount(false)
        return
      }

      try {
        const activitiesRef = collection(db, 'users', currentUser.uid, 'activities')
        if (typeof getCountFromServer === 'function') {
          const aggSnap = await getCountFromServer(activitiesRef)
          setCount(aggSnap.data().count || 0)
        } else {
          const snap = await getDocs(activitiesRef)
          setCount(snap.size || 0)
        }
      } catch (err) {
        console.error('Failed to fetch activity count', err)
        setCountError(err)
      } finally {
        setLoadingCount(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const cards = useMemo(() => featureCards, [])

  const handleNavigate = (path) => () => navigate(path)

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
    <div className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-line bg-white/80 px-6 py-10 shadow-lg backdrop-blur-sm sm:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <LeafLogo className="h-12 w-12 text-leaf-600" />
                <span className="text-2xl font-semibold text-ink">EcoBuddy</span>
              </div>
              <p className="text-sm uppercase tracking-[0.2em] text-leaf-700">Today&apos;s impact</p>
              <h1 className="text-4xl font-serif text-ink sm:text-5xl">Welcome back, {userName}</h1>
              <p className="max-w-2xl text-ink/75">
                {loadingCount
                  ? 'Loading your eco-actions...'
                  : countError
                    ? `Demo data: Unable to load action count (${countError.message}).`
                    : `Demo data: You have logged ${count ?? 0} actions so far. Keep the streak going!`}
              </p>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={handleNavigate('/settings')} className={buttonStyles.ghost}>
                  Settings
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="self-start rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink/70 transition-all hover:border-leaf-600 hover:bg-leaf-600/10 hover:text-leaf-700 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300/60 active:translate-y-0 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </section>

        <section className="mt-12">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <article
                key={card.title}
                className="group flex flex-col rounded-3xl border border-line bg-white/80 p-6 shadow-md backdrop-blur-sm transition hover:-translate-y-1 hover:border-leaf-600/60 hover:shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {card.icon}
                  </span>
                  <h3 className="text-xl font-semibold text-ink">{card.title}</h3>
                </div>
                <p className="mt-3 flex-1 text-sm text-ink/70">{card.description}</p>
                <button
                  type="button"
                  onClick={handleNavigate(card.path)}
                  className="mt-6 self-start inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-medium text-ink/80 transition-all hover:border-leaf-600 hover:bg-leaf-600/10 hover:text-leaf-700 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300/60 active:translate-y-0 cursor-pointer"
                >
                  Go
                  <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-line bg-white/80 p-6 shadow-md backdrop-blur-sm">
          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-ink">Your progress</h2>
            <p className="text-sm text-ink/70">Log an action to unlock streaks, weekly points, and CO₂ insights.</p>
            <div className="flex flex-wrap gap-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-line bg-white px-4 py-3 text-left shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/50">{metric.label}</p>
                  <p className="mt-1 text-sm font-semibold text-leaf-700">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div className="rounded-3xl border border-line bg-white/90 p-6 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-ink">Recent eco-actions</h2>
              <span className="rounded-full bg-fern-300/40 px-3 py-1 text-xs font-semibold text-ink">Demo data</span>
            </div>
            <ul className="mt-6 space-y-4">
              {timelineEntries.length === 0 ? (
                <li className="rounded-2xl border border-dashed border-line bg-white/70 p-6 text-center text-sm text-ink/70">
                  No actions logged yet. Log your first eco-action to see it appear here.
                </li>
              ) : (
                timelineEntries.map((entry) => (
                  <li key={entry.title} className="flex items-center gap-4 rounded-2xl border border-line bg-white/80 p-4 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ivory text-2xl">
                      <span aria-hidden="true">{entry.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-ink">{entry.title}</p>
                      <p className="text-sm text-ink/60">{entry.time}</p>
                    </div>
                    <span className="rounded-full bg-fern-300/30 px-3 py-1 text-xs font-semibold text-ink">{entry.impact}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl border border-line bg-hero-gradient p-6 text-ink shadow-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-leaf-700">Ask Recycle AI</p>
              <h3 className="mt-3 text-2xl font-serif">Need to check an item?</h3>
              <p className="mt-2 text-m text-ink/80">Snap, upload, and get advice tailored just for you.</p>
            </div>
            <div className="rounded-3xl border border-line bg-gradient-to-br from-compost-400/80 via-white to-bark-600/20 p-6 text-ink shadow-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-bark-600">Compost tips</p>
              <h3 className="mt-3 text-2xl font-serif">Your leftovers can change the planet.</h3>
              <p className="mt-2 text-m text-ink/80">Save veggie scraps, log drop-offs, and compete with neighbors. Compost AI keeps you in the know.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Home
