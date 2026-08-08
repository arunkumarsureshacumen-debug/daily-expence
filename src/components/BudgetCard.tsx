import type { CurrencyCode } from '../types/expense'
import { formatCurrency } from '../utils/currency'
import { budgetStatus } from '../utils/calculations'

interface BudgetCardProps {
  spent: number
  budget: number
  currency?: CurrencyCode
}

export function BudgetCard({ spent, budget, currency = 'INR' }: BudgetCardProps) {
  const { percent, status, remaining } = budgetStatus(spent, budget)
  const barColor =
    status === 'exceeded'
      ? 'bg-expense'
      : status === 'warning'
        ? 'bg-amber-500'
        : 'bg-success'

  return (
    <div className="rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-primary dark:text-white">
          Monthly Budget
        </h3>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            status === 'exceeded'
              ? 'bg-expense/10 text-expense'
              : status === 'warning'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
                : 'bg-success/10 text-success'
          }`}
        >
          {status === 'exceeded'
            ? 'Exceeded'
            : status === 'warning'
              ? 'Warning'
              : 'On track'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-[11px] text-muted dark:text-muted-dark">Spent</p>
          <p className="font-semibold text-primary dark:text-white">
            {formatCurrency(spent, currency)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted dark:text-muted-dark">Budget</p>
          <p className="font-semibold text-primary dark:text-white">
            {formatCurrency(budget, currency)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted dark:text-muted-dark">Remaining</p>
          <p
            className={`font-semibold ${
              status === 'exceeded' ? 'text-expense' : 'text-primary dark:text-white'
            }`}
          >
            {formatCurrency(remaining, currency)}
          </p>
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-border/60 dark:bg-border-dark/60 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} animate-progress transition-[width] duration-500 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-muted dark:text-muted-dark">
        {percent.toFixed(1)}% of monthly budget used
      </p>
    </div>
  )
}
