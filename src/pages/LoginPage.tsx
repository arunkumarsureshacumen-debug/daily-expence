import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, UserPlus, Wallet } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

type Mode = 'signin' | 'signup'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signUp, isConfigured, errorMessage, error, isReady } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const submit = async () => {
    if (submitting) return
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setLocalError('Please enter your email.')
      return
    }
    if (!password) {
      setLocalError('Please enter your password.')
      return
    }
    if (mode === 'signup' && password.length < 6) {
      setLocalError('Password should be at least 6 characters.')
      return
    }
    setLocalError(null)
    setSubmitting(true)
    try {
      if (mode === 'signup') {
        await signUp(trimmedEmail, password)
      } else {
        await signIn(trimmedEmail, password)
      }
      navigate('/', { replace: true })
    } catch {
      // error message is exposed via useAuth().errorMessage
    } finally {
      setSubmitting(false)
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void submit()
  }

  const message = localError ?? errorMessage
  const showConfigWarning =
    !isConfigured ||
    error === 'auth/configuration-not-found'

  return (
    <div className="min-h-screen flex flex-col px-5 safe-top safe-bottom animate-fade-in">
      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto py-10">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-10 h-10 rounded-2xl bg-primary text-white dark:bg-white dark:text-primary flex items-center justify-center">
            <Wallet size={20} strokeWidth={2.2} />
          </span>
          <span className="text-sm font-semibold text-primary dark:text-white">
            Daily Expense Tracker
          </span>
        </div>

        <h1 className="text-2xl font-bold text-primary dark:text-white">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mt-1 text-sm text-muted dark:text-muted-dark">
          {mode === 'signin'
            ? 'Sign in to sync your expenses across devices.'
            : 'Sign up once and use the same email on any device.'}
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark p-1">
          <button
            type="button"
            onClick={() => {
              setMode('signin')
              setLocalError(null)
            }}
            className={`h-10 rounded-xl text-sm font-medium tap-feedback transition-colors ${
              mode === 'signin'
                ? 'bg-primary text-white dark:bg-white dark:text-primary'
                : 'text-muted dark:text-muted-dark'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup')
              setLocalError(null)
            }}
            className={`h-10 rounded-xl text-sm font-medium tap-feedback transition-colors ${
              mode === 'signup'
                ? 'bg-primary text-white dark:bg-white dark:text-primary'
                : 'text-muted dark:text-muted-dark'
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-muted dark:text-muted-dark">
              Email
            </span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={submitting}
              className="mt-1 w-full h-12 px-4 rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark text-primary dark:text-white outline-none focus:border-primary dark:focus:border-white disabled:opacity-60"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted dark:text-muted-dark">
              Password
            </span>
            <div className="mt-1 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete={
                  mode === 'signup' ? 'new-password' : 'current-password'
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                disabled={submitting}
                className="w-full h-12 pl-4 pr-12 rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark text-primary dark:text-white outline-none focus:border-primary dark:focus:border-white disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-muted dark:text-muted-dark active:bg-border/40 dark:active:bg-border-dark/40 tap-feedback"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {message ? (
            <p
              role="alert"
              className="text-sm text-expense bg-expense/5 dark:bg-expense/10 border border-expense/30 rounded-2xl px-4 py-3"
            >
              {message}
            </p>
          ) : null}

          {showConfigWarning ? (
            <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl px-4 py-3">
              Cloud sync is not configured. Add Firebase credentials to your
              <code className="mx-1 px-1 rounded bg-white/60 dark:bg-black/30">.env</code>
              file to enable sign-in.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting || !isReady || showConfigWarning}
            className="w-full h-12 rounded-2xl bg-primary text-white dark:bg-white dark:text-primary font-semibold inline-flex items-center justify-center gap-2 tap-feedback disabled:opacity-60"
          >
            {mode === 'signin' ? (
              <LogIn size={18} strokeWidth={2.2} />
            ) : (
              <UserPlus size={18} strokeWidth={2.2} />
            )}
            {submitting
              ? mode === 'signin'
                ? 'Signing in…'
                : 'Creating account…'
              : mode === 'signin'
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-muted dark:text-muted-dark">
          By continuing, your expenses are stored locally and synced securely to
          Firebase under your account.
        </p>
      </div>
    </div>
  )
}