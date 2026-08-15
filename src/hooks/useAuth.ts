import { useCallback, useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import {
  authErrorMessage,
  authService,
  type AuthErrorCode,
} from '../services/authService'
import { deviceService } from '../services/deviceService'

export type AuthMode = 'anonymous' | 'email'
export type AuthStatus = 'loading' | 'ready' | 'unconfigured'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [error, setError] = useState<AuthErrorCode | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode>('anonymous')
  const [deviceId] = useState<string>(() => deviceService.getOrCreateDeviceId())

  useEffect(() => {
    if (!authService.isAvailable()) {
      setStatus('unconfigured')
      setUser(null)
      return () => undefined
    }

    const unsubAuth = authService.observeAuth((next) => {
      setUser(next)
      const isEmail = next?.providerData.some((p) => p.providerId === 'password') ?? false
      setAuthMode(isEmail ? 'email' : 'anonymous')
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

  const signUp = useCallback(async (email: string, password: string) => {
    await authService.signUpWithEmail(email, password)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    await authService.signInWithEmail(email, password)
  }, [])

  const signInAnonymously = useCallback(async () => {
    await authService.signInAnonymously()
  }, [])

  const signOut = useCallback(async () => {
    await authService.signOut()
  }, [])

  const ownerId = authMode === 'email' && user ? user.uid : deviceId

  return {
    user,
    uid: user?.uid ?? null,
    email: user?.email ?? null,
    deviceId,
    ownerId,
    authMode,
    status,
    error,
    errorMessage: authErrorMessage(error),
    isConfigured: authService.isConfigured,
    isReady: status === 'ready',
    isLoading: status === 'loading',
    isEmailUser: authMode === 'email',
    signUp,
    signIn,
    signInAnonymously,
    signOut,
  }
}