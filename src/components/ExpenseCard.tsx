import { useNavigate } from 'react-router-dom'
import type { CurrencyCode, Expense } from '../types/expense'
import { getCategoryMeta } from '../utils/calculations'
import { formatTime } from '../utils/date'
import { formatCurrency } from '../utils/currency'

interface ExpenseCardProps {
  expense: Expense
  currency?: CurrencyCode
}

export function ExpenseCard({ expense, currency = 'INR' }: ExpenseCardProps) {
  const navigate = useNavigate()
  const meta = getCategoryMeta(expense.category)
  return (
    <button
      type="button"
      onClick={() => navigate(`/expense/${expense.id}`)}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark active:scale-[0.99] transition-transform text-left"
    >
      <span
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ backgroundColor: meta.bg }}
        aria-hidden="true"
      >
        {meta.emoji}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-primary dark:text-white truncate">
          {expense.description || expense.category}
        </p>
        <p className="text-xs text-muted dark:text-muted-dark truncate">
          {expense.category} · {formatTime(expense.time)}
        </p>
      </div>
      <p className="font-semibold text-expense shrink-0">
        {formatCurrency(expense.amount, currency)}
      </p>
    </button>
  )
}
