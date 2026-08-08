import type { Category } from '../types/expense'
import { CATEGORIES, getCategoryMeta } from '../utils/calculations'

interface CategorySelectorProps {
  selected: Category | null
  onSelect: (category: Category) => void
  compact?: boolean
}

export function CategorySelector({
  selected,
  onSelect,
  compact = false,
}: CategorySelectorProps) {
  return (
    <div
      className={`grid gap-2 ${
        compact ? 'grid-cols-4' : 'grid-cols-3'
      }`}
      role="radiogroup"
      aria-label="Category"
    >
      {CATEGORIES.map((c) => {
        const isSelected = selected === c.label
        return (
          <button
            key={c.label}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(c.label)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border tap-feedback transition-colors ${
              isSelected
                ? 'border-primary bg-primary text-white dark:border-white dark:bg-white dark:text-primary'
                : 'border-border dark:border-border-dark bg-white dark:bg-card-dark text-primary dark:text-white'
            } ${compact ? 'py-2.5' : ''}`}
          >
            <span className="text-2xl" aria-hidden="true">
              {getCategoryMeta(c.label).emoji}
            </span>
            <span className={`text-[11px] font-medium ${compact ? '' : 'text-xs'}`}>
              {c.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
