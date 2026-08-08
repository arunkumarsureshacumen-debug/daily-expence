import type { CurrencyCode } from '../types/expense'
import { formatCurrency } from '../utils/currency'

interface SummaryCardProps {
  label: string
  amount: number
  currency?: CurrencyCode
  emphasis?: boolean
  tone?: 'default' | 'positive' | 'negative'
  format?: 'currency' | 'number'
}

export function SummaryCard({
  label,
  amount,
  currency = 'INR',
  emphasis = false,
  tone = 'default',
  format = 'currency',
}: SummaryCardProps) {
  const amountColor =
    tone === 'positive'
      ? 'text-success'
      : tone === 'negative'
        ? 'text-expense'
        : 'text-primary dark:text-white'

  const display =
    format === 'number'
      ? amount.toLocaleString('en-IN')
      : formatCurrency(amount, currency)

  return (
    <div
      className={`rounded-2xl p-4 border ${
        emphasis
          ? 'bg-primary text-white border-primary dark:bg-white dark:text-primary dark:border-white'
          : 'bg-white dark:bg-card-dark border-border dark:border-border-dark'
      }`}
    >
      <p
        className={`text-[11px] font-medium uppercase tracking-wide ${
          emphasis ? 'opacity-80' : 'text-muted dark:text-muted-dark'
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-1 font-bold ${
          emphasis ? 'text-3xl' : 'text-xl'
        } ${emphasis ? '' : amountColor}`}
      >
        {display}
      </p>
    </div>
  )
}
