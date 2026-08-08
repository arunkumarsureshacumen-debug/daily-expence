export type Category =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Health'
  | 'Education'
  | 'Travel'
  | 'Other'

export type PaymentMethod =
  | 'Cash'
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'

export type Theme = 'light' | 'dark' | 'system'

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD'

export interface Expense {
  id: string
  amount: number
  category: Category
  description: string
  date: string
  time: string
  paymentMethod: PaymentMethod
  createdAt: string
}

export interface Settings {
  currency: CurrencyCode
  monthlyBudget: number
  theme: Theme
}

export interface CategoryMeta {
  label: Category
  emoji: string
  color: string
  bg: string
}

export interface PaymentMeta {
  label: PaymentMethod
}

export interface CategoryTotals {
  category: Category
  total: number
  count: number
}

export interface DailyTotal {
  date: string
  total: number
  count: number
}
