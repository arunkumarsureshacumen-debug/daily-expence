const DEVICE_ID_KEY = 'det.device.id.v1'

function randomDeviceId(): string {
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
  return `d_${uuid.replace(/-/g, '').slice(0, 24)}`
}

export const deviceService = {
  getDeviceId(): string | null {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(DEVICE_ID_KEY)
  },

  getOrCreateDeviceId(): string {
    const existing = this.getDeviceId()
    if (existing) return existing
    const fresh = randomDeviceId()
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DEVICE_ID_KEY, fresh)
    }
    return fresh
  },

  clearDeviceId(): void {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(DEVICE_ID_KEY)
  },
}
