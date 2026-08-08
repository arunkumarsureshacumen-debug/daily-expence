import { useEffect, useRef, useState } from 'react'
import type {
  Category,
  CurrencyCode,
  Expense,
  PaymentMethod,
} from '../types/expense'
import { CategorySelector } from './CategorySelector'
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { CATEGORIES } from '../utils/calculations'
import { currentTimeString, getTodayKey } from '../utils/date'
import { formatCurrency, getCurrencySymbol } from '../utils/currency'

export interface ExpenseFormValues {
  amount: number
  category: Category
  description: string
  date: string
  paymentMethod: PaymentMethod
}

interface ExpenseFormProps {
  initial?: Partial<Expense>
  currency?: CurrencyCode
  submitLabel?: string
  autoFocusAmount?: boolean
  onSubmit: (values: ExpenseFormValues) => void
  onCancel?: () => void
}

export function ExpenseForm({
  initial,
  currency = 'INR',
  submitLabel = 'Add Expense',
  autoFocusAmount = true,
  onSubmit,
  onCancel,
}: ExpenseFormProps) {
  const [amountStr, setAmountStr] = useState<string>(
    initial?.amount ? String(initial.amount) : '',
  )
  const [category, setCategory] = useState<Category | null>(
    initial?.category ?? null,
  )
  const [description, setDescription] = useState<string>(initial?.description ?? '')
  const [date, setDate] = useState<string>(initial?.date ?? getTodayKey())
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initial?.paymentMethod ?? 'UPI',
  )
  const [time] = useState<string>(initial?.time ?? currentTimeString())
  const [error, setError] = useState<string | null>(null)
  const amountRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocusAmount) {
      const t = window.setTimeout(() => amountRef.current?.focus(), 120)
      return () => window.clearTimeout(t)
    }
  }, [autoFocusAmount])

  const amount = Number(amountStr)
  const symbol = getCurrencySymbol(currency)

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Please enter an amount greater than zero.')
      amountRef.current?.focus()
      return
    }
    if (!category) {
      setError('Please pick a category.')
      return
    }
    setError(null)
    onSubmit({
      amount: Math.round(amount * 100) / 100,
      category,
      description: description.trim(),
      date,
      paymentMethod,
    })
  }

  const quickCategories = CATEGORIES.slice(0, 5)

  return (
    <form onSubmit={submit} className="flex flex-col gap-6 px-4 pb-10">
      <div>
        <label className="text-xs font-medium text-muted dark:text-muted-dark">
          Amount
        </label>
        <div className="mt-1 flex items-baseline gap-2 rounded-2xl border border-border dark:border-border-dark bg-white dark:bg-card-dark px-4 py-4">
          <span className="text-3xl font-bold text-primary dark:text-white">
            {symbol}
          </span>
          <input
            ref={amountRef}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0"
            value={amountStr}
            onChange={(e) => {
              setAmountStr(e.target.value)
              setError(null)
            }}
            className="flex-1 bg-transparent outline-none text-3xl font-bold text-primary dark:text-white placeholder:text-muted/40"
          />
        </div>
        {amount > 0 ? (
          <p className="mt-2 text-xs text-muted dark:text-muted-dark">
            {formatCurrency(amount, currency)}
          </p>
        ) : null}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted dark:text-muted-dark">
            Quick category
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {quickCategories.map((c) => {
            const isSelected = category === c.label
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => {
                  setCategory(c.label)
                  setError(null)
                }}
                className={`shrink-0 px-3.5 h-9 rounded-full text-sm font-medium border tap-feedback ${
                  isSelected
                    ? 'bg-primary text-white border-primary dark:bg-white dark:text-primary dark:border-white'
                    : 'bg-white dark:bg-card-dark text-primary dark:text-white border-border dark:border-border-dark'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden="true">{c.emoji}</span>
                  {c.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted dark:text-muted-dark mb-2">
          Category
        </p>
        <CategorySelector
          selected={category}
          onSelect={(c) => {
            setCategory(c)
            setError(null)
          }}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted dark:text-muted-dark">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional note"
          maxLength={80}
          className="mt-1 w-full h-11 px-4 rounded-2xl border border-border dark:border-border-dark bg-white dark:bg-card-dark text-primary dark:text-white placeholder:text-muted/50 outline-none focus:border-primary dark:focus:border-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted dark:text-muted-dark">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={getTodayKey()}
            className="mt-1 w-full h-11 px-3 rounded-2xl border border-border dark:border-border-dark bg-white dark:bg-card-dark text-primary dark:text-white outline-none focus:border-primary dark:focus:border-white"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted dark:text-muted-dark">
            Time
          </label>
          <input
            type="time"
            value={time}
            disabled
            className="mt-1 w-full h-11 px-3 rounded-2xl border border-border dark:border-border-dark bg-bg dark:bg-bg-dark text-muted dark:text-muted-dark outline-none"
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted dark:text-muted-dark mb-2">
          Payment method
        </p>
        <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
      </div>

      {error ? (
        <p className="text-sm text-expense font-medium" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-12 rounded-2xl border border-border dark:border-border-dark text-primary dark:text-white font-semibold tap-feedback"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          className="flex-1 h-12 rounded-2xl bg-primary text-white dark:bg-white dark:text-primary font-semibold tap-feedback shadow-soft"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
