// Чистые функции расчётов. Никаких float в учёте: ₸ — целые, граммы — целые µg.

export const UG_PER_G = 1_000_000;

/** Стоимость µg по цене за грамм, вниз (консервативно). */
export function valueUg(ug: number, pricePerG: number): number {
  return Math.floor((ug * pricePerG) / UG_PER_G);
}

export interface BuyCalc { amount: number; fee: number; net: number; ug: number; sellNow: number }

/** Покупка: комиссия внутри суммы, граммы вниз до µg, «если продать сразу» — от реестра. */
export function quoteBuy(amount: number, ask: number, bid: number, feeBp = 100): BuyCalc {
  const fee = Math.round((amount * feeBp) / 10_000);
  const net = Math.max(0, amount - fee);
  const ug = Math.floor((net * UG_PER_G) / ask);
  return { amount, fee, net, ug, sellNow: valueUg(ug, bid) };
}

export function quoteSell(ug: number, bid: number, feeBp = 0) {
  const gross = valueUg(ug, bid);
  const fee = Math.round((gross * feeBp) / 10_000);
  return { gross, fee, receive: gross - fee };
}

/**
 * Продажа под желаемую сумму в ₸: граммы вверх до µg (чтобы получить не меньше цели),
 * но не больше, чем есть. К получению — вниз.
 */
export function sellForKzt(target: number, holdingUg: number, bid: number, feeBp = 0) {
  const need = Math.ceil((target * UG_PER_G) / bid);
  const ug = Math.max(0, Math.min(holdingUg, need));
  const { gross, fee, receive } = quoteSell(ug, bid, feeBp);
  return { ug, gross, fee, receive, remainingUg: holdingUg - ug, max: quoteSell(holdingUg, bid, feeBp).receive };
}

export interface CashbackRules { baseBp: number; cap: number; merchantBp: number }

/** Кешбэк за месяц в ₸: базовый с потолком + повышенный у мерчантов вне потолка. */
export function cashbackMonth(spend: number, merchantSpend: number, r: CashbackRules) {
  const base = Math.min(Math.round((spend * r.baseBp) / 10_000), r.cap);
  const bonus = Math.round((merchantSpend * r.merchantBp) / 10_000);
  return { base, bonus, total: base + bonus };
}

/** Конвертация кешбэка в граммы по курсу покупки, без комиссии 1%. */
export function cashbackToGold(kzt: number, ask: number, bid: number) {
  const ug = Math.floor((kzt * UG_PER_G) / ask);
  return { ug, sellNow: valueUg(ug, bid) };
}

export function holdingValue(qtyMinor: number, decimals: number, price: number): number {
  return Math.floor((qtyMinor * price) / 10 ** decimals);
}

/** Метод наибольшего остатка: доли в десятых процента, сумма ровно scale. */
export function largestRemainder(values: number[], scale = 1000): number[] {
  const total = values.reduce((a, b) => a + b, 0);
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((v) => (v * scale) / total);
  const out = raw.map(Math.floor);
  let rest = scale - out.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r), v: values[i] }))
    .sort((a, b) => b.frac - a.frac || b.v - a.v);
  for (const { i } of order) {
    if (rest <= 0) break;
    out[i] += 1;
    rest -= 1;
  }
  return out;
}

export interface PortfolioView {
  available: number; gold: number; partners: number; total: number; inApp: number;
  shares: { kzt: number; gold: number; partners: number }; // десятые доли процента
}

export function portfolio(kzt: number, goldUg: number, goldBid: number, partners: number): PortfolioView {
  const gold = valueUg(goldUg, goldBid);
  const total = kzt + gold + partners;
  const [s1, s2, s3] = largestRemainder([kzt, gold, partners]);
  return { available: kzt, gold, partners, total, inApp: kzt + gold, shares: { kzt: s1, gold: s2, partners: s3 } };
}

export type BuyCheck =
  | { kind: 'ok' }
  | { kind: 'min'; min: number }
  | { kind: 'limit'; available: number; limit: number }
  | { kind: 'balance'; short: number }
  | { kind: 'warn'; pct: number };

/** Порядок проверок: минимум → условный лимит → баланс (E2) → W1 (> 50% тенге). */
export function validateBuy(
  amount: number,
  ctx: { kzt: number; spentToday: number; min: number; dailyLimit: number; warnShare?: number },
): BuyCheck {
  if (!Number.isFinite(amount) || amount < ctx.min) return { kind: 'min', min: ctx.min };
  const available = Math.max(0, ctx.dailyLimit - ctx.spentToday);
  if (amount > available) return { kind: 'limit', available, limit: ctx.dailyLimit };
  if (amount > ctx.kzt) return { kind: 'balance', short: amount - ctx.kzt };
  if (amount > ctx.kzt * (ctx.warnShare ?? 0.5)) return { kind: 'warn', pct: Math.round((amount / ctx.kzt) * 100) };
  return { kind: 'ok' };
}

/** Изменение в процентах, для подписи «ориентировочно». */
export function changePct(now: number, before: number): number {
  return before ? ((now - before) / before) * 100 : 0;
}
