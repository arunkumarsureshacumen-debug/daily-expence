import type {
  Category,
  CategoryMeta,
  CategoryTotals,
  DailyTotal,
  Expense,
  PaymentMethod,
} from '../types/expense'
import { fromDateKey, getMonthKey, getTodayKey } from './date'

export const CATEGORIES: CategoryMeta[] = [
  { label: 'Food', emoji: '🍔', color: '#F97316', bg: '#FFF1E6' },
  { label: 'Transport', emoji: '🚕', color: '#3B82F6', bg: '#E6F0FF' },
  { label: 'Shopping', emoji: '🛒', color: '#A855F7', bg: '#F3E8FF' },
  { label: 'Bills', emoji: '💡', color: '#EAB308', bg: '#FEF9C3' },
  { label: 'Entertainment', emoji: '🎬', color: '#EC4899', bg: '#FCE7F3' },
  { label: 'Health', emoji: '🩺', color: '#10B981', bg: '#D1FAE5' },
  { label: 'Education', emoji: '📚', color: '#6366F1', bg: '#E0E7FF' },
  { label: 'Travel', emoji: '✈️', color: '#0EA5E9', bg: '#E0F2FE' },
  { label: 'Other', emoji: '📦', color: '#6B7280', bg: '#F3F4F6' },
]

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'UPI',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
]

const CATEGORY_BY_LABEL = new Map<Category, CategoryMeta>(
  CATEGORIES.map((c) => [c.label, c]),
)

export function getCategoryMeta(category: Category): CategoryMeta {
  return CATEGORY_BY_LABEL.get(category) ?? CATEGORIES[CATEGORIES.length - 1]
}

export function sortExpensesByDate(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => {
    if (a.date === b.date) return b.time.localeCompare(a.time)
    return b.date.localeCompare(a.date)
  })
}

function expenseFingerprint(e: Expense): string {
  return [
    e.amount.toFixed(2),
    e.category,
    e.description,
    e.date,
    e.time,
    e.paymentMethod,
  ].join('|')
}

export function dedupeExpenses(expenses: Expense[]): Expense[] {
  const byId = new Map<string, Expense>()
  const seen = new Set<string>()
  for (const e of expenses) {
    if (byId.has(e.id)) continue
    const fp = expenseFingerprint(e)
    if (seen.has(fp)) continue
    seen.add(fp)
    byId.set(e.id, e)
  }
  return sortExpensesByDate(Array.from(byId.values()))
}

export function getExpensesByDate(
  expenses: Expense[],
  dateKey: string,
): Expense[] {
  return sortExpensesByDate(expenses.filter((e) => e.date === dateKey))
}

export function getTodayExpenses(expenses: Expense[]): Expense[] {
  return getExpensesByDate(expenses, getTodayKey())
}

export function getMonthlyExpenses(
  expenses: Expense[],
  reference: Date = new Date(),
): Expense[] {
  const monthKey = getMonthKey(reference)
  return expenses.filter((e) => getMonthKey(fromDateKey(e.date)) === monthKey)
}

export function calculateTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0)
}

export function calculateMonthlyTotal(
  expenses: Expense[],
  reference?: Date,
): number {
  return calculateTotal(getMonthlyExpenses(expenses, reference))
}

export function calculateDailyAverage(
  expenses: Expense[],
  reference: Date = new Date(),
): number {
  const monthly = getMonthlyExpenses(expenses, reference)
  if (monthly.length === 0) return 0
  const total = calculateTotal(monthly)
  const daysInMonth = new Date(
    reference.getFullYear(),
    reference.getMonth() + 1,
    0,
  ).getDate()
  const day = Math.min(reference.getDate(), daysInMonth)
  return total / day
}

export function calculateLargestExpense(expenses: Expense[]): number {
  if (expenses.length === 0) return 0
  return expenses.reduce((max, e) => (e.amount > max ? e.amount : max), 0)
}

export function calculateCategoryTotals(expenses: Expense[]): CategoryTotals[] {
  const map = new Map<Category, { total: number; count: number }>()
  for (const e of expenses) {
    const existing = map.get(e.category) ?? { total: 0, count: 0 }
    existing.total += e.amount
    existing.count += 1
    map.set(e.category, existing)
  }
  const result: CategoryTotals[] = []
  for (const c of CATEGORIES) {
    const v = map.get(c.label)
    if (v) result.push({ category: c.label, total: v.total, count: v.count })
  }
  return result
}

export function calculateDailyTotals(
  expenses: Expense[],
  reference: Date = new Date(),
): DailyTotal[] {
  const monthly = getMonthlyExpenses(expenses, reference)
  const map = new Map<string, { total: number; count: number }>()
  for (const e of monthly) {
    const existing = map.get(e.date) ?? { total: 0, count: 0 }
    existing.total += e.amount
    existing.count += 1
    map.set(e.date, existing)
  }
  const daysInMonth = new Date(
    reference.getFullYear(),
    reference.getMonth() + 1,
    0,
  ).getDate()
  const result: DailyTotal[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(reference.getFullYear(), reference.getMonth(), day)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (d > new Date()) break
    const v = map.get(key) ?? { total: 0, count: 0 }
    result.push({ date: key, total: v.total, count: v.count })
  }
  return result
}

export function filterExpenses(
  expenses: Expense[],
  options: {
    search?: string
    category?: Category | 'All'
    paymentMethod?: PaymentMethod | 'All'
    from?: string
    to?: string
  } = {},
): Expense[] {
  const { search, category, paymentMethod, from, to } = options
  const q = search?.trim().toLowerCase() ?? ''
  return expenses.filter((e) => {
    if (category && category !== 'All' && e.category !== category) return false
    if (
      paymentMethod &&
      paymentMethod !== 'All' &&
      e.paymentMethod !== paymentMethod
    )
      return false
    if (from && e.date < from) return false
    if (to && e.date > to) return false
    if (q) {
      const haystack = `${e.description} ${e.category} ${e.paymentMethod}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}

export function groupExpensesByDate(
  expenses: Expense[],
): Array<{ date: string; items: Expense[]; total: number }> {
  const sorted = sortExpensesByDate(expenses)
  const map = new Map<string, Expense[]>()
  for (const e of sorted) {
    const list = map.get(e.date) ?? []
    list.push(e)
    map.set(e.date, list)
  }
  const groups: Array<{ date: string; items: Expense[]; total: number }> = []
  for (const [date, items] of map.entries()) {
    groups.push({ date, items, total: calculateTotal(items) })
  }
  return groups
}

export function budgetStatus(spent: number, budget: number): {
  percent: number
  status: 'safe' | 'warning' | 'exceeded'
  remaining: number
} {
  if (budget <= 0) {
    return { percent: 0, status: 'safe', remaining: 0 }
  }
  const percent = Math.min(100, (spent / budget) * 100)
  const remaining = Math.max(0, budget - spent)
  let status: 'safe' | 'warning' | 'exceeded' = 'safe'
  if (spent >= budget) status = 'exceeded'
  else if (percent >= 80) status = 'warning'
  return { percent, status, remaining }
}
