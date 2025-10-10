import { useEffect, useId, useMemo, useState } from 'react'

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#impact', label: 'Impact' },
]

const featureCards = [
  {
    title: 'Log eco-actions',
    description:
      'Track your daily wins with one-tap logging, streak goals, and a friendly points table that keeps momentum going.',
    icon: (
      <svg
        aria-hidden="true"
        className="h-10 w-10 text-leaf-600"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path d="M12 3v18" />
        <path d="M6 12h12" />
        <path d="M5 7h14" />
        <path d="M5 17h14" />
      </svg>
    ),
  },
  {
    title: 'Check recyclability & compostability',
    description:
      'Snap a photo or follow the item wizard to learn how to recycle or compost responsibly, tailored to local rules.',
    icon: (
      <svg
        aria-hidden="true"
        className="h-10 w-10 text-leaf-600"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path d="M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
        <path d="M12 9v6" />
        <path d="M9 12h6" />
      </svg>
    ),
  },
  {
    title: 'Track impact & streaks',
    description:
      'See weekly points, unlock badges, and opt into leaderboards that keep your community energized.',
    icon: (
      <svg
        aria-hidden="true"
        className="h-10 w-10 text-leaf-600"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path d="M7 21V10" />
        <path d="M12 21V3" />
        <path d="M17 21v-6" />
      </svg>
    ),
  },
]

const howItWorksSteps = [
  {
    title: 'Log an action',
    description:
      'Tap a habit card to log recycling, biking, or any eco-action. Extra kudos for streaks and verified photos.',
  },
  {
    title: 'Check an item',
    description:
      'Scan or search household items to learn whether they should be recycled, composted, or tossed.',
  },
  {
    title: 'See your weekly impact',
    description:
      'View a digest of points, CO₂ saved, and streak milestones. Opt into challenges with neighbors or friends.',
  },
]

const leaderboardRows = [
  { name: 'Lena K.', points: 128 },
  { name: 'Avery S.', points: 119 },
  { name: 'You', points: 114, highlight: true },
  { name: 'Jordan P.', points: 110 },
  { name: 'Mika R.', points: 106 },
  { name: 'Samira D.', points: 101 },
  { name: 'Noah V.', points: 96 },
  { name: 'Eliora G.', points: 90 },
  { name: 'Kai M.', points: 84 },
  { name: 'Rowan T.', points: 78 },
]

const buttonStyles = {
  primary:
    'inline-flex items-center justify-center rounded-full border border-leaf-600 bg-leaf-600 font-medium text-white shadow transition hover:bg-leaf-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  outline:
    'inline-flex items-center justify-center rounded-full border border-leaf-600 font-medium text-leaf-700 transition hover:bg-leaf-600/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory',
}

function App() {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false)
      }
    }

    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeydown)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-ivory">
      <a
        href="#main"
        className="fixed left-4 top-4 z-[60] -translate-y-14 rounded-full bg-leaf-600 px-4 py-2 text-sm font-medium text-white shadow-lg focus:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300"
      >
        Skip to content
      </a>
      <Header isMobileOpen={mobileOpen} onToggleMobile={() => setMobileOpen((open) => !open)} onNavigate={() => setMobileOpen(false)} />
      <main id="main" className="space-y-24 pb-24 md:space-y-28 lg:space-y-32">
        <Hero />
        <Features />
        <HowItWorks />
        <Impact />
      </main>
      <Footer />
    </div>
  )
}

function Header({ isMobileOpen, onToggleMobile, onNavigate }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all ${scrolled ? 'border-line/80 bg-ivory/95 shadow-sm backdrop-blur-md' : 'border-transparent bg-ivory/80 backdrop-blur-sm'}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <LeafLogo className="h-10 w-10 text-leaf-600" />
          <span className="text-xl font-semibold text-ink sm:text-2xl">EcoBuddy</span>
        </div>
        <nav aria-label="Main" className="hidden items-center gap-10 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className="text-sm font-medium text-ink/80 transition hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300/50"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="mailto:hello@ecobuddy.app"
            className={`${buttonStyles.outline} px-5 py-2 text-sm`}
          >
            Contact
          </a>
          <a
            href="#features"
            className={`${buttonStyles.outline} px-5 py-2 text-sm`}
          >
            Explore features
          </a>
        </div>
        <div className="lg:hidden">
          <button
            type="button"
            onClick={onToggleMobile}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-menu"
            className="inline-flex items-center justify-center rounded-full border border-line bg-white/80 p-2 text-ink shadow-sm transition hover:border-leaf-600 hover:text-leaf-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300"
          >
            <span className="sr-only">Toggle navigation</span>
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              {isMobileOpen ? (
                <path d="M6 18 18 6M6 6l12 12" />
              ) : (
                <>
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
      <MobileMenu isOpen={isMobileOpen} onNavigate={onNavigate} />
    </header>
  )
}

function MobileMenu({ isOpen, onNavigate }) {
  return (
    <div
      id="mobile-menu"
      className={`lg:hidden ${isOpen ? 'block' : 'hidden'}`}
    >
      <div className="space-y-4 border-t border-line bg-ivory/95 px-4 pb-6 pt-4 shadow-md backdrop-blur-md motion-safe:animate-slide-down sm:px-6">
        <nav aria-label="Mobile primary" className="flex flex-col gap-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink/90 transition hover:bg-leaf-600/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300/60"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-3">
          <a
            href="mailto:hello@ecobuddy.app"
            onClick={onNavigate}
            className={`${buttonStyles.outline} px-4 py-2 text-sm`}
          >
            Contact
          </a>
          <a
            href="#features"
            onClick={onNavigate}
            className={`${buttonStyles.outline} px-4 py-2 text-sm`}
          >
            Explore features
          </a>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-16">
      <div className="grid gap-12 lg:grid-cols-[55%_45%] lg:items-center lg:gap-16">
        <div className="space-y-8 motion-safe:animate-fade-in">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf-700">Small actions, big change.</p>
            <h1 className="text-4xl font-serif tracking-tight text-ink sm:text-5xl md:text-6xl">
              Log eco-actions. Check recyclables. See your impact.
            </h1>
            <p className="max-w-xl text-lg text-ink/80">
              EcoBuddy helps you build planet-positive habits with quick logging, smart guidance on what goes where, and delightful insights that keep you inspired.
            </p>
          </div>
          <div id="signup-card" className="max-w-md">
            <EmailCapture />
          </div>
          <dl className="flex flex-wrap gap-4 text-sm text-ink/70">
            <div className="flex items-center gap-2 rounded-full border border-line bg-white/60 px-4 py-2 shadow-sm">
              <span aria-hidden="true">🌱</span>
              <dt className="font-medium">Free to try</dt>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-line bg-white/60 px-4 py-2 shadow-sm">
              <span aria-hidden="true">🔒</span>
              <dt className="font-medium">Privacy first</dt>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-line bg-white/60 px-4 py-2 shadow-sm">
              <span aria-hidden="true">🛠️</span>
              <dt className="font-medium">Open-source soon</dt>
            </div>
          </dl>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-line/60 bg-hero-gradient shadow-xl motion-safe:animate-fade-in">
          <div className="absolute inset-0 opacity-20 mix-blend-multiply">
            <svg
              aria-hidden="true"
              className="h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="leaf-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path
                    d="M40 10c10 8 16 16 18 24-8-4-16-2-22 4-6 6-8 14-4 22-8-2-16-8-24-18 4-12 12-20 32-32Z"
                    fill="#2E7D32"
                    opacity="0.3"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#leaf-pattern)" />
            </svg>
          </div>
          <div className="relative p-6 sm:p-10">
            <figure className="space-y-6">
              <div className="rounded-3xl border border-line/70 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
                <figcaption className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-leaf-700">Weekly overview</figcaption>
                <ul className="space-y-4 text-sm text-ink/80">
                  <li className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-ink">Bike commute</p>
                      <p className="text-xs text-ink/60">Saved 7.4 lbs CO₂e • streak +3</p>
                    </div>
                    <span className="rounded-full bg-fern-300/40 px-3 py-1 text-xs font-semibold text-ink">+24 pts</span>
                  </li>
                  <li className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-ink">Food scraps composted</p>
                      <p className="text-xs text-ink/60">Drop-off Tuesday • verified photo</p>
                    </div>
                    <span className="rounded-full bg-sky-300/30 px-3 py-1 text-xs font-semibold text-ink">+18 pts</span>
                  </li>
                  <li className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-ink">Plastic container</p>
                      <p className="text-xs text-ink/60">Recyclable • rinse + dry</p>
                    </div>
                    <span className="rounded-full bg-compost-400/30 px-3 py-1 text-xs font-semibold text-ink">+12 pts</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-3xl border border-line/70 bg-white/85 p-6 shadow-lg backdrop-blur-sm">
                <h3 className="mb-4 font-serif text-2xl text-ink">Impact snapshot</h3>
                <dl className="grid grid-cols-2 gap-4 text-sm text-ink/80">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.2em] text-ink/60">CO₂ saved</dt>
                    <dd className="text-xl font-semibold text-ink">42.3 lbs</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.2em] text-ink/60">Waste diverted</dt>
                    <dd className="text-xl font-semibold text-ink">18 items</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.2em] text-ink/60">Community rank</dt>
                    <dd className="text-xl font-semibold text-ink">Top 10%</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.2em] text-ink/60">Streak</dt>
                    <dd className="text-xl font-semibold text-ink">27 days</dd>
                  </div>
                </dl>
              </div>
            </figure>
          </div>
          <LeafSquiggle className="pointer-events-none absolute -left-8 top-10 h-24 w-24 text-leaf-600/40" />
          <LeafSquiggle className="pointer-events-none absolute bottom-12 -right-6 h-20 w-20 rotate-45 text-sky-300/50" />
          <LeafSquiggle className="pointer-events-none absolute bottom-4 left-1/3 h-16 w-16 -rotate-12 text-fern-300/50" />
        </div>
      </div>
    </section>
  )
}

function EmailCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const emailId = useId()
  const messageId = `${emailId}-message`
  const consentId = `${emailId}-consent`

  const consentCopy =
    'Create your free EcoBuddy account. No fees, and you can unsubscribe anytime.'

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!email.trim()) {
      setStatus('error')
      setMessage('Please add an email to get started with EcoBuddy.')
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email.trim())) {
      setStatus('error')
      setMessage('That email looks off. Try again?')
      return
    }

    setStatus('loading')
    setMessage('')

    await new Promise((resolve) => setTimeout(resolve, 1200))

    setStatus('success')
    setMessage("You're all set! Check your inbox for EcoBuddy tips.")
    setEmail('')
  }

  const buttonClasses = `${buttonStyles.primary} w-full px-5 py-3 text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-70`
  const describedBy = [consentId, message ? messageId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className="rounded-3xl border border-line bg-white/80 p-6 shadow-lg backdrop-blur-sm">
      <div className="mb-4 flex flex-col gap-3">
        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink shadow hover:border-leaf-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300 sm:justify-start"
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5 text-ink/70"
            viewBox="0 0 533.5 544.3"
          >
            <path
              d="M533.5 278.4c0-18.4-1.5-36.8-4.7-54.8H272v103.7h147.3c-6.4 35-26.2 66.1-55.6 86.2v71.6h89.9c52.8-48.6 79.9-120.3 79.9-206.7Z"
              fill="#4285F4"
            />
            <path
              d="M272 544.3c74.7 0 137.5-24.7 183.4-67.3l-89.9-71.6c-25.6 17.3-58.4 27.4-93.5 27.4-71.8 0-132.7-48.5-154.5-113.5H22.2v71.8C70.5 482.5 163 544.3 272 544.3Z"
              fill="#34A853"
            />
            <path
              d="M117.5 319.3c-10.2-30-10.2-62.3 0-92.3V155.2H22.2c-44.1 88.1-44.1 192.7 0 280.8l95.3-71.6Z"
              fill="#FBBC04"
            />
            <path
              d="M272 107.7c38.6-.6 75.4 13.6 103.4 39.6l77.1-77.1C401 26.9 337.4 0 272 0 163 0 70.5 61.8 22.2 155.2l95.3 71.8C139.3 156.2 200.2 107.7 272 107.7Z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>
        <div className="flex items-center gap-3 text-xs text-ink/50">
          <span className="h-px flex-1 bg-line" />
          or sign up with email
          <span className="h-px flex-1 bg-line" />
        </div>
      </div>
      <form className="space-y-3" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label className="text-sm font-medium text-ink" htmlFor={emailId}>
            Work or personal email
          </label>
          <input
            id={emailId}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-describedby={describedBy}
            className="w-full rounded-full border border-line bg-white/90 px-4 py-3 text-sm text-ink shadow-inner placeholder:text-ink/40 focus:border-leaf-600 "
            placeholder="you@example.com"
          />
        </div>
        <button type="submit" className={buttonClasses} disabled={status === 'loading'}>
          {status === 'loading' ? 'Signing up...' : 'Create my account'}
        </button>
        <p id={consentId} className="text-xs text-ink/50">
          {consentCopy}
        </p>
        <p
          id={messageId}
          role="status"
          aria-live="polite"
          className={`text-sm ${status === 'error' ? 'text-leaf-700' : 'text-ink/60'}`}
        >
          {message}
        </p>
      </form>
    </div>
  )
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-serif text-ink sm:text-4xl">What you can do with EcoBuddy</h2>
        <p className="mt-3 text-base text-ink/70">
          Designed for neighborhood heroes, recycling pros, and curious beginners alike.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featureCards.map((card) => (
          <article
            key={card.title}
            className="rounded-3xl border border-line bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl focus-within:-translate-y-1 focus-within:shadow-xl"
          >
            <div className="flex items-center justify-center rounded-2xl bg-fern-300/30 p-3">
              {card.icon}
            </div>
            <h3 className="mt-6 text-xl font-semibold text-ink">{card.title}</h3>
            <p className="mt-2 text-sm text-ink/70">{card.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-serif text-ink sm:text-4xl">How it works</h2>
        <p className="mt-3 text-base text-ink/70">
          Track your wins with a simple rhythm—log, check, reflect. Nothing distracting, just momentum.
        </p>
      </div>
      <ol className="mt-12 grid gap-8 md:grid-cols-3">
        {howItWorksSteps.map((step, index) => (
          <li key={step.title} className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-leaf-600 text-lg font-semibold text-white shadow-lg">
                {index + 1}
              </span>
              <h3 className="text-xl font-semibold text-ink">{step.title}</h3>
            </div>
            <div className="rounded-2xl border border-line bg-white p-5 shadow-md">
              <div className="rounded-2xl border border-line/60 bg-ivory p-6 text-center shadow-inner">
                <p className="text-sm font-medium text-ink/80">
                  {index === 0 && 'Tap “Bike commute” → earn 24 pts & streak +1'}
                  {index === 1 && 'Scan barcode • Get “Rinse & recycle” guidance in seconds'}
                  {index === 2 && 'Weekly digest: 42.3 lbs CO₂ saved • Streak day 27'}
                </p>
              </div>
            </div>
            <p className="text-sm text-ink/70">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Impact() {
  const rows = useMemo(() => leaderboardRows, [])

  return (
    <section id="impact" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-serif text-ink sm:text-4xl">Impact you can see</h2>
          <p className="text-base text-ink/70">
            Watch your footprint shrink in real time. EcoBuddy highlights CO₂ saved, waste diverted, and how you rank against friends or neighbors.
          </p>
          <ul className="space-y-3 text-sm text-ink/80">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-leaf-600" aria-hidden="true" />
              Weekly digests track streaks, badges, and your top actions.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-leaf-600" aria-hidden="true" />
              Opt in to leaderboards that fit your vibe—friends, office, or local co-op.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-leaf-600" aria-hidden="true" />
              Export-ready summaries share your progress with climate pledges.
            </li>
          </ul>
        </div>
        <div className="rounded-3xl border border-line bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-2xl text-ink">Community leaderboard</h3>
            <span className="rounded-full bg-fern-300/50 px-3 py-1 text-xs font-semibold text-ink">Week 32</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-line">
            <table className="min-w-full divide-y divide-line text-left text-sm">
              <caption className="sr-only">Weekly EcoBuddy leaderboard</caption>
              <thead className="bg-ivory text-xs uppercase tracking-[0.2em] text-ink/60">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Rank
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Member
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {rows.map((row, index) => (
                  <tr
                    key={row.name}
                    className={`${row.highlight ? 'bg-fern-300/30 font-semibold text-ink' : 'text-ink/80'} focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300`}
                    tabIndex={0}
                  >
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3 text-right">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-white/80">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 text-center sm:flex-row sm:text-left sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <div className="flex items-center gap-3">
            <LeafLogo className="h-8 w-8 text-leaf-600" />
            <span className="text-lg font-semibold text-ink">EcoBuddy</span>
          </div>
          <p className="max-w-md text-sm text-ink/70">
            Small actions, big impact. EcoBuddy keeps greener habits simple, joyful, and measurable.
          </p>
        </div>
        <div className="flex gap-3">
          <SocialLink label="Instagram" />
          <SocialLink label="LinkedIn" />
          <SocialLink label="GitHub" />
        </div>
      </div>
      <div className="border-t border-line bg-white/70 py-4 text-center text-xs text-ink/60">
        © {new Date().getFullYear()} EcoBuddy. Built with care for the planet.
      </div>
    </footer>
  )
}

function SocialLink({ label }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink/70 transition hover:border-leaf-600 hover:text-leaf-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300/60"
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9h.01" />
        <path d="M12 9h.01" />
        <path d="M15 9h.01" />
        <path d="M9 12h6" />
        <path d="M10 15h4" />
      </svg>
    </a>
  )
}

function LeafLogo({ className = 'h-10 w-10 text-leaf-600' }) {
  return (
    <svg
      role="img"
      aria-label="EcoBuddy logo"
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 50c14 4 24 2 34-8 10-10 12-20 8-34-14-4-24-2-34 8C12 26 10 36 14 50Z"
        fill="#2E7D32"
      />
      <path
        d="M20 44c10 2 18-1 24-7s9-14 7-24"
        stroke="#FAFDF7"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LeafSquiggle({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 90c20-20 40-10 60-30s10-40 30-60"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default App
