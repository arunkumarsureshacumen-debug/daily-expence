import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

interface SectionProps {
  title?: string
  action?: ReactNode
  children: ReactNode
}

export function Section({ title, action, children }: SectionProps) {
  return (
    <section className="px-4 mb-6">
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          {title ? (
            <h2 className="text-sm font-semibold text-primary dark:text-white">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

interface ListRowProps {
  icon?: ReactNode
  label: string
  value?: ReactNode
  onClick?: () => void
  trailing?: ReactNode
}

export function ListRow({ icon, label, value, onClick, trailing }: ListRowProps) {
  const isClickable = !!onClick
  const Tag = isClickable ? 'button' : 'div'
  return (
    <Tag
      type={isClickable ? 'button' : undefined}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-card-dark border-b border-border dark:border-border-dark last:border-b-0 text-left"
    >
      {icon ? (
        <span className="w-9 h-9 rounded-xl bg-bg dark:bg-bg-dark flex items-center justify-center text-primary dark:text-white shrink-0">
          {icon}
        </span>
      ) : null}
      <span className="flex-1 text-sm font-medium text-primary dark:text-white">
        {label}
      </span>
      {value ? (
        <span className="text-sm text-muted dark:text-muted-dark">{value}</span>
      ) : null}
      {trailing ?? (isClickable ? <ChevronRight size={18} className="text-muted dark:text-muted-dark" /> : null)}
    </Tag>
  )
}
