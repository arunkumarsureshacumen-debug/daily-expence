import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import type { ReactNode } from 'react'

export type NoticeTone = 'warning' | 'info' | 'success' | 'error'

interface NoticeProps {
  tone?: NoticeTone
  title: string
  description?: ReactNode
  action?: ReactNode
  icon?: ReactNode
}

export function Notice({
  tone = 'info',
  title,
  description,
  action,
  icon,
}: NoticeProps) {
  const palette: Record<NoticeTone, { wrap: string; icon: string }> = {
    warning: {
      wrap: 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10',
      icon: 'text-amber-600 dark:text-amber-400',
    },
    info: {
      wrap: 'border-border bg-white dark:border-border-dark dark:bg-card-dark',
      icon: 'text-primary dark:text-white',
    },
    success: {
      wrap: 'border-success/30 bg-success/5 dark:bg-success/10',
      icon: 'text-success',
    },
    error: {
      wrap: 'border-expense/30 bg-expense/5 dark:bg-expense/10',
      icon: 'text-expense',
    },
  }

  const defaultIcon = (() => {
    if (icon) return icon
    if (tone === 'warning') return <AlertTriangle size={18} />
    if (tone === 'success') return <CheckCircle2 size={18} />
    if (tone === 'error') return <AlertTriangle size={18} />
    return <Info size={18} />
  })()

  const p = palette[tone]

  return (
    <div className={`rounded-2xl border p-4 flex gap-3 ${p.wrap}`}>
      <span className={`shrink-0 mt-0.5 ${p.icon}`}>{defaultIcon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-primary dark:text-white">
          {title}
        </p>
        {description ? (
          <div className="mt-1 text-xs text-muted dark:text-muted-dark">
            {description}
          </div>
        ) : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  )
}
