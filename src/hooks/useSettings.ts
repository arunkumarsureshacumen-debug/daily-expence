import { useCallback, useEffect, useRef, useState } from 'react'
import type { Settings } from '../types/expense'
import { storageService } from '../services/storageService'
import { firestoreService } from '../services/firestoreService'
import { useAuth } from './useAuth'

function signatureOf(settings: Settings): string {
  return `${settings.currency}|${settings.monthlyBudget}|${settings.theme}`
}

export function useSettings() {
  const { uid, isReady, isConfigured } = useAuth()
  const [settings, setSettings] = useState<Settings>(() =>
    storageService.getSettings(),
  )
  const lastSyncedRef = useRef<string>(signatureOf(storageService.getSettings()))

  // 1. Local persistence (always)
  useEffect(() => {
    storageService.saveSettings(settings)
  }, [settings])

  // 2. Cross-tab sync
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === storageService.settingsKey) {
        setSettings(storageService.getSettings())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // 3. Pull from Firestore when anonymous UID is available
  useEffect(() => {
    if (!isConfigured || !isReady || !uid) return
    if (!firestoreService.isAvailable()) return
    let cancelled = false
    ;(async () => {
      try {
        const remote = await firestoreService.fetchSettings(uid)
        if (cancelled) return
        if (remote) {
          setSettings(remote)
          lastSyncedRef.current = signatureOf(remote)
        } else {
          const local = storageService.getSettings()
          await firestoreService.putSettings(uid, local)
          lastSyncedRef.current = signatureOf(local)
        }
      } catch (err) {
        console.error('[Firestore] settings pull failed', err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [uid, isReady, isConfigured])

  // 4. Push to Firestore when settings change
  useEffect(() => {
    if (!isConfigured || !isReady || !uid) return
    if (!firestoreService.isAvailable()) return
    const signature = signatureOf(settings)
    if (signature === lastSyncedRef.current) return
    const timer = window.setTimeout(async () => {
      try {
        await firestoreService.putSettings(uid, settings)
        lastSyncedRef.current = signature
      } catch (err) {
        console.error('[Firestore] settings push failed', err)
      }
    }, 600)
    return () => window.clearTimeout(timer)
  }, [settings, uid, isReady, isConfigured])

  const setBudget = useCallback((monthlyBudget: number) => {
    setSettings((prev) => ({ ...prev, monthlyBudget: Math.max(0, monthlyBudget) }))
  }, [])

  const setCurrency = useCallback((currency: Settings['currency']) => {
    setSettings((prev) => ({ ...prev, currency }))
  }, [])

  const setTheme = useCallback((theme: Settings['theme']) => {
    setSettings((prev) => ({ ...prev, theme }))
  }, [])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  return {
    settings,
    setBudget,
    setCurrency,
    setTheme,
    updateSettings,
  }
}
