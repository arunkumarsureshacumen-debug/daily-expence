import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, TrendingUp, Wallet } from 'lucide-react'
import { useExpenses } from '../hooks/useExpenses'
import { useSettings } from '../hooks/useSettings'
import { useTheme } from '../hooks/useTheme'
import { ExpenseCard } from '../components/ExpenseCard'
import { EmptyState } from '../components/EmptyState'
import { Section } from '../components/Section'
import { SummaryCard } from '../components/SummaryCard'
import { BudgetCard } from '../components/BudgetCard'
import { greeting } from '../utils/date'
import { formatCurrency } from '../utils/currency'

export function HomePage() {
  const navigate = useNavigate()
  const { settings } = useSettings()
  useTheme()
  const { helpers, expenses } = useExpenses()

  const todayTotal = useMemo(
    () => helpers.today.reduce((s, e) => s + e.amount, 0),
    [helpers.today],
  )
  const monthTotal = helpers.monthlyTotal
  const remaining = Math.max(0, settings.monthlyBudget - monthTotal)
  const monthCount = helpers.monthly.length

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-6 pb-2">
        <p className="text-sm text-muted dark:text-muted-dark">
          {greeting()} 👋
        </p>
        <h1 className="text-2xl font-bold text-primary dark:text-white mt-0.5">
          Today&rsquo;s spending
        </h1>
      </div>

      <div className="px-4 mb-4">
        <div className="rounded-3xl bg-primary text-white dark:bg-white dark:text-primary p-5 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide opacity-80">
            Today
          </p>
          <p className="mt-1 text-4xl font-extrabold leading-tight">
            {formatCurrency(todayTotal, settings.currency)}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="opacity-80">This Month</p>
              <p className="font-semibold text-sm mt-0.5">
                {formatCurrency(monthTotal, settings.currency)}
              </p>
            </div>
            <div>
              <p className="opacity-80">Budget</p>
              <p className="font-semibold text-sm mt-0.5">
                {formatCurrency(settings.monthlyBudget, settings.currency)}
              </p>
            </div>
            <div>
              <p className="opacity-80">Remaining</p>
              <p className="font-semibold text-sm mt-0.5">
                {formatCurrency(remaining, settings.currency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Section>
        <BudgetCard
          spent={monthTotal}
          budget={settings.monthlyBudget}
          currency={settings.currency}
        />
      </Section>

      <Section
        title="Today"
        action={
          <button
            type="button"
            onClick={() => navigate('/expenses')}
            className="text-xs font-medium text-muted dark:text-muted-dark tap-feedback"
          >
            See all
          </button>
        }
      >
        {expenses.length === 0 ? (
          <EmptyState
            icon={<Wallet size={32} strokeWidth={1.6} />}
            title="No expenses yet"
            description="Start tracking your spending today."
            action={
              <button
                type="button"
                onClick={() => navigate('/add')}
                className="inline-flex items-center gap-1.5 px-4 h-10 rounded-full bg-primary text-white dark:bg-white dark:text-primary font-medium tap-feedback"
              >
                <Plus size={16} />
                Add Expense
              </button>
            }
          />
        ) : helpers.today.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border dark:border-border-dark p-5 text-center bg-white dark:bg-card-dark">
            <p className="text-sm text-muted dark:text-muted-dark">
              No expenses recorded today.
            </p>
            <button
              type="button"
              onClick={() => navigate('/add')}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary dark:text-white tap-feedback"
            >
              <Plus size={14} />
              Add your first
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {helpers.today.slice(0, 8).map((e) => (
              <ExpenseCard
                key={e.id}
                expense={e}
                currency={settings.currency}
              />
            ))}
          </div>
        )}
      </Section>

      {monthCount > 0 ? (
        <Section>
          <div className="rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark p-4 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <TrendingUp size={18} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary dark:text-white">
                {monthCount} expense{monthCount === 1 ? '' : 's'} this month
              </p>
              <p className="text-xs text-muted dark:text-muted-dark">
                Daily avg {formatCurrency(helpers.dailyAverage, settings.currency)}
              </p>
            </div>
          </div>
        </Section>
      ) : null}

      <Section>
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            label="This Month"
            amount={monthTotal}
            currency={settings.currency}
          />
          <SummaryCard
            label="Daily Average"
            amount={Math.round(helpers.dailyAverage)}
            currency={settings.currency}
            tone="negative"
          />
        </div>
      </Section>

      <div className="h-24" />
    </div>
  )
}
