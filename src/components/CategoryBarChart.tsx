import type { CategoryTotals } from '../types/expense'
import { getCategoryMeta } from '../utils/calculations'

interface CategoryBarChartProps {
  data: CategoryTotals[]
  total: number
}

export function CategoryBarChart({ data, total }: CategoryBarChartProps) {
  if (data.length === 0 || total <= 0) {
    return (
      <p className="text-sm text-muted dark:text-muted-dark py-6 text-center">
        No category data yet
      </p>
    )
  }
  const sorted = [...data].sort((a, b) => b.total - a.total)
  const top = sorted.slice(0, 6)
  const max = top[0]?.total ?? 0

  return (
    <div className="flex flex-col gap-3">
      {top.map((item) => {
        const meta = getCategoryMeta(item.category)
        const percent = (item.total / total) * 100
        const widthPct = max > 0 ? (item.total / max) * 100 : 0
        return (
          <div key={item.category}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-primary dark:text-white inline-flex items-center gap-1.5">
                <span aria-hidden="true">{meta.emoji}</span>
                {item.category}
              </span>
              <span className="text-muted dark:text-muted-dark">
                {percent.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-border/60 dark:bg-border-dark/60 overflow-hidden">
              <div
                className="h-full rounded-full animate-progress transition-[width] duration-700"
                style={{ width: `${widthPct}%`, backgroundColor: meta.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
