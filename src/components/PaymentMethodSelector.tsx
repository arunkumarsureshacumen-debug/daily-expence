import { Check } from 'lucide-react'
import type { PaymentMethod } from '../types/expense'
import { PAYMENT_METHODS } from '../utils/calculations'

interface PaymentMethodSelectorProps {
  selected: PaymentMethod
  onSelect: (method: PaymentMethod) => void
}

export function PaymentMethodSelector({
  selected,
  onSelect,
}: PaymentMethodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Payment method">
      {PAYMENT_METHODS.map((m) => {
        const isSelected = selected === m
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(m)}
            className={`px-3.5 h-9 rounded-full text-sm font-medium border tap-feedback ${
              isSelected
                ? 'bg-primary text-white border-primary dark:bg-white dark:text-primary dark:border-white'
                : 'bg-white dark:bg-card-dark text-primary dark:text-white border-border dark:border-border-dark'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              {isSelected ? <Check size={14} /> : null}
              {m}
            </span>
          </button>
        )
      })}
    </div>
  )
}
