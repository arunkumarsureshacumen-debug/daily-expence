import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [show, setShow] = useState(open)

  useEffect(() => {
    if (open) {
      setShow(true)
      return
    }
    const t = window.setTimeout(() => setShow(false), 180)
    return () => window.clearTimeout(t)
  }, [open])

  if (!show) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 transition-opacity duration-200 ${
        open ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onCancel}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <div
        className={`relative w-full max-w-sm bg-white dark:bg-card-dark rounded-3xl shadow-card p-6 mb-6 sm:mb-0 transition-transform duration-200 ${
          open ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'
        }`}
      >
        <div className="flex flex-col items-center text-center">
          {destructive ? (
            <div className="w-12 h-12 rounded-2xl bg-expense/10 flex items-center justify-center mb-3">
              <AlertTriangle size={22} className="text-expense" />
            </div>
          ) : null}
          <h2 className="text-base font-semibold text-primary dark:text-white">
            {title}
          </h2>
          {description ? (
            <p className="text-sm text-muted dark:text-muted-dark mt-1">
              {description}
            </p>
          ) : null}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-xl border border-border dark:border-border-dark text-primary dark:text-white font-medium tap-feedback"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-11 rounded-xl text-white font-medium tap-feedback ${
              destructive ? 'bg-expense' : 'bg-primary dark:bg-white dark:text-primary'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
