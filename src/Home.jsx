import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, db } from './firebaseConfig.js'
import { collection, getDocs, getCountFromServer, onSnapshot, query, orderBy, limit, doc, runTransaction } from 'firebase/firestore'

const featureCards = [
  {
    title: 'AI Photo Analysis',
    description: 'Upload a photo or item and get fast guidance on how to recycle or compost it responsibly.',
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

const metrics = [
  { label: 'Current streak', value: 'No streak yet' },
  { label: 'Total points', value: '0 pts logged' },
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
  const [recentActions, setRecentActions] = useState([])
  const [recentLoading, setRecentLoading] = useState(true)
  const [totalPoints, setTotalPoints] = useState(0)
  const [loadingTotalPoints, setLoadingTotalPoints] = useState(true)
  const [totalCO2, setTotalCO2] = useState(0)
  const [loadingTotalCO2, setLoadingTotalCO2] = useState(true)
  const [streak, setStreak] = useState(0)
  const [loadingStreak, setLoadingStreak] = useState(true)

  // map each action type to an emoji (WIP)
  const getActionEmoji = () => '🍃'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoadingCount(true)
      setCountError(null)
      setCount(null)
      setUserName(currentUser?.displayName || currentUser?.email?.split('@')[0] || 'EcoBuddy friend')

      if (!currentUser) {
        setLoadingCount(false)
        setRecentActions([])
        setRecentLoading(false)
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

      try {
        setLoadingTotalPoints(true)
        const userRef = doc(db, 'users', currentUser.uid)
        const userUnsub = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() || {}
            setTotalPoints(data.totalPoints ?? 0)
            setTotalCO2(data.totalCO2Saved ?? 0)
            setStreak(data.streak ?? 0)
          } else {
            setTotalPoints(0)
            setTotalCO2(0)
            setStreak(0)
          }
          setLoadingTotalPoints(false)
          setLoadingTotalCO2(false)
          setLoadingStreak(false)
        }, (err) => {
          console.error('User doc listener error', err)
          setLoadingTotalPoints(false)
          setLoadingTotalCO2(false)
          setLoadingStreak(false)
        })

        unsubscribe._userUnsub = userUnsub
        // update the user's streak on login if needed
        try {
          await runTransaction(db, async (transaction) => {
            const uSnap = await transaction.get(userRef)
            if (!uSnap.exists()) return
            const data = uSnap.data() || {}
            const prevLast = data.lastUpdated
            const prevStreak = data.streak || 0

            if (!prevLast || typeof prevLast.toDate !== 'function') return

            const lastDate = prevLast.toDate()
            const nowDate = new Date()
            const utcLast = Date.UTC(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate())
            const utcNow = Date.UTC(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate())
            const daysDiff = Math.floor((utcNow - utcLast) / (24 * 60 * 60 * 1000))

            if (daysDiff > 1 && prevStreak !== 0) {
              transaction.update(userRef, { streak: 0 })
            }
          })
        } catch (err) {
          console.warn('Failed to validate/reset streak on login', err)
        }
      } catch (err) {
        console.error('Failed to attach user doc listener', err)
        setLoadingTotalPoints(false)
      }

      try {
        setRecentLoading(true)
        const activitiesRef = collection(db, 'users', currentUser.uid, 'activities')
        const q = query(activitiesRef, orderBy('CreatedAt', 'desc'), limit(3))
        const snapUnsub = onSnapshot(q, (snap) => {
          const items = snap.docs.map((d) => {
            const data = d.data() || {}
            const ts = data.CreatedAt && typeof data.CreatedAt.toDate === 'function' ? data.CreatedAt.toDate() : (data.CreatedAt instanceof Date ? data.CreatedAt : null)
            const time = ts ? ts.toLocaleString() : ''
            const pts = (data.Points)
            const impactLabel = pts != null && pts !== '' ? `+${pts} pts` : ''
            return {
              id: d.id,
              title: data.Action || 'Action',
              time,
              impact: impactLabel,
              metadata: data.metadata || {},
              actionType: (data.ActionType ?? '')
            }
          })
          setRecentActions(items)
          setRecentLoading(false)
        }, (err) => {
          console.error('Recent actions listener error', err)
          setRecentActions([])
          setRecentLoading(false)
        })

        unsubscribe._snapUnsub = snapUnsub
      } catch (err) {
        console.error('Failed to attach recent actions listener', err)
        setRecentActions([])
        setRecentLoading(false)
      }
    })

    return () => {
      if (unsubscribe && typeof unsubscribe._snapUnsub === 'function') {
        try { unsubscribe._snapUnsub() } catch (e) {}
      }
      if (unsubscribe && typeof unsubscribe._userUnsub === 'function') {
        try { unsubscribe._userUnsub() } catch (e) {}
      }
      unsubscribe()
    }
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
        <section className="rounded-3xl bg-gradient-to-r from-fern-300/50 via-white to-leaf-600/10 px-6 py-12 shadow-xl shadow-black/5 backdrop-blur-sm sm:px-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-leaf-700">
                <LeafLogo className="h-12 w-12" />
                <span className="text-sm font-semibold uppercase tracking-[0.25em]">EcoBuddy</span>
              </div>
              <p className="text-xs uppercase tracking-[0.25em] text-leaf-700">Today&apos;s impact</p>
              <h1 className="text-4xl font-serif text-ink sm:text-5xl">Welcome back, {userName}</h1>
              <p className="max-w-2xl text-ink/75">
                  {loadingCount ? (
                    'Loading your eco-actions...'
                  ) : countError ? (
                    `Unable to load action count (${countError.message}).`
                  ) : (
                    (() => {
                      const n = count ?? 0
                      const action = n === 1 ? 'action' : 'actions'
                      return `You have logged ${n} ${action} so far.${n > 0 ? ' Keep it up!' : ''}`
                    })()
                  )}
              </p>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={handleNavigate('/settings')} className="inline-flex items-center justify-center rounded-full border border-line bg-white px-5 py-2 text-sm font-medium text-ink/80 transition-all hover:border-leaf-600 hover:bg-leaf-50 hover:text-leaf-700 hover:shadow-md cursor-pointer">
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
                className="group flex flex-col rounded-3xl bg-white p-6 shadow-sm shadow-black/5 transition hover:-translate-y-2 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {card.icon}
                  </span>
                  <h3 className="text-xl font-semibold text-ink">{card.title}</h3>
                </div>
                <p className="mt-3 flex-1 text-sm text-ink/70">{card.description}</p>
                <div className="mt-6 flex">
                  <button
                    type="button"
                    onClick={handleNavigate(card.path)}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-ivory px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-leaf-200 hover:bg-fern-300/30 hover:text-leaf-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300/60 cursor-pointer"
                  >
                    Go →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="space-y-4">
          <h2 className="mb-4 font-serif text-2xl text-ink">Your Progress</h2>
            <p className="text-sm text-ink/70">Log an action to unlock streaks, weekly points, and CO₂ insights.</p>
            <div className="grid gap-6 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm shadow-black/5">
                  <p className="text-xs uppercase tracking-[0.2em] text-leaf-700 opacity-70">{metric.label}</p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-serif text-4xl text-ink">
                      {metric.label === 'Total points' ? (
                        loadingTotalPoints ? '—' : totalPoints ?? 0
                      ) : metric.label === 'CO₂ saved' ? (
                        loadingTotalCO2 ? '—' : Number(totalCO2 ?? 0).toFixed(1)
                      ) : metric.label === 'Current streak' ? (
                        loadingStreak ? '—' : streak ?? 0
                      ) : (
                        metric.value
                      )}
                    </span>
                    <span className="text-sm font-medium text-ink/40">
                      {metric.label === 'Total points' ? 'pts' : metric.label === 'CO₂ saved' ? 'lbs' : metric.label === 'Current streak' ? 'days' : ''}
                    </span>
                  </div>
                  <div className="pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-fern-50" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-ink">Recent Eco-Actions</h2>
            </div>
            <ul className="mt-6 divide-y divide-gray-100">
              {recentLoading ? (
                <li className="rounded-2xl border border-dashed border-line bg-white/70 p-6 text-center text-sm text-ink/70">Loading recent actions…</li>
              ) : recentActions.length === 0 ? (
                <li className="rounded-2xl border border-dashed border-line bg-white/70 p-6 text-center text-sm text-ink/70">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl" aria-hidden="true">🌱</span>
                    <p className="font-semibold text-ink">No actions logged yet</p>
                    <p className="text-xs text-ink/60">Start with your first eco-action to see your streak grow.</p>
                  </div>
                </li>
              ) : (
                recentActions.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center gap-4 bg-white/80 p-4 transition hover:bg-ivory/80"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ivory text-2xl">
                      <span aria-hidden="true">{getActionEmoji(entry.actionType)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-ink">{entry.title}</p>
                      <p className="text-xs uppercase tracking-[0.1em] text-ink/60">{entry.time}</p>
                    </div>
                    <span className="rounded-full bg-fern-300/30 px-3 py-1 text-xs font-semibold text-ink">{entry.impact}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl bg-gradient-to-br from-fern-300/40 via-white to-leaf-50 p-6 text-ink shadow-lg shadow-black/5">
              <p className="text-xs uppercase tracking-[0.3em] text-leaf-700">Ask Recycle AI</p>
              <h3 className="mt-3 text-2xl font-serif">Need to check an item?</h3>
              <p className="mt-2 text-m text-ink/80">Snap, upload, and get advice tailored just for you.</p>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-stone-50 via-white to-compost-400/30 p-6 text-ink shadow-lg shadow-black/5">
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
