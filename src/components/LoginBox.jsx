import { useId, useState } from 'react'

export default function LoginBox({ redirectTo = '/' , buttonLabel = 'Continue', initialEmail }) {
  const [email, setEmail] = useState(() => {
    if (initialEmail) return initialEmail
    try {
      const params = new URLSearchParams(window.location.search)
      const e = params.get('email')
      return e ? decodeURIComponent(e) : ''
    } catch {
      return ''
    }
  })
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [password, setPassword] = useState('')
  const emailId = useId()
  const passwordId = `${emailId}-password`
  const messageId = `${emailId}-message`
  const consentId = `${emailId}-consent`
  const isLoginPage = window.location.pathname === '/login'

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!email.trim()) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email.trim())) {
      setStatus('error')
      setMessage('That email looks off. Try again?')
      return
    }

    if (isLoginPage && !password.trim()) {
      setStatus('error')
      setMessage('Please enter a password.')
      return
    }

    setStatus('loading')
    setMessage('')

    await new Promise((resolve) => setTimeout(resolve, 900))

    setStatus('redirecting')

    setTimeout(() => {
      try {
        const url = new URL(redirectTo, window.location.origin)
        if (email.trim()) url.searchParams.set('email', email.trim())
        window.location.href = url.toString()
      } catch {
        const sep = redirectTo.includes('?') ? '&' : '?'
        window.location.href = `${redirectTo}${sep}email=${encodeURIComponent(email.trim())}`
      }
    }, 700)
  }

  const buttonClasses =
    'inline-flex w-full items-center justify-center rounded-full border border-leaf-600 bg-[#58B27C] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#4AA46E] hover:shadow-lg active:translate-y-px focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-70'
  const describedBy = [consentId, message ? messageId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className="rounded-3xl border border-line bg-white/80 p-6 shadow-lg backdrop-blur-sm">
      <div className="mb-4 flex flex-col gap-3">
        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink shadow transition hover:border-leaf-600 hover:bg-leaf-600/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300 cursor-pointer"
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5 text-ink/70"
            viewBox="0 0 533.5 544.3"
          >
            <path d="M533.5 278.4c0-18.4-1.5-36.8-4.7-54.8H272v103.7h147.3c-6.4 35-26.2 66.1-55.6 86.2v71.6h89.9c52.8-48.6 79.9-120.3 79.9-206.7Z" fill="#4285F4" />
            <path d="M272 544.3c74.7 0 137.5-24.7 183.4-67.3l-89.9-71.6c-25.6 17.3-58.4 27.4-93.5 27.4-71.8 0-132.7-48.5-154.5-113.5H22.2v71.8C70.5 482.5 163 544.3 272 544.3Z" fill="#34A853" />
            <path d="M117.5 319.3c-10.2-30-10.2-62.3 0-92.3V155.2H22.2c-44.1 88.1-44.1 192.7 0 280.8l95.3-71.6Z" fill="#FBBC04" />
            <path d="M272 107.7c38.6-.6 75.4 13.6 103.4 39.6l77.1-77.1C401 26.9 337.4 0 272 0 163 0 70.5 61.8 22.2 155.2l95.3 71.8C139.3 156.2 200.2 107.7 272 107.7Z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>
        <div className="flex items-center gap-3 text-xs text-ink/50">
          <span className="h-px flex-1 bg-line" />
          or use your email
          <span className="h-px flex-1 bg-line" />
        </div>
      </div>
      <form className="space-y-3" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label className="text-sm font-medium text-ink" htmlFor={emailId}>
            Work or Personal Email
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
        {isLoginPage && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink" htmlFor={passwordId}>
              Password
            </label>
            <input
              id={passwordId}
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-full border border-line bg-white/90 px-4 py-3 text-sm text-ink shadow-inner placeholder:text-ink/40 focus:border-leaf-600"
              placeholder="Enter your password"
            />
          </div>
        )}
        <button type="submit" className={buttonClasses} disabled={status === 'loading' || status === 'redirecting'}>
          {(status === 'loading' || status === 'redirecting') ? 'Redirecting you...' : buttonLabel}
        </button>
        <p id={messageId} role="status" aria-live="polite" className={`text-sm ${status === 'error' ? 'text-leaf-700' : 'text-ink/60'}`}>
          {message}
        </p>
      </form>
    </div>
  )
}
