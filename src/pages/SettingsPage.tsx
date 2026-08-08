import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronRight,
  CircleUserRound,
  Cloud,
  CloudOff,
  Download,
  Globe,
  Moon,
  Palette,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  Wallet,
} from 'lucide-react'
import { Header } from '../components/Header'
import { ListRow, Section } from '../components/Section'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Notice } from '../components/Notice'
import { useSettings } from '../hooks/useSettings'
import { useExpenses } from '../hooks/useExpenses'
import { useAuth } from '../hooks/useAuth'
import type { CurrencyCode } from '../types/expense'
import { formatCurrency } from '../utils/currency'
import { storageService } from '../services/storageService'

const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
]

const APP_VERSION = '1.2.0'

export function SettingsPage() {
  const { settings, setBudget, setCurrency, setTheme, updateSettings } = useSettings()
  const { expenses, clearAll, importExpenses } = useExpenses()
  const { isConfigured, isReady, uid, error: authError } = useAuth()
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false)
  const [budgetDraft, setBudgetDraft] = useState<string>(
    String(settings.monthlyBudget),
  )
  const [confirmClear, setConfirmClear] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    setBudgetDraft(String(settings.monthlyBudget))
  }, [settings.monthlyBudget])

  const handleExport = () => {
    const data = storageService.exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expenses-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = storageService.importData(String(reader.result ?? ''))
      if (result) {
        importExpenses(result.expenses)
        updateSettings(result.settings)
        setBudgetDraft(String(result.settings.monthlyBudget))
      } else {
        alert('Could not import file. Please choose a valid backup.')
      }
    }
    reader.readAsText(file)
  }

  const themeLabel =
    settings.theme === 'system'
      ? 'System'
      : settings.theme === 'dark'
        ? 'Dark'
        : 'Light'

  const syncLabel = useMemo(() => {
    if (!isConfigured) return 'Not configured'
    if (authError) return 'Sync error'
    if (!isReady) return 'Connecting…'
    return `Synced · device ${uid?.slice(0, 6) ?? '…'}`
  }, [isConfigured, isReady, uid, authError])

  const SyncIcon = !isConfigured || authError ? CloudOff : Cloud

  return (
    <div className="pb-24 animate-fade-in" key={reloadKey}>
      <Header title="Settings" />

      <div className="pt-2">
        {authError === 'auth/configuration-not-found' ? (
          <div className="px-4 pt-4">
            <Notice
              tone="warning"
              title="Cloud sync is paused"
              description={
                <>
                  <strong>Anonymous sign-in</strong> is not enabled in your
                  Firebase project, so Firestore sync is failing.
                  <br />
                  <span className="block mt-1">
                    Firebase Console → <em>Authentication</em> →{' '}
                    <em>Sign-in method</em> → enable <strong>Anonymous</strong>.
                  </span>
                  <span className="block mt-1">
                    Your data is safe on this device and will sync as soon as
                    you enable it and reload.
                  </span>
                </>
              }
              action={
                <button
                  type="button"
                  onClick={() => {
                    setReloadKey((k) => k + 1)
                    window.location.reload()
                  }}
                  className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-primary text-white dark:bg-white dark:text-primary text-xs font-medium tap-feedback"
                >
                  <RefreshCw size={14} />
                  Reload after enabling
                </button>
              }
            />
          </div>
        ) : null}

        {authError === 'auth/network-request-failed' ? (
          <div className="px-4 pt-4">
            <Notice
              tone="info"
              title="Offline"
              description="Cloud sync is paused while you're offline. Changes are saved locally and will sync when you're back online."
            />
          </div>
        ) : null}

        <Section title="Profile">
          <div className="rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark overflow-hidden">
            <ListRow
              icon={<CircleUserRound size={18} />}
              label="Personal"
              value="Local only"
            />
            <ListRow
              icon={<SyncIcon size={18} />}
              label="Cloud Sync"
              value={syncLabel}
            />
            <ListRow
              icon={<ShieldCheck size={18} />}
              label="Privacy"
              value="Stored locally + cloud"
            />
          </div>
          <p className="mt-2 text-xs text-muted dark:text-muted-dark px-1">
            Your expense data is stored locally on this device and synced to
            Firestore. Nothing is shared with anyone.
          </p>
        </Section>

        <Section title="Preferences">
          <div className="rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark overflow-hidden">
            <ListRow
              icon={<Globe size={18} />}
              label="Currency"
              value={
                CURRENCIES.find((c) => c.code === settings.currency)
                  ? `${CURRENCIES.find((c) => c.code === settings.currency)?.symbol} ${settings.currency}`
                  : settings.currency
              }
              onClick={() => setCurrencyPickerOpen(true)}
            />
            <ListRow
              icon={<Wallet size={18} />}
              label="Monthly Budget"
              value={formatCurrency(settings.monthlyBudget, settings.currency)}
              onClick={() => {
                const next = window.prompt(
                  'Set your monthly budget',
                  String(settings.monthlyBudget),
                )
                if (next === null) return
                const num = Number(next)
                if (!Number.isFinite(num) || num < 0) {
                  alert('Please enter a valid amount.')
                  return
                }
                setBudget(num)
                setBudgetDraft(String(num))
              }}
            />
            <ListRow
              icon={<Moon size={18} />}
              label="Theme"
              value={themeLabel}
              onClick={() => {
                const order: Array<'light' | 'dark' | 'system'> = [
                  'light',
                  'dark',
                  'system',
                ]
                const next = order[(order.indexOf(settings.theme) + 1) % order.length]
                setTheme(next)
              }}
            />
            <ListRow
              icon={<Palette size={18} />}
              label="Appearance"
              value={themeLabel}
            />
          </div>
          <div className="mt-2">
            <label className="text-xs font-medium text-muted dark:text-muted-dark">
              Budget
            </label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={budgetDraft}
              onChange={(e) => setBudgetDraft(e.target.value)}
              onBlur={() => {
                const num = Number(budgetDraft)
                if (Number.isFinite(num) && num >= 0) setBudget(num)
                else setBudgetDraft(String(settings.monthlyBudget))
              }}
              className="mt-1 w-full h-11 px-4 rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark text-primary dark:text-white outline-none focus:border-primary dark:focus:border-white"
            />
          </div>
        </Section>

        <Section title="Data">
          <div className="rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark overflow-hidden">
            <ListRow
              icon={<Download size={18} />}
              label="Export Expenses"
              value={`${expenses.length} entries`}
              onClick={handleExport}
            />
            <ListRow
              icon={<Upload size={18} />}
              label="Import Expenses"
              onClick={() => fileRef.current?.click()}
            />
            <ListRow
              icon={<Trash2 size={18} />}
              label="Clear All Data"
              value=""
              onClick={() => setConfirmClear(true)}
            />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImport(file)
              e.target.value = ''
            }}
          />
        </Section>

        <Section title="About">
          <div className="rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark overflow-hidden">
            <ListRow label="App Version" value={`v${APP_VERSION}`} />
            <ListRow label="Made with" value="React · Vite · Firebase" />
          </div>
        </Section>

        <div className="px-4 pt-2 pb-2 text-center">
          <p className="text-xs text-muted dark:text-muted-dark">
            Daily Expense Tracker · Built for mobile
          </p>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-opacity ${
          currencyPickerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          type="button"
          aria-label="Close currency picker"
          onClick={() => setCurrencyPickerOpen(false)}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        <div
          className={`relative w-full max-w-sm bg-white dark:bg-card-dark rounded-t-3xl sm:rounded-3xl shadow-card p-5 mb-0 sm:mb-0 transition-transform ${
            currencyPickerOpen ? 'translate-y-0' : 'translate-y-4'
          }`}
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border dark:bg-border-dark" />
          <h3 className="text-base font-semibold text-primary dark:text-white mb-3">
            Currency
          </h3>
          <ul className="max-h-72 overflow-y-auto no-scrollbar">
            {CURRENCIES.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrency(c.code)
                    setCurrencyPickerOpen(false)
                  }}
                  className="w-full flex items-center gap-3 py-3 px-2 rounded-xl tap-feedback"
                >
                  <span className="w-9 h-9 rounded-xl bg-bg dark:bg-bg-dark flex items-center justify-center font-bold text-primary dark:text-white">
                    {c.symbol}
                  </span>
                  <span className="flex-1 text-left text-sm font-medium text-primary dark:text-white">
                    {c.label}
                  </span>
                  <span className="text-xs text-muted dark:text-muted-dark">
                    {c.code}
                  </span>
                  {settings.currency === c.code ? (
                    <ChevronRight size={16} className="text-primary dark:text-white" />
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Clear all data?"
        description="This permanently deletes all expenses and resets settings on this device and in the cloud."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          clearAll()
          setConfirmClear(false)
        }}
        onCancel={() => setConfirmClear(false)}
      />

      <div className="h-24" />
    </div>
  )
}
