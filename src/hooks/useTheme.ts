import { useEffect, useState } from 'react'
import type { Theme } from '../types/expense'
import { useSettings } from './useSettings'

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return theme
}

export function useTheme() {
  const { settings } = useSettings()
  const resolved = resolveTheme(settings.theme)
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(resolved)

  useEffect(() => {
    setEffectiveTheme(resolveTheme(settings.theme))
    if (settings.theme !== 'system') return
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setEffectiveTheme(media.matches ? 'dark' : 'light')
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [settings.theme])

  useEffect(() => {
    const root = document.documentElement
    if (effectiveTheme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [effectiveTheme])

  return {
    theme: settings.theme,
    resolved: effectiveTheme,
    isDark: effectiveTheme === 'dark',
  }
}
