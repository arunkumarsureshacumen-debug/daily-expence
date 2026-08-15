import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from './firebase'

type AuthErrorCode =
  | 'auth/configuration-not-found'
  | 'auth/network-request-failed'
  | 'auth/too-many-requests'
  | 'auth/invalid-email'
  | 'auth/missing-password'
  | 'auth/invalid-credential'
  | 'auth/email-already-in-use'
  | 'auth/weak-password'
  | 'auth/user-disabled'
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
    case 'auth/invalid-email':
      return 'auth/invalid-email'
    case 'auth/missing-password':
      return 'auth/missing-password'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'auth/invalid-credential'
    case 'auth/email-already-in-use':
      return 'auth/email-already-in-use'
    case 'auth/weak-password':
      return 'auth/weak-password'
    case 'auth/user-disabled':
      return 'auth/user-disabled'
    default:
      return 'unknown'
  }
}

export function authErrorMessage(code: AuthErrorCode | null): string | null {
  if (!code) return null
  switch (code) {
    case 'auth/configuration-not-found':
      return 'Email/password sign-in is not enabled in Firebase. Enable it in Authentication → Sign-in method.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/missing-password':
      return 'Please enter your password.'
    case 'auth/invalid-credential':
      return 'Incorrect email or password.'
    case 'auth/email-already-in-use':
      return 'An account already exists for that email. Try signing in.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'unknown':
      return 'Something went wrong. Please try again.'
    default:
      return 'Something went wrong. Please try again.'
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

  async signUpWithEmail(email: string, password: string): Promise<User | null> {
    if (!auth) return null
    try {
      await auth.setPersistence(browserLocalPersistence)
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      notifyError(null)
      signInPromise = null
      return cred.user
    } catch (err) {
      const code = classifyAuthError(err)
      console.error('[Firebase] sign-up failed', err)
      notifyError(code)
      throw err
    }
  },

  async signInWithEmail(email: string, password: string): Promise<User | null> {
    if (!auth) return null
    try {
      await auth.setPersistence(browserLocalPersistence)
      const cred = await signInWithEmailAndPassword(auth, email, password)
      notifyError(null)
      signInPromise = null
      return cred.user
    } catch (err) {
      const code = classifyAuthError(err)
      console.error('[Firebase] sign-in failed', err)
      notifyError(code)
      throw err
    }
  },

  async signInAnonymously(): Promise<User | null> {
    return ensureAnonymousSignIn()
  },

  async signOut(): Promise<void> {
    if (!auth) return
    try {
      await firebaseSignOut(auth)
      signInPromise = null
      notifyError(null)
    } catch (err) {
      const code = classifyAuthError(err)
      console.error('[Firebase] sign-out failed', err)
      notifyError(code)
      throw err
    }
  },

  observeAuth(callback: (user: User | null) => void): () => void {
    if (!auth) {
      callback(null)
      return () => undefined
    }
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