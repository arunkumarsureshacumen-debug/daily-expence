import type { Expense, Settings } from '../types/expense'

const EXPENSES_KEY = 'det.expenses.v1'
const SETTINGS_KEY = 'det.settings.v1'

const DEFAULT_SETTINGS: Settings = {
  currency: 'INR',
  monthlyBudget: 30000,
  theme: 'system',
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw) as T
    if (parsed === null || parsed === undefined) return fallback
    return parsed
  } catch {
    return fallback
  }
}

function safeReadArray(raw: string | null): Expense[] {
  const parsed = safeParse<unknown>(raw, [])
  if (!Array.isArray(parsed)) return []
  return parsed.filter(isValidExpense)
}

function safeReadSettings(raw: string | null): Settings {
  const parsed = safeParse<Partial<Settings>>(raw, {})
  return {
    currency: parsed.currency ?? DEFAULT_SETTINGS.currency,
    monthlyBudget:
      typeof parsed.monthlyBudget === 'number' && parsed.monthlyBudget >= 0
        ? parsed.monthlyBudget
        : DEFAULT_SETTINGS.monthlyBudget,
    theme: parsed.theme ?? DEFAULT_SETTINGS.theme,
  }
}

function isValidExpense(value: unknown): value is Expense {
  if (typeof value !== 'object' || value === null) return false
  const e = value as Record<string, unknown>
  return (
    typeof e.id === 'string' &&
    typeof e.amount === 'number' &&
    typeof e.category === 'string' &&
    typeof e.description === 'string' &&
    typeof e.date === 'string' &&
    typeof e.time === 'string' &&
    typeof e.paymentMethod === 'string' &&
    typeof e.createdAt === 'string'
  )
}

export const storageService = {
  expensesKey: EXPENSES_KEY,
  settingsKey: SETTINGS_KEY,
  getExpenses(): Expense[] {
    if (typeof window === 'undefined') return []
    return safeReadArray(window.localStorage.getItem(EXPENSES_KEY))
  },

  saveExpenses(expenses: Expense[]): void {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses))
  },

  getSettings(): Settings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS
    return safeReadSettings(window.localStorage.getItem(SETTINGS_KEY))
  },

  saveSettings(settings: Settings): void {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  },

  clearAll(): void {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(EXPENSES_KEY)
    window.localStorage.removeItem(SETTINGS_KEY)
  },

  exportData(): string {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      expenses: this.getExpenses(),
      settings: this.getSettings(),
    }
    return JSON.stringify(payload, null, 2)
  },

  importData(json: string): { expenses: Expense[]; settings: Settings } | null {
    try {
      const data = JSON.parse(json) as {
        expenses?: unknown
        settings?: unknown
      }
      const expenses = Array.isArray(data.expenses)
        ? data.expenses.filter(isValidExpense)
        : []
      const settings =
        data.settings && typeof data.settings === 'object'
          ? safeReadSettings(JSON.stringify(data.settings))
          : DEFAULT_SETTINGS
      this.saveExpenses(expenses)
      this.saveSettings(settings)
      return { expenses, settings }
    } catch {
      return null
    }
  },
}
