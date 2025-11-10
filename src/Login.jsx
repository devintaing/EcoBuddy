import LoginBox from './components/LoginBox'

const highlights = [
  'Track streaks with friendly reminders',
  'Ask Recycle AI what goes where',
  'Share your wins with the community',
  'Log environmentally friendly actions'
]

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

export default function Login() {
  return (
    <div className="min-h-screen bg-ivory">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <a
          href="/"
          className="inline-flex items-center gap-3 self-start rounded-full border border-transparent px-3 py-2 transition hover:border-leaf-600/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300"
        >
          <LeafLogo className="h-10 w-10 text-leaf-600" />
          <span className="text-xl font-semibold sm:text-2xl" style={{ color: '#0B1A13' }}>
            EcoBuddy
          </span>
        </a>
        <div className="grid gap-8 rounded-4xl border border-line bg-white/70 p-6 shadow-2xl backdrop-blur-sm lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-leaf-700">Welcome back</p>
              <h1 className="mt-3 text-3xl font-serif text-ink sm:text-4xl">Sign in </h1>
              <p className="mt-2 text-sm text-ink/70">Log eco-actions, ask AI for quick guidance, and see your impact add up.</p>
            </div>
            <LoginBox redirectTo="/" buttonLabel="Continue" />
          </div>
          <aside className="flex flex-col rounded-3xl border border-line bg-hero-gradient p-6 text-ink shadow-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-leaf-700">Why EcoBuddy</p>
            <h2 className="mt-3 text-2xl font-serif">Small actions, big change.</h2>
            <p className="mt-2 text-sm text-ink/80">Stay inspired with gentle nudges, digestible insights, and community challenges.</p>
            <ul className="mt-4 flex-1 space-y-2.5 text-sm text-ink/80">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/60 px-4 py-3 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-leaf-600" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-xs text-ink/70">
              Want quick access? Use Google sign-in or email/password! No data is shared outside your account.
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
