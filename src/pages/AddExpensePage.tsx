import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { ExpenseForm } from '../components/ExpenseForm'
import { useExpenses } from '../hooks/useExpenses'
import { useSettings } from '../hooks/useSettings'
import { currentTimeString } from '../utils/date'

export function AddExpensePage() {
  const navigate = useNavigate()
  const { addExpense } = useExpenses()
  const { settings } = useSettings()

  return (
    <div className="pb-24 animate-slide-up">
      <Header title="Add Expense" onBack={() => navigate(-1)} />
      <div className="pt-2">
        <ExpenseForm
          currency={settings.currency}
          onSubmit={(values) => {
            addExpense({
              ...values,
              time: currentTimeString(),
            })
            navigate('/')
          }}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  )
}
