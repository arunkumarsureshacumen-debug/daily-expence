import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'

const PAIRING_COLLECTION = 'pairing'
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCode(): string {
  const chars = CODE_ALPHABET
  let code = ''
  const random = new Uint32Array(6)
  if (typeof crypto !== 'undefined') crypto.getRandomValues(random)
  for (let i = 0; i < 6; i++) {
    const r = (random[i] ?? Math.floor(Math.random() * chars.length)) % chars.length
    code += chars[r]
  }
  return `${code.slice(0, 3)}-${code.slice(3)}`
}

function normalizeCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6)
}

export interface PairingRecord {
  deviceId: string
  createdAt: number
}

export const pairingService = {
  isAvailable(): boolean {
    return db !== null
  },

  async createCode(deviceId: string): Promise<string> {
    if (!db) throw new Error('Firestore is not initialized')
    for (let attempt = 0; attempt < 8; attempt++) {
      const code = generateCode().replace('-', '')
      const ref = doc(db, PAIRING_COLLECTION, code)
      const existing = await getDoc(ref)
      if (!existing.exists()) {
        await setDoc(ref, {
          deviceId,
          createdAt: serverTimestamp(),
        })
        return `${code.slice(0, 3)}-${code.slice(3)}`
      }
    }
    throw new Error('Could not generate a unique pairing code. Try again.')
  },

  async lookupCode(code: string): Promise<PairingRecord | null> {
    if (!db) return null
    const normalized = normalizeCode(code)
    if (normalized.length !== 6) return null
    const ref = doc(db, PAIRING_COLLECTION, normalized)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    const data = snap.data() as { deviceId?: unknown; createdAt?: unknown }
    if (typeof data.deviceId !== 'string') return null
    const createdAt =
      data.createdAt &&
      typeof (data.createdAt as { toMillis?: () => number }).toMillis === 'function'
        ? (data.createdAt as { toMillis: () => number }).toMillis()
        : Date.now()
    return { deviceId: data.deviceId, createdAt }
  },

  async countActiveCodes(): Promise<number> {
    if (!db) return 0
    const q = query(collection(db, PAIRING_COLLECTION), limit(500))
    const snap = await getDocs(q)
    return snap.size
  },

  normalizeCode,
}
