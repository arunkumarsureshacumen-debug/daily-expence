import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  right?: ReactNode
}

export function Header({ title, subtitle, onBack, right }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-bg/85 dark:bg-bg-dark/85 backdrop-blur-md border-b border-border dark:border-border-dark safe-top">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2 min-w-0">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="-ml-2 w-10 h-10 flex items-center justify-center rounded-full active:bg-border/40 dark:active:bg-border-dark/40 tap-feedback"
              aria-label="Go back"
            >
              <ChevronLeft size={22} />
            </button>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-primary dark:text-white truncate">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-xs text-muted dark:text-muted-dark truncate">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {right ? <div className="flex items-center gap-1">{right}</div> : null}
      </div>
    </header>
  )
}
