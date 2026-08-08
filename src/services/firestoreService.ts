import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import type { Expense, Settings } from '../types/expense'
import { db } from './firebase'

const EXPENSES_COLLECTION = 'expenses'
const SETTINGS_DOC = 'settings'

function expensesRef(ownerId: string) {
  if (!db) throw new Error('Firestore is not initialized')
  return collection(db, 'users', ownerId, EXPENSES_COLLECTION)
}

function settingsRef(ownerId: string) {
  if (!db) throw new Error('Firestore is not initialized')
  return doc(db, 'users', ownerId, SETTINGS_DOC, 'main')
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    if (value !== undefined) result[key] = value
  }
  return result as T
}

export const firestoreService = {
  isAvailable(): boolean {
    return db !== null
  },

  async fetchExpenses(ownerId: string): Promise<Expense[]> {
    if (!db) return []
    const snap = await getDocs(expensesRef(ownerId))
    return snap.docs
      .map((d) => {
        const data = d.data() as Partial<Expense> & { updatedAt?: unknown }
        return {
          id: d.id,
          amount: Number(data.amount ?? 0),
          category: (data.category ?? 'Other') as Expense['category'],
          description: String(data.description ?? ''),
          date: String(data.date ?? ''),
          time: String(data.time ?? ''),
          paymentMethod: (data.paymentMethod ?? 'Cash') as Expense['paymentMethod'],
          createdAt:
            typeof data.createdAt === 'string'
              ? data.createdAt
              : new Date().toISOString(),
        } satisfies Expense
      })
      .filter((e) => e.id && e.date)
  },

  async putExpense(ownerId: string, expense: Expense): Promise<void> {
    if (!db) return
    await setDoc(
      doc(expensesRef(ownerId), expense.id),
      stripUndefined({
        ...expense,
        updatedAt: serverTimestamp(),
      }),
      { merge: true },
    )
  },

  async deleteExpenseDoc(ownerId: string, id: string): Promise<void> {
    if (!db) return
    await deleteDoc(doc(expensesRef(ownerId), id))
  },

  async replaceAllExpenses(
    ownerId: string,
    expenses: Expense[],
  ): Promise<void> {
    if (!db || expenses.length === 0) return
    const batch = writeBatch(db)
    for (const expense of expenses) {
      batch.set(
        doc(expensesRef(ownerId), expense.id),
        stripUndefined({
          ...expense,
          updatedAt: serverTimestamp(),
        }),
        { merge: true },
      )
    }
    await batch.commit()
  },

  async clearExpenses(ownerId: string): Promise<void> {
    if (!db) return
    const snap = await getDocs(expensesRef(ownerId))
    if (snap.empty) return
    const batch = writeBatch(db)
    snap.docs.forEach((d) => batch.delete(d.ref))
    await batch.commit()
  },

  async fetchSettings(ownerId: string): Promise<Settings | null> {
    if (!db) return null
    const docSnap = await getDoc(settingsRef(ownerId))
    if (!docSnap.exists()) return null
    const data = docSnap.data() as Partial<Settings>
    if (
      typeof data.currency !== 'string' ||
      typeof data.monthlyBudget !== 'number' ||
      typeof data.theme !== 'string'
    ) {
      return null
    }
    return {
      currency: data.currency as Settings['currency'],
      monthlyBudget: data.monthlyBudget,
      theme: data.theme as Settings['theme'],
    }
  },

  async putSettings(ownerId: string, settings: Settings): Promise<void> {
    if (!db) return
    await setDoc(
      settingsRef(ownerId),
      stripUndefined({
        ...settings,
        updatedAt: serverTimestamp(),
      }),
      { merge: true },
    )
  },
}
