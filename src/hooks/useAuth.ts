import { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { authService } from '../services/authService'

export type AuthStatus = 'loading' | 'ready' | 'unconfigured'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    if (!authService.isAvailable()) {
      setStatus('unconfigured')
      setUser(null)
      return () => undefined
    }

    const unsubscribe = authService.observeAuth((next) => {
      setUser(next)
      setStatus('ready')
    })
    return unsubscribe
  }, [])

  return {
    user,
    uid: user?.uid ?? null,
    status,
    isConfigured: authService.isConfigured,
    isReady: status === 'ready',
    isLoading: status === 'loading',
  }
}
