import {
  browserLocalPersistence,
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from './firebase'

let signInPromise: Promise<User | null> | null = null

async function ensureAnonymousSignIn(): Promise<User | null> {
  if (!auth) return null
  if (signInPromise) return signInPromise
  signInPromise = (async () => {
    try {
      await auth.setPersistence(browserLocalPersistence)
      if (auth.currentUser) return auth.currentUser
      const cred = await signInAnonymously(auth)
      return cred.user
    } catch (err) {
      console.error('[Firebase] anonymous sign-in failed', err)
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
}
