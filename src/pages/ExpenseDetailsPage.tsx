import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { Header } from '../components/Header'
import { ExpenseForm } from '../components/ExpenseForm'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useExpenses } from '../hooks/useExpenses'
import { useSettings } from '../hooks/useSettings'
import { getCategoryMeta } from '../utils/calculations'
import { formatCurrency } from '../utils/currency'
import { formatFullDate, formatTime } from '../utils/date'

export function ExpenseDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { expenses, deleteExpense, updateExpense } = useExpenses()
  const { settings } = useSettings()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editing, setEditing] = useState(false)

  const expense = expenses.find((e) => e.id === id)

  if (!expense) {
    return (
      <div className="pb-24 animate-fade-in">
        <Header title="Expense" onBack={() => navigate(-1)} />
        <div className="px-4 py-10 text-center">
          <p className="text-sm text-muted dark:text-muted-dark">
            This expense could not be found. It may have been deleted.
          </p>
          <button
            type="button"
            onClick={() => navigate('/expenses')}
            className="mt-4 px-4 h-10 rounded-full bg-primary text-white dark:bg-white dark:text-primary font-medium tap-feedback"
          >
            Back to expenses
          </button>
        </div>
      </div>
    )
  }

  const meta = getCategoryMeta(expense.category)

  if (editing) {
    return (
      <div className="pb-24 animate-slide-up">
        <Header title="Edit Expense" onBack={() => setEditing(false)} />
        <ExpenseForm
          currency={settings.currency}
          initial={expense}
          submitLabel="Save Changes"
          autoFocusAmount={false}
          onSubmit={(values) => {
            updateExpense(expense.id, values)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="pb-24 animate-fade-in">
      <Header title="Expense" onBack={() => navigate(-1)} />

      <div className="px-4 pt-6">
        <div className="rounded-3xl bg-primary text-white dark:bg-white dark:text-primary p-6 text-center shadow-card">
          <span
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 text-2xl"
            style={{ backgroundColor: meta.color, color: '#fff' }}
            aria-hidden="true"
          >
            {meta.emoji}
          </span>
          <p className="text-3xl font-extrabold">
            {formatCurrency(expense.amount, settings.currency)}
          </p>
          <p className="mt-1 text-sm opacity-90">
            {expense.description || expense.category}
          </p>
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark overflow-hidden">
          <DetailRow label="Category" value={expense.category} />
          {expense.description ? (
            <DetailRow label="Description" value={expense.description} />
          ) : null}
          <DetailRow label="Date" value={formatFullDate(expense.date)} />
          <DetailRow label="Time" value={formatTime(expense.time)} />
          <DetailRow label="Payment method" value={expense.paymentMethod} />
          <DetailRow
            label="Created"
            value={new Date(expense.createdAt).toLocaleString()}
          />
        </div>
      </div>

      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="h-12 rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark text-primary dark:text-white font-semibold inline-flex items-center justify-center gap-2 tap-feedback"
        >
          <Pencil size={16} />
          Edit
        </button>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="h-12 rounded-2xl bg-expense text-white font-semibold inline-flex items-center justify-center gap-2 tap-feedback"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete expense?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          deleteExpense(expense.id)
          setConfirmDelete(false)
          navigate('/expenses')
        }}
        onCancel={() => setConfirmDelete(false)}
      />

      <div className="h-24" />
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-border-dark last:border-b-0">
      <span className="text-xs text-muted dark:text-muted-dark">{label}</span>
      <span className="text-sm font-medium text-primary dark:text-white text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  )
}
