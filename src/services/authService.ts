import {
  browserLocalPersistence,
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from './firebase'

type AuthErrorCode =
  | 'auth/configuration-not-found'
  | 'auth/network-request-failed'
  | 'auth/too-many-requests'
  | 'unknown'

function classifyAuthError(err: unknown): AuthErrorCode {
  if (!err || typeof err !== 'object') return 'unknown'
  const code = (err as { code?: string }).code
  switch (code) {
    case 'auth/configuration-not-found':
    case 'auth/operation-not-allowed':
      return 'auth/configuration-not-found'
    case 'auth/network-request-failed':
      return 'auth/network-request-failed'
    case 'auth/too-many-requests':
      return 'auth/too-many-requests'
    default:
      return 'unknown'
  }
}

let signInPromise: Promise<User | null> | null = null
let lastError: AuthErrorCode | null = null
const errorListeners = new Set<(code: AuthErrorCode | null) => void>()

function notifyError(code: AuthErrorCode | null) {
  lastError = code
  errorListeners.forEach((cb) => cb(code))
}

async function ensureAnonymousSignIn(): Promise<User | null> {
  if (!auth) return null
  if (signInPromise) return signInPromise
  signInPromise = (async () => {
    try {
      await auth.setPersistence(browserLocalPersistence)
      if (auth.currentUser) return auth.currentUser
      const cred = await signInAnonymously(auth)
      notifyError(null)
      return cred.user
    } catch (err) {
      const code = classifyAuthError(err)
      if (code === 'auth/configuration-not-found') {
        console.warn(
          '[Firebase] Anonymous sign-in is not enabled.\n' +
            'Enable it at: Firebase Console → Authentication → Sign-in method → Anonymous.',
        )
      } else {
        console.error('[Firebase] anonymous sign-in failed', err)
      }
      notifyError(code)
      signInPromise = null
      return null
    }
  })()
  return signInPromise
}

export const authService = {
  isConfigured: isFirebaseConfigured,

  isAvailable(): boolean {
    return isFirebaseConfigured && auth !== null
  },

  ensureSignedIn(): Promise<User | null> {
    return ensureAnonymousSignIn()
  },

  observeAuth(callback: (user: User | null) => void): () => void {
    if (!auth) {
      callback(null)
      return () => undefined
    }
    void ensureAnonymousSignIn()
    return onAuthStateChanged(auth, callback)
  },

  getLastError(): AuthErrorCode | null {
    return lastError
  },

  observeError(callback: (code: AuthErrorCode | null) => void): () => void {
    errorListeners.add(callback)
    callback(lastError)
    return () => {
      errorListeners.delete(callback)
    }
  },
}

export type { AuthErrorCode }
