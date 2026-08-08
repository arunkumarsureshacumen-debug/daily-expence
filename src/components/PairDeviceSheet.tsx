import { useEffect, useState } from 'react'
import { Check, Copy, Link2, RefreshCw } from 'lucide-react'
import { pairingService } from '../services/pairingService'
import { useAuth } from '../hooks/useAuth'

interface PairDeviceSheetProps {
  open: boolean
  onClose: () => void
}

type Phase = 'menu' | 'show' | 'enter' | 'linking' | 'linked' | 'error'

export function PairDeviceSheet({ open, onClose }: PairDeviceSheetProps) {
  const { deviceId, setDeviceId } = useAuth()
  const [phase, setPhase] = useState<Phase>('menu')
  const [code, setCode] = useState('')
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) {
      setPhase('menu')
      setCode('')
      setInput('')
      setError(null)
      setCopied(false)
    }
  }, [open])

  const handleShow = async () => {
    if (!pairingService.isAvailable()) {
      setError('Firestore is not configured.')
      setPhase('error')
      return
    }
    setPhase('show')
    setError(null)
    try {
      const fresh = await pairingService.createCode(deviceId)
      setCode(fresh)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Could not generate code.')
      setPhase('error')
    }
  }

  const handleEnter = () => {
    setPhase('enter')
    setError(null)
  }

  const handleLink = async () => {
    if (!input.trim()) {
      setError('Please enter the 6-character code.')
      return
    }
    setPhase('linking')
    setError(null)
    try {
      const record = await pairingService.lookupCode(input)
      if (!record) {
        setError('Invalid or expired code. Please double-check.')
        setPhase('error')
        return
      }
      if (record.deviceId === deviceId) {
        setError('You are already paired with that device.')
        setPhase('error')
        return
      }
      setDeviceId(record.deviceId)
      setPhase('linked')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Could not link.')
      setPhase('error')
    }
  }

  const handleCopy = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // fallback: select the text
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-opacity ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <button
        type="button"
        aria-label="Close pairing sheet"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <div
        className={`relative w-full max-w-sm bg-white dark:bg-card-dark rounded-t-3xl sm:rounded-3xl shadow-card p-5 transition-transform ${
          open ? 'translate-y-0' : 'translate-y-4'
        }`}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border dark:bg-border-dark" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-primary dark:text-white">
            Pair another device
          </h3>
          <Link2 size={18} className="text-muted dark:text-muted-dark" />
        </div>

        {phase === 'menu' ? (
          <div className="space-y-2">
            <p className="text-sm text-muted dark:text-muted-dark mb-3">
              Sync this device with another phone or laptop without an account.
              Generate a code on one device, enter it on the other.
            </p>
            <button
              type="button"
              onClick={handleShow}
              className="w-full p-4 rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark text-left tap-feedback"
            >
              <p className="font-medium text-primary dark:text-white">
                Show my pairing code
              </p>
              <p className="text-xs text-muted dark:text-muted-dark mt-1">
                Use this on the device that already has your data.
              </p>
            </button>
            <button
              type="button"
              onClick={handleEnter}
              className="w-full p-4 rounded-2xl bg-white dark:bg-card-dark border border-border dark:border-border-dark text-left tap-feedback"
            >
              <p className="font-medium text-primary dark:text-white">
                I have a pairing code
              </p>
              <p className="text-xs text-muted dark:text-muted-dark mt-1">
                Enter the code from your other device.
              </p>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full h-11 mt-2 rounded-2xl text-sm font-medium text-muted dark:text-muted-dark tap-feedback"
            >
              Cancel
            </button>
          </div>
        ) : null}

        {phase === 'show' && code ? (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm text-muted dark:text-muted-dark">
              Enter this code on the other device.
            </p>
            <div className="rounded-2xl bg-bg dark:bg-bg-dark border border-border dark:border-border-dark p-5 text-center">
              <p className="text-3xl font-bold tracking-widest text-primary dark:text-white select-all">
                {code}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="w-full h-11 rounded-2xl border border-border dark:border-border-dark text-primary dark:text-white font-medium inline-flex items-center justify-center gap-2 tap-feedback"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy code'}
            </button>
            <button
              type="button"
              onClick={() => setPhase('menu')}
              className="w-full h-11 rounded-2xl text-sm font-medium text-muted dark:text-muted-dark tap-feedback"
            >
              Back
            </button>
          </div>
        ) : null}

        {phase === 'show' && !code ? (
          <div className="py-8 text-center">
            <RefreshCw size={22} className="mx-auto animate-spin text-muted" />
            <p className="mt-2 text-sm text-muted dark:text-muted-dark">
              Generating code…
            </p>
          </div>
        ) : null}

        {phase === 'enter' || phase === 'linking' || phase === 'error' ? (
          <div className="space-y-3 animate-fade-in">
            <label className="text-xs font-medium text-muted dark:text-muted-dark">
              Pairing code
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(pairingService.normalizeCode(e.target.value))
                setError(null)
                if (phase === 'error') setPhase('enter')
              }}
              placeholder="A7K9-X3"
              maxLength={7}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="w-full h-12 px-4 rounded-2xl border border-border dark:border-border-dark bg-white dark:bg-card-dark text-primary dark:text-white text-center text-lg font-bold tracking-widest outline-none focus:border-primary dark:focus:border-white"
            />
            {error ? (
              <p className="text-sm text-expense" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              onClick={handleLink}
              disabled={phase === 'linking'}
              className="w-full h-12 rounded-2xl bg-primary text-white dark:bg-white dark:text-primary font-semibold tap-feedback disabled:opacity-60"
            >
              {phase === 'linking' ? 'Linking…' : 'Connect'}
            </button>
            <button
              type="button"
              onClick={() => setPhase('menu')}
              className="w-full h-11 rounded-2xl text-sm font-medium text-muted dark:text-muted-dark tap-feedback"
            >
              Back
            </button>
          </div>
        ) : null}

        {phase === 'linked' ? (
          <div className="space-y-3 animate-fade-in">
            <div className="rounded-2xl border border-success/30 bg-success/5 dark:bg-success/10 p-4">
              <div className="flex items-center gap-2">
                <Check size={18} className="text-success" />
                <p className="font-semibold text-primary dark:text-white">
                  Devices paired!
                </p>
              </div>
              <p className="text-xs text-muted dark:text-muted-dark mt-1">
                Reload to pull all data from the other device.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full h-12 rounded-2xl bg-primary text-white dark:bg-white dark:text-primary font-semibold tap-feedback"
            >
              Reload now
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full h-11 rounded-2xl text-sm font-medium text-muted dark:text-muted-dark tap-feedback"
            >
              Later
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
