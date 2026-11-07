// Форматирование: ru-RU, неразрывный пробел перед ₸ и г.
const NBSP = ' ';
const nf = new Intl.NumberFormat('ru-RU');
const nf4 = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const nf1 = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const kzt = (n: number) => `${nf.format(n)}${NBSP}₸`;
export const signedKzt = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${kzt(Math.abs(n))}`;

/** Граммы на экране — вниз до 0,0001 г от значения в µg. */
export const grams = (ug: number) => `${nf4.format(Math.floor(ug / 100) / 10_000)}${NBSP}г`;

/** Доля в десятых процента → «66,7%». */
export const shareTenths = (t: number) => `${nf1.format(t / 10)}%`;

export const signedPct = (p: number) => `${p > 0 ? '+' : p < 0 ? '−' : ''}${nf2.format(Math.abs(p))}%`;

export const qty = (qtyMinor: number, decimals: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: decimals }).format(qtyMinor / 10 ** decimals);
