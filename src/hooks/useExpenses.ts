import { useCallback, useEffect, useRef, useState } from 'react'
import type { Expense } from '../types/expense'
import { storageService } from '../services/storageService'
import { firestoreService } from '../services/firestoreService'
import { useAuth } from './useAuth'
import {
  calculateCategoryTotals,
  calculateDailyAverage,
  calculateLargestExpense,
  calculateMonthlyTotal,
  dedupeExpenses,
  filterExpenses,
  getExpensesByDate,
  getMonthlyExpenses,
  getTodayExpenses,
  groupExpensesByDate,
  sortExpensesByDate,
} from '../utils/calculations'

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function signatureOf(list: Expense[]): string {
  return list
    .map(
      (e) =>
        `${e.id}|${e.amount}|${e.category}|${e.description}|${e.date}|${e.time}|${e.paymentMethod}`,
    )
    .join('§')
}

function mergeExpenses(local: Expense[], remote: Expense[]): Expense[] {
  const map = new Map<string, Expense>()
  for (const e of remote) map.set(e.id, e)
  for (const e of local) {
    const existing = map.get(e.id)
    if (!existing || e.createdAt > existing.createdAt) {
      map.set(e.id, e)
    }
  }
  return sortExpensesByDate(Array.from(map.values()))
}

export type CloudSyncStatus = 'idle' | 'syncing' | 'error' | 'offline'

export function useExpenses() {
  const { ownerId, isReady, isConfigured } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    dedupeExpenses(sortExpensesByDate(storageService.getExpenses())),
  )
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('idle')

  // 1. Local persistence (always)
  useEffect(() => {
    storageService.saveExpenses(expenses)
  }, [expenses])

  // 2. Cross-tab sync via the browser-native 'storage' event
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === storageService.expensesKey) {
        setExpenses(sortExpensesByDate(storageService.getExpenses()))
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // 3. Pull from Firestore when ownerId is available
  const lastSyncedRef = useRef<string>(signatureOf(expenses))
  useEffect(() => {
    if (!isConfigured || !isReady || !ownerId) return
    if (!firestoreService.isAvailable()) return
    let cancelled = false
    setSyncStatus('syncing')
    ;(async () => {
      try {
        const remote = await firestoreService.fetchExpenses(ownerId)
        if (cancelled) return
        const local = dedupeExpenses(sortExpensesByDate(storageService.getExpenses()))
        const merged = dedupeExpenses(mergeExpenses(local, remote))
        setExpenses(merged)
        lastSyncedRef.current = signatureOf(merged)
        await firestoreService.replaceAllExpenses(ownerId, merged)
        if (!cancelled) setSyncStatus('idle')
      } catch (err) {
        console.error('[Firestore] pull failed', err)
        if (!cancelled) setSyncStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ownerId, isReady, isConfigured])

  // 4. Push to Firestore when local expenses change
  useEffect(() => {
    if (!isConfigured || !isReady || !ownerId) return
    if (!firestoreService.isAvailable()) return
    const signature = signatureOf(expenses)
    if (signature === lastSyncedRef.current) return
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setSyncStatus('offline')
      return
    }
    const timer = window.setTimeout(async () => {
      try {
        setSyncStatus('syncing')
        await firestoreService.replaceAllExpenses(ownerId, expenses)
        lastSyncedRef.current = signature
        setSyncStatus('idle')
      } catch (err) {
        console.error('[Firestore] push failed', err)
        setSyncStatus('error')
      }
    }, 600)
    return () => window.clearTimeout(timer)
  }, [expenses, ownerId, isReady, isConfigured])

  // 5. Flush when the browser comes back online
  useEffect(() => {
    const onOnline = () => {
      if (!ownerId) return
      if (signatureOf(expenses) === lastSyncedRef.current) return
      firestoreService
        .replaceAllExpenses(ownerId, expenses)
        .then(() => {
          lastSyncedRef.current = signatureOf(expenses)
          setSyncStatus('idle')
        })
        .catch((err) => {
          console.error('[Firestore] online-flush failed', err)
          setSyncStatus('error')
        })
    }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [expenses, ownerId])

  const addExpense = useCallback((data: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...data,
      id: createId(),
      createdAt: new Date().toISOString(),
    }
    setExpenses((prev) => sortExpensesByDate([newExpense, ...prev]))
    return newExpense
  }, [])

  const updateExpense = useCallback(
    (id: string, patch: Partial<Omit<Expense, 'id' | 'createdAt'>>) => {
      let updated: Expense | null = null
      setExpenses((prev) => {
        const next = prev.map((e) => {
          if (e.id !== id) return e
          updated = { ...e, ...patch }
          return updated
        })
        return sortExpensesByDate(next)
      })
      return updated
    },
    [],
  )

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    storageService.clearAll()
    setExpenses([])
    if (ownerId && firestoreService.isAvailable()) {
      firestoreService.clearExpenses(ownerId).catch((err) => {
        console.error('[Firestore] clear failed', err)
      })
    }
  }, [ownerId])

  const importExpenses = useCallback((items: Expense[]) => {
    setExpenses(sortExpensesByDate(items))
  }, [])

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    clearAll,
    importExpenses,
    syncStatus,
    helpers: {
      today: getTodayExpenses(expenses),
      monthly: getMonthlyExpenses(expenses),
      byDate: (key: string) => getExpensesByDate(expenses, key),
      monthlyTotal: calculateMonthlyTotal(expenses),
      dailyAverage: calculateDailyAverage(expenses),
      largest: calculateLargestExpense(expenses),
      categoryTotals: calculateCategoryTotals(expenses),
      grouped: groupExpensesByDate(expenses),
      filtered: (opts: Parameters<typeof filterExpenses>[1]) =>
        filterExpenses(expenses, opts),
    },
  }
}
