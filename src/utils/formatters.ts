import { CurrencyConfig } from '../types/finance';

export const AVAILABLE_CURRENCIES: CurrencyConfig[] = [
  { code: 'CLP', symbol: '$', name: 'Peso Chileno (CLP)' },
  { code: 'USD', symbol: 'US$', name: 'Dólar (USD)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'UF', symbol: 'UF', name: 'Unidad de Fomento (UF)' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino (ARS)' },
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano (PEN)' },
];

export function formatCurrency(amount: number, currency: CurrencyConfig = AVAILABLE_CURRENCIES[0]): string {
  // In Chile (CLP), currency values do not use decimals
  const isZeroDecimal = currency.code === 'CLP' || currency.code === 'UF';

  const formattedNumber = new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: isZeroDecimal ? 0 : 2,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  }).format(Math.round(isZeroDecimal ? amount : amount * 100) / (isZeroDecimal ? 1 : 100));

  if (currency.code === 'CLP') {
    return `$${formattedNumber}`;
  }
  if (currency.code === 'UF') {
    return `${formattedNumber} UF`;
  }
  return `${currency.symbol} ${formattedNumber}`;
}

export function formatDateSpanish(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getMonthName(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  const monthName = date.toLocaleDateString('es-CL', { month: 'long' });
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
}
