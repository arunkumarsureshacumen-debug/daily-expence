import { Plus, Home, ListChecks, PieChart, Settings as SettingsIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

export type NavKey = 'home' | 'expenses' | 'statistics' | 'settings'

interface NavItem {
  key: NavKey
  label: string
  icon: ReactNode
  path: string
}

const ITEMS: NavItem[] = [
  { key: 'home', label: 'Home', icon: <Home size={22} strokeWidth={2} />, path: '/' },
  { key: 'expenses', label: 'Expenses', icon: <ListChecks size={22} strokeWidth={2} />, path: '/expenses' },
  { key: 'statistics', label: 'Statistics', icon: <PieChart size={22} strokeWidth={2} />, path: '/statistics' },
  { key: 'settings', label: 'Settings', icon: <SettingsIcon size={22} strokeWidth={2} />, path: '/settings' },
]

interface BottomBarProps {
  active: NavKey
  showFab?: boolean
  fabPath?: string
}

export function BottomBar({ active, showFab = true, fabPath = '/add' }: BottomBarProps) {
  const navigate = useNavigate()

  const handleNav = (item: NavItem) => {
    navigate(item.path)
  }

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 safe-bottom">
      {showFab ? (
        <button
          type="button"
          onClick={() => navigate(fabPath)}
          aria-label="Add expense"
          className="absolute left-1/2 -translate-x-1/2 -top-7 w-14 h-14 rounded-full bg-primary text-white dark:bg-white dark:text-primary shadow-floating flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={26} strokeWidth={2.4} />
        </button>
      ) : null}
      <nav
        className="bg-white dark:bg-card-dark border-t border-border dark:border-border-dark"
        aria-label="Primary"
      >
        <ul className="grid grid-cols-4">
          {ITEMS.map((item) => {
            const isActive = item.key === active
            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => handleNav(item)}
                  className="w-full flex flex-col items-center justify-center gap-1 py-2.5 tap-feedback"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span
                    className={`flex items-center justify-center w-10 h-7 rounded-full transition-colors ${
                      isActive
                        ? 'bg-primary text-white dark:bg-white dark:text-primary'
                        : 'text-muted dark:text-muted-dark'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`text-[11px] font-medium ${
                      isActive
                        ? 'text-primary dark:text-white'
                        : 'text-muted dark:text-muted-dark'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
