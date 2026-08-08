import { Wallet } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-14 animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark flex items-center justify-center mb-4 text-primary dark:text-white shadow-soft">
        {icon ?? <Wallet size={32} strokeWidth={1.6} />}
      </div>
      <h2 className="text-base font-semibold text-primary dark:text-white">{title}</h2>
      {description ? (
        <p className="text-sm text-muted dark:text-muted-dark mt-1 max-w-xs">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
