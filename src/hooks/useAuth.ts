import { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { authService, type AuthErrorCode } from '../services/authService'

export type AuthStatus = 'loading' | 'ready' | 'unconfigured'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [error, setError] = useState<AuthErrorCode | null>(null)

  useEffect(() => {
    if (!authService.isAvailable()) {
      setStatus('unconfigured')
      setUser(null)
      return () => undefined
    }

    const unsubAuth = authService.observeAuth((next) => {
      setUser(next)
      setStatus('ready')
    })
    const unsubError = authService.observeError((code) => {
      setError(code)
    })
    return () => {
      unsubAuth()
      unsubError()
    }
  }, [])

  return {
    user,
    uid: user?.uid ?? null,
    status,
    error,
    isConfigured: authService.isConfigured,
    isReady: status === 'ready',
    isLoading: status === 'loading',
  }
}
