import type { CurrencyCode } from '../types/expense'

const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
  AUD: 'en-AU',
  CAD: 'en-CA',
}

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'INR',
  options: { compact?: boolean; withSymbol?: boolean } = {},
): string {
  const { compact = false, withSymbol = true } = options
  try {
    const formatter = new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
      style: withSymbol ? 'currency' : 'decimal',
      currency,
      maximumFractionDigits: compact ? 1 : 2,
      minimumFractionDigits: 0,
      notation: compact ? 'compact' : 'standard',
    })
    return formatter.format(amount)
  } catch {
    const symbol = CURRENCY_SYMBOLS[currency]
    const num = compact
      ? Intl.NumberFormat('en-US', { notation: 'compact' }).format(amount)
      : amount.toLocaleString('en-IN')
    return withSymbol ? `${symbol}${num}` : num
  }
}

export function getCurrencySymbol(currency: CurrencyCode = 'INR'): string {
  return CURRENCY_SYMBOLS[currency] ?? '₹'
}
