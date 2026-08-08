import { useCallback, useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { authService, type AuthErrorCode } from '../services/authService'
import { deviceService } from '../services/deviceService'

export type AuthStatus = 'loading' | 'ready' | 'unconfigured'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [error, setError] = useState<AuthErrorCode | null>(null)
  const [deviceId, setDeviceIdState] = useState<string>(() =>
    deviceService.getOrCreateDeviceId(),
  )

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

  const setDeviceId = useCallback((id: string) => {
    const trimmed = id.trim()
    if (!trimmed) return
    deviceService.setDeviceId(trimmed)
    setDeviceIdState(trimmed)
  }, [])

  return {
    user,
    uid: user?.uid ?? null,
    deviceId,
    setDeviceId,
    status,
    error,
    isConfigured: authService.isConfigured,
    isReady: status === 'ready',
    isLoading: status === 'loading',
  }
}
