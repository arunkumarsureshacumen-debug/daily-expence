import { useMemo } from 'react'
import { BarChart3, TrendingUp, Wallet } from 'lucide-react'
import { Header } from '../components/Header'
import { Section } from '../components/Section'
import { SummaryCard } from '../components/SummaryCard'
import { CategoryBarChart } from '../components/CategoryBarChart'
import { DailyTrendChart } from '../components/DailyTrendChart'
import { EmptyState } from '../components/EmptyState'
import { useExpenses } from '../hooks/useExpenses'
import { useSettings } from '../hooks/useSettings'
import { formatCurrency } from '../utils/currency'
import type { CurrencyCode } from '../types/expense'

export function StatisticsPage() {
  const { settings } = useSettings()
  const { helpers } = useExpenses()

  const monthTotal = helpers.monthlyTotal
  const largest = helpers.largest
  const dailyAverage = helpers.dailyAverage
  const categoryTotals = helpers.categoryTotals

  const trend = useMemo(() => buildDailyTrend(helpers), [helpers])

  return (
    <div className="pb-24 animate-fade-in">
      <Header
        title="Statistics"
        subtitle={new Date().toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })}
      />

      <div className="pt-2">
        {helpers.monthly.length === 0 ? (
          <EmptyState
            icon={<BarChart3 size={28} strokeWidth={1.6} />}
            title="No data yet"
            description="Add a few expenses to see your spending trends."
          />
        ) : (
          <>
            <Section title="This month">
              <div className="grid grid-cols-2 gap-3">
                <SummaryCard
                  label="Total Spending"
                  amount={monthTotal}
                  currency={settings.currency}
                  emphasis
                />
                <SummaryCard
                  label="Daily Average"
                  amount={Math.round(dailyAverage)}
                  currency={settings.currency}
                />
                <SummaryCard
                  label="Largest Expense"
                  amount={largest}
                  currency={settings.currency}
                  tone="negative"
                />
                <SummaryCard
                  label="Expenses"
                  amount={helpers.monthly.length}
                  format="number"
                />
              </div>
            </Section>

            <Section title="Spending by category">
              <div className="rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark p-4">
                <CategoryBarChart data={categoryTotals} total={monthTotal || 0} />
              </div>
            </Section>

            <Section title="Daily trend">
              <div className="rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark p-4">
                <DailyTrendChart data={trend} />
                <div className="mt-3 flex items-center justify-between text-xs text-muted dark:text-muted-dark">
                  <span>
                    {trend[0]?.date
                      ? new Date(trend[0].date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : ''}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <TrendingUp size={12} />
                    Peak {formatPeak(trend)}
                  </span>
                  <span>
                    {trend.length > 0
                      ? new Date(trend[trend.length - 1]?.date ?? '').toLocaleDateString(
                          'en-US',
                          { month: 'short', day: 'numeric' },
                        )
                      : ''}
                  </span>
                </div>
              </div>
            </Section>

            <Section>
              <div className="rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark p-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary dark:text-white flex items-center justify-center">
                  <Wallet size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium text-primary dark:text-white">
                    Top category
                  </p>
                  <p className="text-xs text-muted dark:text-muted-dark">
                    {topCategoryLabel(categoryTotals, monthTotal, settings.currency)}
                  </p>
                </div>
              </div>
            </Section>
          </>
        )}
      </div>

      <div className="h-24" />
    </div>
  )
}

function buildDailyTrend(helpers: ReturnType<typeof useExpenses>['helpers']) {
  return helpers.grouped
    .filter((g) => isThisMonth(g.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((g) => ({ date: g.date, total: g.total, count: g.items.length }))
}

function isThisMonth(dateKey: string) {
  const now = new Date()
  const [y, m] = dateKey.split('-').map(Number)
  return y === now.getFullYear() && m === now.getMonth() + 1
}

function formatPeak(trend: { date: string; total: number }[]) {
  if (trend.length === 0) return '–'
  const peak = trend.reduce((max, d) => (d.total > max.total ? d : max), trend[0])
  return peak.total > 0
    ? new Date(peak.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '–'
}

function topCategoryLabel(
  data: ReturnType<typeof useExpenses>['helpers']['categoryTotals'],
  total: number,
  currency: CurrencyCode,
): string {
  if (data.length === 0 || total <= 0)
    return 'Add expenses to find your top category'
  const top = data[0]
  const pct = ((top.total / total) * 100).toFixed(0)
  return `${top.category} · ${formatCurrency(top.total, currency)} · ${pct}%`
}
