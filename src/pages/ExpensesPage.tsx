import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, Plus, Search, X } from 'lucide-react'
import { Header } from '../components/Header'
import { ExpenseCard } from '../components/ExpenseCard'
import { EmptyState } from '../components/EmptyState'
import { Section } from '../components/Section'
import { useExpenses } from '../hooks/useExpenses'
import { useSettings } from '../hooks/useSettings'
import type { Category, PaymentMethod } from '../types/expense'
import { CATEGORIES, PAYMENT_METHODS } from '../utils/calculations'
import { formatDateLabel, toDateKey } from '../utils/date'
import { formatCurrency } from '../utils/currency'

export function ExpensesPage() {
  const navigate = useNavigate()
  const { settings } = useSettings()
  const { expenses, helpers } = useExpenses()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category | 'All'>('All')
  const [payment, setPayment] = useState<PaymentMethod | 'All'>('All')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(
    () =>
      helpers.filtered({
        search,
        category,
        paymentMethod: payment,
        from: from || undefined,
        to: to || undefined,
      }),
    [helpers, search, category, payment, from, to],
  )

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const e of filtered) {
      const list = map.get(e.date) ?? []
      list.push(e)
      map.set(e.date, list)
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, items]) => ({
        date,
        items,
        total: items.reduce((s, i) => s + i.amount, 0),
      }))
  }, [filtered])

  const activeFilterCount =
    (category !== 'All' ? 1 : 0) +
    (payment !== 'All' ? 1 : 0) +
    (from ? 1 : 0) +
    (to ? 1 : 0)

  const clearFilters = () => {
    setCategory('All')
    setPayment('All')
    setFrom('')
    setTo('')
  }

  return (
    <div className="pb-24 animate-fade-in">
      <Header
        title="Expenses"
        subtitle={`${filtered.length} of ${expenses.length} entries`}
        right={
          <button
            type="button"
            onClick={() => navigate('/add')}
            className="w-10 h-10 rounded-full bg-primary text-white dark:bg-white dark:text-primary flex items-center justify-center tap-feedback"
            aria-label="Add expense"
          >
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-4 pt-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-muted-dark"
            />
            <input
              type="search"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-9 pr-9 rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark text-sm text-primary dark:text-white placeholder:text-muted/60 outline-none focus:border-primary dark:focus:border-white"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-muted dark:text-muted-dark"
              >
                <X size={16} />
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`relative w-11 h-11 rounded-2xl border flex items-center justify-center tap-feedback ${
              activeFilterCount > 0
                ? 'bg-primary text-white border-primary dark:bg-white dark:text-primary dark:border-white'
                : 'bg-white dark:bg-card-dark border-border dark:border-border-dark text-primary dark:text-white'
            }`}
            aria-label="Toggle filters"
          >
            <Filter size={18} />
            {activeFilterCount > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-expense text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>

        {showFilters ? (
          <div className="mt-3 rounded-2xl border border-border dark:border-border-dark bg-white dark:bg-card-dark p-4 animate-slide-down">
            <div className="mb-3">
              <p className="text-xs font-medium text-muted dark:text-muted-dark mb-2">
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  label="All"
                  active={category === 'All'}
                  onClick={() => setCategory('All')}
                />
                {CATEGORIES.map((c) => (
                  <FilterChip
                    key={c.label}
                    label={c.label}
                    icon={<span aria-hidden="true">{c.emoji}</span>}
                    active={category === c.label}
                    onClick={() => setCategory(c.label)}
                  />
                ))}
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs font-medium text-muted dark:text-muted-dark mb-2">
                Payment method
              </p>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  label="All"
                  active={payment === 'All'}
                  onClick={() => setPayment('All')}
                />
                {PAYMENT_METHODS.map((m) => (
                  <FilterChip
                    key={m}
                    label={m}
                    active={payment === m}
                    onClick={() => setPayment(m)}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <p className="text-xs font-medium text-muted dark:text-muted-dark mb-1">
                  From
                </p>
                <input
                  type="date"
                  value={from}
                  max={to || toDateKey(new Date())}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border dark:border-border-dark bg-bg dark:bg-bg-dark text-primary dark:text-white outline-none"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted dark:text-muted-dark mb-1">
                  To
                </p>
                <input
                  type="date"
                  value={to}
                  min={from || undefined}
                  max={toDateKey(new Date())}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border dark:border-border-dark bg-bg dark:bg-bg-dark text-primary dark:text-white outline-none"
                />
              </div>
            </div>

            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-expense tap-feedback"
              >
                Clear all filters
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        {grouped.length === 0 ? (
          <EmptyState
            icon={<Search size={28} strokeWidth={1.6} />}
            title={expenses.length === 0 ? 'No expenses yet' : 'No matches'}
            description={
              expenses.length === 0
                ? 'Add your first expense to see it here.'
                : 'Try adjusting your search or filters.'
            }
            action={
              expenses.length === 0 ? (
                <button
                  type="button"
                  onClick={() => navigate('/add')}
                  className="inline-flex items-center gap-1.5 px-4 h-10 rounded-full bg-primary text-white dark:bg-white dark:text-primary font-medium tap-feedback"
                >
                  <Plus size={16} />
                  Add Expense
                </button>
              ) : null
            }
          />
        ) : (
          grouped.map((group) => (
            <Section
              key={group.date}
              title={formatDateLabel(group.date)}
              action={
                <span className="text-xs font-semibold text-primary dark:text-white">
                  {formatCurrency(group.total, settings.currency)}
                </span>
              }
            >
              <div className="flex flex-col gap-2">
                {group.items.map((e) => (
                  <ExpenseCard
                    key={e.id}
                    expense={e}
                    currency={settings.currency}
                  />
                ))}
              </div>
            </Section>
          ))
        )}
      </div>

      <div className="h-24" />
    </div>
  )
}

interface FilterChipProps {
  label: string
  icon?: React.ReactNode
  active: boolean
  onClick: () => void
}

function FilterChip({ label, icon, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 h-8 rounded-full text-xs font-medium border tap-feedback ${
        active
          ? 'bg-primary text-white border-primary dark:bg-white dark:text-primary dark:border-white'
          : 'bg-bg dark:bg-bg-dark text-primary dark:text-white border-border dark:border-border-dark'
      }`}
    >
      <span className="inline-flex items-center gap-1">
        {icon}
        {label}
      </span>
    </button>
  )
}
